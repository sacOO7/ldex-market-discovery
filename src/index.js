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
    let dexWallets = marketDiscovery.getMultiSignatureDexWallets(leaseholdClient);
    console.log((await dexWallets.next()).value);
    console.log((await dexWallets.next()).value);
}

// (async () => {
//     await printDexWalletsUsingIterator();
//     await printDexWalletsUsingGenerator();
// })()

export const getLdexMarket  = () => {
    return "lsk/eth";
}
