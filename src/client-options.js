import url from 'url';

export const ClientConfig = (() => {
    let hostname = "54.82.244.206";
    let ssl = false;
    let basePath = "api"
    let port = "8010";
    let offset = 0;
    let limit = 100;

    return {
        leaseHoldClient() {
            return this;
        },
        liskClient(){
          throw new Error('Default lisk client config not found');
        },
        capitaliskClient(){
            throw new Error('Default capitalisk client config not found');
        },
        enableHTTPs(value) {
            ssl = value
            return this;
        },
        setHost(hostName) {
            hostname = hostName;
            return this;
        },
        setPort(portName) {
            port = portName
            return this;
        },
        setBasePath(path) {
            basePath = path;
            return this;
        },
        setOffset(offsetValue) {
            offset = offsetValue;
            return this;
        },
        getOffset() {
            return offset;
        },
        getLimit() {
            return limit;
        },
        setLimit(limitValue) {
            limit = limitValue;
            return this;
        },
        getStatusUrl () {
         return url.format({
             protocol: ssl ? "https" : "http",
             hostname: hostname,
             pathname: `/${basePath}/node/status`,
             port : port
         });
        },
        getTransactionsUrl (walletAddress) {
            let query = {
                offset: offset,
                limit: limit,
            }
            if (walletAddress) {
                query.senderIdOrRecipientId = walletAddress;
            }
            return url.format({
                protocol: ssl ? "https" : "http",
                hostname: hostname,
                pathname: `/${basePath}/transactions`,
                port : port,
                query: query
            });
        },
        getMultiSignatureGroupUrl (walletAddress) {
            return url.format({
                protocol: ssl ? "https" : "http",
                hostname: hostname,
                pathname: `/${basePath}/accounts/${walletAddress}/multisignature_groups`,
                port : port
            });
        }
    }
});
