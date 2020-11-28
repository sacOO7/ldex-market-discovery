import url from "url";

export const QueryBuilder = ((options) => {

    return {
        buildStatusUrl () {
            return url.format({
                protocol: options.isHttps ? "https" : "http",
                hostname: options.hostName,
                pathname: `/${options.basePath}/node/status`,
                port : options.port
            });
        },
        buildTransactionsUrl (walletAddress) {
            const { offset, limit, transactionLimit } = options;
            const getActualUpperLimit = () => {
                const diff = transactionLimit - offset;
                return diff < limit ? diff : limit;
            }
            let query = {
                offset: offset,
                limit: getActualUpperLimit(),
            }
            if (walletAddress) {
                query.senderIdOrRecipientId = walletAddress;
            }
            return url.format({
                protocol: options.isHttps ? "https" : "http",
                hostname: options.hostName,
                pathname: `/${options.basePath}/transactions`,
                port : options.port,
                query: query
            });
        },
        buildMultiSignatureGroupUrl (walletAddress) {
            return url.format({
                protocol: options.isHttps ? "https" : "http",
                hostname: options.hostName,
                pathname: `/${options.basePath}/accounts/${walletAddress}/multisignature_groups`,
                port : options.port
            });
        }
    }
});
