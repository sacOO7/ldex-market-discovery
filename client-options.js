const url = require('url');

const ClientConfig = (() => {
    let hostname = "54.82.244.206";
    let ssl = false;
    let path = "api"
    let port = "8010";

    return {
        builder() {
          return ClientConfig();
        },
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
        setHost(host) {
            hostname = host;
            return this;
        },
        setPort(portName) {
            port = portName
            return this;
        },
        build () {
         return url.format({
             protocol: ssl ? "https" : "http",
             hostname: hostname,
             pathname: `/${path}`,
             port : port
         });
        }
    }
});

module.exports.ClientConfig = ClientConfig;
