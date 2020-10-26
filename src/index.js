import axios from 'axios'
import {transactionType} from "./dex";
import {getTotalTransactions, isDexAccount, isLimitOrder, isMarketOrder} from "./utils";
import {QueryBuilder} from "./query-builder"
import {getDefaultLogger} from "./logger";
import {ClientOptionsBuilder} from "./client-options";
import Parallel from "paralleljs";

/**
 * Used to query node health/status
 * *
 * @param options
 * returns node status for given hostname/ip address
 */

const logger = getDefaultLogger();

export async function getNodeStatus(options) {
    try {
        const response = await axios.get(QueryBuilder(options).buildStatusUrl());
        return response.data;
    } catch (error) {
        logger.error(error);
    }
}

export async function getDexMarkets(options) {
    let dexWallets = await getMultiSignatureDexWallets(options);
    let dexMarkets = [];
    for await (let dexWallet of dexWallets) {
        dexMarkets.push(dexWallet);
    }
    return dexMarkets;
}

export async function getDexMarketPairsUsingWorkers(options) {
    let totalTransactionsCount = await getTotalTransactions(options);
    if (options.transactionLimit < totalTransactionsCount) {
        totalTransactionsCount = options.transactionLimit;
    }

    const runWorkers = (fromTransactions, transactionLimit) => {
        const workerOptions = buildParallelOptions(fromTransactions, transactionLimit);
        let p = new Parallel(workerOptions);
        p.map(async (option) => {
            return await getDexMarkets(option);
        }).reduce(markets => {
          logger.info(`Markets found ${markets}`);
        })
    }

    const createOption = (fromTransactions, transactionLimit) => {
        return ClientOptionsBuilder().from(options).setOffset(fromTransactions).setTransactionLimit(transactionLimit).build();
    }

    const buildParallelOptions = (fromTransactions, transactionLimit) => {
        let workerOptions = [];
        const transactionSize = transactionLimit - fromTransactions;
        if (transactionSize <= options.queueSize) {
            workerOptions.push(createOption(options, fromTransactions, transactionLimit));
            return workerOptions;
        } else {
            let transactionOffset = fromTransactions;
            let transactionLimit = transactionSize / options.queueSize;
            do {
                const remainingTransactions = transactionSize % options.queueSize;
                if (remainingTransactions < transactionLimit) {
                    workerOptions.push(createOption(options, transactionOffset, remainingTransactions));
                    break;
                } else {
                    workerOptions.push(createOption(options, transactionOffset, transactionLimit));
                }
                transactionOffset += transactionLimit;
            } while (transactionOffset < transactionSize);
        }
    }

    let start = 0;
    let limit = options.parallelTProcessingLimit;
    do {
        if (totalTransactionsCount < limit) {
            runWorkers(start, totalTransactionsCount);
            break;
        } else {
            runWorkers(start, limit);
        }
        start += options.parallelTProcessingLimit;
    } while (start < totalTransactionsCount - 1)
}

export async function* getDexMarketPair(options) {
    let dexWallets = await getMultiSignatureDexWallets(options);
    let dexMarketPairs = [];
    for await (let dexWallet of dexWallets) {
        const market = await findMarket(options, dexWallet);
        yield { market, dexWallet };
        dexMarketPairs.push({ market, dexWallet });
    }
    return dexMarketPairs;
}

/**
 *  Used to query all transactions on the chain and find out multisignature wallets with matching dex transactions
 *  Can be reused to find markets available on given chain
 * returns list of dex wallets for given chain
 * @param options
 */

export async function* getMultiSignatureDexWallets(options) {
    logger.info('Client configuration for finding Dex wallet', options);
    let uniqueDexAddresses = []
    let totalUniqueDexAddresses = []

    const addUniqueDexAddress = (address) => {
        if ( uniqueDexAddresses.indexOf(address) === -1  && totalUniqueDexAddresses.indexOf(address) === -1) uniqueDexAddresses.push(address);
    }
    const extractAndMapDexTransactions = (transaction) => {
        const assetData = transaction.asset?.data;
        const senderId = transaction.senderId;
        const recipientId = transaction.recipientId;
        if (assetData) {
            if (isLimitOrder(assetData) || isMarketOrder(assetData)) {
                addUniqueDexAddress(recipientId);
            }
            if (assetData.includes(transactionType.dividend)) {
                addUniqueDexAddress(senderId)
            }
        }
    }
    let {offset, limit, transactionLimit} = options;
    let totalTransactionsCount = await getTotalTransactions(options);
    if (transactionLimit && transactionLimit < totalTransactionsCount) {
        logger.info(`Total transactions found : ${totalTransactionsCount}`);
        logger.info(`transactionLimit ${transactionLimit} is less than totalTransactions, setting iteration till ${transactionLimit}`)
        totalTransactionsCount = transactionLimit;
    }
    try {
        do {
            const transactionUrl = QueryBuilder({ ...options, offset}).buildTransactionsUrl();
            logger.info(`Querying transactions from ${offset} to ${offset + limit}`);
            const response = await axios.get(transactionUrl);
            const transactions = response.data.data;
            logger.info(`Processing ${transactions.length} Transactions from ${offset} to ${offset + limit}`);
            transactions?.forEach( transaction => {
                extractAndMapDexTransactions(transaction);
            })
            for (const walletAddress of uniqueDexAddresses) {
                if (await isDexAccount(options, walletAddress)) {
                    totalUniqueDexAddresses = [...totalUniqueDexAddresses, walletAddress];
                    logger.info(`Dex wallet found : ${walletAddress}`)
                    yield walletAddress;
                }
            }
            uniqueDexAddresses = []
            offset += limit;
        } while (offset < totalTransactionsCount)

    logger.info(`All ${totalTransactionsCount} transactions processed`);
    logger.info(`${totalUniqueDexAddresses.length} Dex address found`);

    } catch (error) {
        logger.error(error);
    }
    return totalUniqueDexAddresses;
}

/**
 * Crawls through all the transactions
 * Used to find all available markets on the chain
 * @param options
 * @param dexWalletAddress
 */
export async function findMarket(options, dexWalletAddress) {
    logger.info('Client configuration for finding dex market', options);
    let market = null;
    try {
        logger.info(`Searching market for ${dexWalletAddress}`);
        let {offset, limit} = options;
        let totalTransactionsCount = await getTotalTransactions(options, dexWalletAddress);
        logger.info(`${totalTransactionsCount} transactions found for ${dexWalletAddress}`)
        do {
            const walletTransactionUrl = QueryBuilder({ ...options, offset}).buildTransactionsUrl(dexWalletAddress);
            logger.info(`Querying transactions from ${offset} to ${offset + limit} for ${dexWalletAddress}`);
            const response = await axios.get(walletTransactionUrl);
            const transactions = response.data.data;
            logger.info(`${transactions.length} Transactions fetched for processing for ${dexWalletAddress}`);
            for (const transaction of transactions) {
                const assetData = transaction.asset?.data;
                if (assetData?.includes(transactionType.action.limitOrder) || assetData?.includes(transactionType.action.marketOrder)) {
                    market = assetData.split(',')[0]; // getting first substring before ,
                    logger.info(`Dex market found : ${market}`);
                    return market;
                }
            }
            offset += limit;
        } while (offset < totalTransactionsCount);

    } catch (error) {
        logger.error(error);
    }
    return market;
}

/**
 * Used to query all multiSigTransactions in order to find trading volume, ranking dex markets & other stats for the market
 * @param options
 * @param dexMarketPair dex wallet address for given chain
 */
export async function getMarketVolume(options, dexMarketPair) {
    throw Error(`Input is ${options} ${dexMarketPair} : functionality not implemented yet`);
}
