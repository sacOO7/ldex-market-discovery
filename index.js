const ClientConfig = require('./client-options').ClientConfig;
const marketDiscovery = require('./market-discovery');
const leaseholdClient = ClientConfig().leaseHoldClient();
const leaseholdClient1 = ClientConfig().enableHTTPs(true).leaseHoldClient();

console.log(leaseholdClient.getStatusUrl());
console.log(leaseholdClient1.getStatusUrl());
console.log(leaseholdClient.getTransactionsUrl());

marketDiscovery.getMultiSignatureDexWallet(leaseholdClient);

const getLdexMarket  = () => {
    return "lsk/eth";
}

// sleep()
module.exports.getLdexMarket = getLdexMarket;
module.exports.getLeaseholdClient = leaseholdClient;
