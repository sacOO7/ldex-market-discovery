export const ClientOptionsBuilder = ((hostName, port, isHttps = false, basePath = "api", offset = 0, limit = 100) => {
    let options = {
        hostName,
        port,
        isHttps,
        basePath,
        offset,
        limit
    };

    return {
        build() {
          return options;
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
        setOffset(offsetValue) {
            options.offset = offsetValue;
            return this;
        },
        setLimit(limitValue) {
            options.limit = limitValue;
            return this;
        }
    }
});
