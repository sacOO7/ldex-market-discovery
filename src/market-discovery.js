import axios from 'axios'
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

/**
 *  Used to query all transactions on the chain and find out multisignature wallets with matching dex transactions
 *  Can be reused to find markets available on given chain
 * @param clientConfig
 * returns list of dex wallets for given chain
 */

export async function getMultiSignatureDexWallet(clientConfig) {
    try {
        const response = await axios.get(clientConfig.getTransactionsUrl());
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Used to query all multiSigTransactions in order to find trading volume, ranking dex markets & other stats for the market
 * @param clientConfig client config to query data from specified chain
 * @param walletAddress dex wallet address for given chain
 */
export async function getMultiSignatureDexWalletTransactions(clientConfig, walletAddress = "7485409328757727573L") {

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
 */
export async function findAvailableMarkets(clientConfig) {
    try {
        const response = await axios.get(clientConfig.getTransactionsUrl());
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

