import {ClientConfig} from "../src/client-options";
import * as marketDiscovery from "../src";
describe("Ldex Markets",() => {
    jest.setTimeout(60000);
    it ("Should return right dex market for leasehold", async () => {
        const leaseholdClient = ClientConfig().leaseHoldClient();
        let marketPairs = await marketDiscovery.getDexMarketPair(leaseholdClient);
        const pair = (await marketPairs.next()).value;
        expect(pair.market).toBe("lsk");
        expect(pair.dexWallet).toBe("7485409328757727573L");
    })
});
