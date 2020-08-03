import getLdexMarket from "../index";

describe("Ldex Markets", () => {
    it ("Should return proper ldex market", () => {
        const market = getLdexMarket();
        expect(market).toBe("lsk/eth")
    })
})
