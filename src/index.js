import axios from 'axios'
import {transactionType} from "./dex";
import {createOption, getTotalTransactions, isDexAccount, isLimitOrder, isMarketOrder} from "./utils";
import {QueryBuilder} from "./query-builder"
import {getDefaultLogger} from "./logger";
import {Pool, spawn, Worker} from "threads";

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

export async function* getMultiSignatureDexWalletsUsingWorkers(options) {
    let totalTransactionsCount = await getTotalTransactions(options);
    if (options.transactionLimit < totalTransactionsCount) {
        totalTransactionsCount = options.transactionLimit;
    }

    const getDexWalletsUsingWorkers = async (fromTransactions, transactionLimit) => {
        const workerPool = Pool(() => spawn(new Worker("../lib/worker.js")), 4);
        console.log(`Parallel processing from ${fromTransactions} to ${transactionLimit}`)
        const parallelOptions = buildParallelOptions(fromTransactions, transactionLimit);
        const mixedDexWallets = await Promise.all(parallelOptions.map(option =>
            workerPool.queue(async getDexMarkets => {
                return await getDexMarkets(option);
            })));
        await workerPool.completed();
        await workerPool.terminate();
        return mixedDexWallets;
    }

    const buildParallelOptions = (fromTransactions, transactionLimit) => {
        let workerOptions = [];
        const transactionSize = transactionLimit - fromTransactions;
        if (transactionSize <= options.queueSize) {
            workerOptions.push(createOption(options, fromTransactions, transactionLimit));
        } else {
            let slicedTStart = fromTransactions;
            let sliceSize = Math.round(transactionSize / options.queueSize);
            let slicedTEnd = slicedTStart + sliceSize;
            do {
                if (slicedTEnd > transactionLimit) {
                    slicedTEnd = transactionLimit;
                }
                workerOptions.push(createOption(options, slicedTStart, slicedTEnd));
                slicedTStart += sliceSize;
                slicedTEnd += sliceSize;
            } while (slicedTStart < transactionLimit);
        }
        return workerOptions;
    }

    // Just run for first time, need to change to run iteratively within given limit and fetch entries from latest transactions, reuse buildParallelOptionsCode
    let start = 0;
    const { parallelTProcessingLimit } = options;
    let end = start + parallelTProcessingLimit;
    let detectedDexWallets = [];
    do {
        if (end > totalTransactionsCount) {
            end = totalTransactionsCount;
        }
        const dexWallets = await getDexWalletsUsingWorkers(start, end);
        detectedDexWallets.push(dexWallets);
        start += parallelTProcessingLimit;
        end += parallelTProcessingLimit;
    } while (start < totalTransactionsCount);
    const uniqueDexWallets = detectedDexWallets.flat()
        .filter((item, i, ar) => ar.indexOf(item) === i);
    for (const dexWallet of uniqueDexWallets) {
        yield dexWallet;
    }
    return uniqueDexWallets;
}

export async function* getDexMarketPair(options, parallel = false) {
    let dexWallets = parallel ? await getMultiSignatureDexWalletsUsingWorkers(options) : await getMultiSignatureDexWallets(options);
    let dexMarketPairs = [];
    for await (let dexWallet of dexWallets) {
        const market = await findMarket(options, dexWallet);
        yield {market, dexWallet};
        dexMarketPairs.push({market, dexWallet});
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
        if (uniqueDexAddresses.indexOf(address) === -1 && totalUniqueDexAddresses.indexOf(address) === -1) uniqueDexAddresses.push(address);
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
            const transactionUrl = QueryBuilder({...options, offset}).buildTransactionsUrl();
            logger.info(`Querying transactions using ${transactionUrl}`);
            const response = await axios.get(transactionUrl);
            const transactions = response.data.data;
            logger.info(`Processing ${transactions.length} transactions`);
            transactions?.forEach(transaction => {
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
            const walletTransactionUrl = QueryBuilder({...options, offset}).buildTransactionsUrl(dexWalletAddress);
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
