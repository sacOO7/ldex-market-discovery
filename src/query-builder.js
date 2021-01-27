import url from "url";
import {getUnixTimeStampSince} from "./utils";

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
        buildNodeConstantsUrl () {
            return url.format({
                protocol: options.isHttps ? "https" : "http",
                hostname: options.hostName,
                pathname: `/${options.basePath}/node/constants`,
                port : options.port
            });
        },
        buildTransactionsUrl (walletAddress, sinceDays) {
            const { offset, limit, transactionLimit, recentFirst } = options;
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
            if (recentFirst) {
                query = { ...query, sort : "timestamp:desc" }
            }
            if (sinceDays) {
                const {fromDateTime, toDateTime} = getUnixTimeStampSince(sinceDays);
                query = { ...query, fromTimestamp : fromDateTime, toTimestamp : toDateTime }
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
