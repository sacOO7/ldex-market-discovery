import axios from 'axios'
import {transactionType, minMembers} from "./dex";

/**
 * Used to query node health/status
 * *
 * @param clientConfig
 * returns node status for given hostname/ip address
 */

export async function getNodeStatus(clientConfig) {
    try {
        const response = await axios.get(clientConfig.getStatusUrl());
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

async function isDexAccount(clientConfig, walletAddress) {
    try {
        const response = await axios.get(clientConfig.getMultiSignatureGroupUrl(walletAddress));
        const multiSignatureGroups = response.data.data;
        for (const group of multiSignatureGroups) {
            if (group.address === walletAddress) {
                if(group.members.length >= minMembers) {
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}
function getTransactionUrl(clientConfig, walletAddress) {
    let url = clientConfig.getTransactionsUrl();
    if (walletAddress) {
        url = clientConfig.getTransactionsUrl(walletAddress)
    }
    return url;
}

export async function getTotalTransactionsCount(clientConfig, walletAddress) {
    let url = getTransactionUrl(clientConfig, walletAddress);
    const response = await axios.get(url);
    return response.data.meta.count;
}


export async function* getDexMarketPair(leaseholdClient) {
    let dexWallets = getMultiSignatureDexWallets(leaseholdClient);
    let dexMarketPairs = [];
    for await (let dexWallet of dexWallets) {
        const market = await findAvailableMarket(leaseholdClient, dexWallet);
        yield { market, dexWallet };
        dexMarketPairs.push({ market, dexWallet });
    }
    return dexMarketPairs;
}

/**
 *  Used to query all transactions on the chain and find out multisignature wallets with matching dex transactions
 *  Can be reused to find markets available on given chain
 * @param clientConfig
 * returns list of dex wallets for given chain
 */

export async function* getMultiSignatureDexWallets(clientConfig) {
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

    let offset = clientConfig.getOffset();
    let limit = clientConfig.getLimit();
    let totalTransactionsCount = await getTotalTransactionsCount(clientConfig);
    try {
        do {
            clientConfig.setOffset(offset);
            const response = await axios.get(clientConfig.getTransactionsUrl());
            const transactions = response.data.data;
            transactions.forEach( transaction => {
                extractAndMapDexTransactions(transaction);
            })
            for (const walletAddress of uniqueDexAddresses) {
                if (await isDexAccount(clientConfig, walletAddress)) {
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
 * Used to query all multiSigTransactions in order to find trading volume, ranking dex markets & other stats for the market
 * @param clientConfig client config to query data from specified chain
 * @param walletAddress dex wallet address for given chain
 */
export async function getMarketVolume(clientConfig, walletAddress = "7485409328757727573L") {

    try {
        const response = await axios.get(clientConfig.getTransactionsUrl(walletAddress));
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Crawls through all the transactions
 * Used to find all available markets on the chain
 * @param clientConfig
 * @param dexWalletAddress
 */
export async function findAvailableMarket(clientConfig, dexWalletAddress) {
    let market = null;
    try {
        let offset = clientConfig.getOffset();
        let limit = clientConfig.getLimit();
        let totalTransactionsCount = await getTotalTransactionsCount(clientConfig);
        do {
            clientConfig.setOffset(offset);
            const response = await axios.get(getTransactionUrl(clientConfig, dexWalletAddress));
            const transactions = response.data.data;
            for (const transaction of transactions) {
                const assetData = transaction.asset?.data;
                if (assetData?.includes(transactionType.action.limitOrder) || assetData?.includes(transactionType.action.marketOrder)) {
                    market = assetData.split(',')[0]; // getting first substring before ,
                    return market;
                }
            }
            console.log("Offset is " + offset);
            offset += limit;
        } while (offset < totalTransactionsCount);

    } catch (error) {
        console.error(error);
    }
    return market;
}


