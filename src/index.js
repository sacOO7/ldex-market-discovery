import {ClientConfig} from './client-options';
import * as marketDiscovery from './market-discovery';
const leaseholdClient = ClientConfig().leaseHoldClient();


export async function printDexWalletsUsingIterator() {
    let dexWallets = marketDiscovery.getMultiSignatureDexWallets(leaseholdClient);
    for await (let wallet of dexWallets) {
        console.log(wallet);
    }
}

export async function printDexWalletsUsingGenerator() {
    let dexWallets = marketDiscovery.getMultiSignatureDexWallets(leaseholdClient)
    const firstDexAddress = (await dexWallets.next()).value;
    console.log(firstDexAddress + " : ");
    const market = await marketDiscovery.findAvailableMarket(leaseholdClient, firstDexAddress);
    console.log(market);
}

(async () => {
    // await printDexWalletsUsingIterator();
    await printDexWalletsUsingGenerator();
})()

export const getLdexMarket  = () => {
    return "lsk/eth";
}
