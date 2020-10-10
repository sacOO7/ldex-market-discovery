import axios from 'axios'
import {transactionType} from "./dex";
import {getTotalTransactions, isDexAccount} from "./utils";
import {QueryBuilder} from "./query-builder"
/**
 * Used to query node health/status
 * *
 * @param options
 * returns node status for given hostname/ip address
 */

export async function getNodeStatus(options) {
    try {
        const response = await axios.get(QueryBuilder(options).buildStatusUrl());
        return response.data;
    } catch (error) {
        console.error(error);
    }
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
            if (assetData.includes(transactionType.action.limitOrder) || assetData.includes(transactionType.action.marketOrder)) {
                addUniqueDexAddress(recipientId);
            }
            if (assetData.includes(transactionType.dividend)) {
                addUniqueDexAddress(senderId)
            }
        }
    }
    let {offset, limit} = options;
    let totalTransactionsCount = await getTotalTransactions(options);
    try {
        do {
            const transactionUrl = QueryBuilder({ ...options, offset}).buildTransactionsUrl();
            const response = await axios.get(transactionUrl);
            const transactions = response.data.data;
            transactions?.forEach( transaction => {
                extractAndMapDexTransactions(transaction);
            })
            for (const walletAddress of uniqueDexAddresses) {
                if (await isDexAccount(options, walletAddress)) {
                    totalUniqueDexAddresses = [...totalUniqueDexAddresses, walletAddress];
                    yield walletAddress;
                }
            }
            uniqueDexAddresses = []
            offset += limit;
        } while (offset < totalTransactionsCount)

    } catch (error) {
        console.error(error);
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
    let market = null;
    try {
        let {offset, limit} = options
        let totalTransactionsCount = await getTotalTransactions(options, dexWalletAddress);
        do {
            const walletTransactionUrl = QueryBuilder({ ...options, offset}).buildTransactionsUrl(dexWalletAddress)
            const response = await axios.get(walletTransactionUrl);
            const transactions = response.data.data;
            for (const transaction of transactions) {
                const assetData = transaction.asset?.data;
                if (assetData?.includes(transactionType.action.limitOrder) || assetData?.includes(transactionType.action.marketOrder)) {
                    market = assetData.split(',')[0]; // getting first substring before ,
                    return market;
                }
            }
            offset += limit;
        } while (offset < totalTransactionsCount);

    } catch (error) {
        console.error(error);
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
