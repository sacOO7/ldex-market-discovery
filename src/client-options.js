export const ClientOptionsBuilder = ((hostName, port, isHttps = false, basePath = "api", transactionLimit) => {
    let options = {
        hostName,
        port,
        isHttps,
        basePath,
        transactionLimit,
        parallelTProcessingLimit: 100000,
        offset : 0,
        limit : 100,
        queueSize : 20,
        workers : 4
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
        }
    }
});
