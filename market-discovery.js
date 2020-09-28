const request = require('request');

/**
 * Used to query node health/status
 * *
 * @param clientConfig
 * returns node status for given hostname/ip address
 */

function getNodeStatus(clientConfig) {
request(clientConfig.getStatusUrl(), function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
})
}

/**
 *  Used to query all transactions on the chain and find out multisignature wallets with matching dex transactions
 *  Can be reused to find markets available on given chain
 * @param clientConfig
 * returns list of dex wallets for given chain
 */

function getMultiSignatureDexWallet(clientConfig) {
    request(clientConfig.getTransactionsUrl(), function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    })
}

/**
 * Used to query all multiSigTransactions in order to find trading volume, ranking dex markets & other stats for the market
 * @param clientConfig client config to query data from specified chain
 * @param walletAddress dex wallet address for given chain
 */
function getMultiSignatureDexWalletTransactions(clientConfig, walletAddress = "7485409328757727573L") {
    request(clientConfig.getTransactionsUrl(walletAddress), function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    })
}

/**
 * Crawls through all the transactions
 * Used to find all available markets on the chain
 * @param clientConfig
 */
function findAvailableMarkets(clientConfig) {
    request(clientConfig.getTransactionsUrl(), function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    })
}

module.exports = {
    getNodeStatus,
    getMultiSignatureDexWallet,
    findAvailableMarkets,
    getMultiSignatureDexWalletTransactions
}
