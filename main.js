import {ClientConfig} from "./src/client-options";
import * as marketDiscovery from "./src";

const leaseholdClient = ClientConfig().leaseHoldClient();


export async function getDexMarketsUsingIterator() {
    let dexMarketPair = await marketDiscovery.getDexMarketPair(leaseholdClient);
    for await (let dexMarket of dexMarketPair) {
        console.log(dexMarket);
    }
}

export async function getDexMarketsUsingGenerator() {
    let marketPairs = await marketDiscovery.getDexMarketPair(leaseholdClient);
    const pair = (await marketPairs.next()).value;
    console.log(pair);
}

(async () => {
    await getDexMarketsUsingIterator();
})()
