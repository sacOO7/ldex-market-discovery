export const ClientOptionsBuilder = ((hostName, port, isHttps = false, basePath = "api", queueSize=20) => {
    let options = {
        hostName,
        port,
        isHttps,
        basePath,
        transactionLimit: 100000,  // If lots of transactions are available, then limit on number of transactions to be processed.
        offset : 0,
        limit: 100,  // per page request transactions, used in querybuilder along with offset
        parallelTProcessingLimit: 100000,
        workers : 4, // by default number of workers are equal to number of CPU cores, should change to something stable, 4x size of CPU cores
        queueSize, // Divides parallelTransactions by this number, enqueues all of them into the queue
        recentFirst: false // Used to query latest records first
    };

    return {
        build() {
          return options;
        },
        from(oldOptions) {
          options = { ... oldOptions}
          return this;
        },
        setHost(hostName) {
            options.hostName = hostName;
            return this;
        },
        setPort(port) {
            options.port = port;
            return this;
        },
        enableHTTPs(value) {
            options.isHttps = value
            return this;
        },
        setBasePath(path) {
            options.basePath = path;
            return this;
        },
        setTransactionLimit(limit) {
            options.transactionLimit = limit;
            return this;
        },
        setOffset(offsetValue) {
            options.offset = offsetValue;
            return this;
        },
        setRecentFirst(value) {
            options.recentFirst = value;
            return this;
        }
    }
});
