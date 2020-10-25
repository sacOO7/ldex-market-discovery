import {getDefaultLogger} from "../src/logger";

describe("Custom logger",() => {
    it ("Should return default logger", async () => {
        const consoleSpy = jest.spyOn(console, 'info');
        const logger = getDefaultLogger();
        logger.info("Hello logger");
        expect(consoleSpy).toHaveBeenCalledWith('Hello logger');
    });
});
