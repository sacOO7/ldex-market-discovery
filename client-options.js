const url = require('url');

const ClientConfig = (() => {
    let hostname = "54.82.244.206";
    let ssl = false;
    let basePath = "api"
    let port = "8010";
    let offset = 1;
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
        setHost(hostname) {
            this.hostname = hostname;
            return this;
        },
        setPort(port) {
            this.port = port
            return this;
        },
        setBasePath(path) {
            basePath = path;
        },
        setOffset(offset) {
            this.offset = offset ;
        },
        setLimit(limit) {
            this.limit = limit;
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
        }
    }
});

module.exports.ClientConfig = ClientConfig;
