import {ClientOptionsBuilder} from "../src/client-options";
import * as marketDiscovery from "../src";

// Write one more test for http://18.206.164.187:7000/api/node/status
describe("Ldex Markets",() => {
    jest.setTimeout(60000);
    it ("Should return right dex market for leasehold", async () => {
        const leaseholdClientOptions = ClientOptionsBuilder("54.82.244.206","8010").build();
        let marketPairs = await marketDiscovery.getDexMarketPair(leaseholdClientOptions);
        const pair = (await marketPairs.next()).value;
        expect(pair.market).toBe("lsk");
        expect(pair.dexWallet).toBe("7485409328757727573L");
    })
});
