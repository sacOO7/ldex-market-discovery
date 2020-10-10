import {ClientOptionsBuilder} from "./src/client-options";
import * as marketDiscovery from "./src";

const leaseholdOptions = ClientOptionsBuilder("54.82.244.206",8010).build();

export async function getDexMarketsUsingIterator() {
    let dexMarketPair = await marketDiscovery.getDexMarketPair(leaseholdOptions);
    for await (let dexMarket of dexMarketPair) {
        console.log(dexMarket);
    }
}

export async function getDexMarketsUsingGenerator() {
    let marketPairs = await marketDiscovery.getDexMarketPair(leaseholdOptions);
    const pair = (await marketPairs.next()).value;
    console.log(pair);
}

(async () => {
    try {
        await getDexMarketsUsingGenerator();
    } catch (e) {
        console.error(e);
    }
})()
