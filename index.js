const ClientConfig = require('./client-options').ClientConfig;

const getLeaseholdClient = ClientConfig().builder()
    .leaseHoldClient()
    .build();

const getLdexMarket  = () => {
    return "lsk/eth";
}


module.exports.getLdexMarket = getLdexMarket;
module.exports.getLeaseholdClient = getLeaseholdClient;
