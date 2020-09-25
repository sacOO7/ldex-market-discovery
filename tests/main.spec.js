const ldexMarket = require('../index');

describe("Ldex Markets", () => {
    it ("Should return proper ldex market", () => {
        const market = ldexMarket.getLdexMarket();
        expect(market).toBe("lsk/eth");
    })
});
