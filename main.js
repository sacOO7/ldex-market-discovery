import {ClientOptionsBuilder} from "./src/client-options";
import * as marketDiscovery from "./src";
const leaseholdOptions = ClientOptionsBuilder("54.82.244.206",8010).build();

export async function getDexMarketsUsingIterator(parallel = false) {
    let dexMarketPair = await marketDiscovery.getDexMarketPair(leaseholdOptions, parallel);
    for await (let dexMarket of dexMarketPair) {
        console.log(dexMarket);
    }
}

export async function getDexMarketsUsingGenerator(parallel = false) {
    let marketPairs = await marketDiscovery.getDexMarketPair(leaseholdOptions, parallel);
    const pair = (await marketPairs.next()).value;
    console.log(pair);
}

(async () => {
    try {
        await getDexMarketsUsingIterator(true);
    } catch (e) {
        console.error(e);
    }
})()

// const leaseholdOptions = ClientOptionsBuilder("217.69.1.43",8010).build();
// lisk url -  http://18.206.164.187:7000/api/node/status
