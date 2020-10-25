import * as log from "loglevel";

// todo - Add message prefixing feature to the code
// logger.addPrefix = (prefix) => {
//     let oldFactory = logger.methodFactory;
//     if (!logger.oldMessageFactory) {
//         logger.oldMessageFactory = [];
//     }
//     logger.oldMessageFacto
//     ry = [...logger.oldMessageFactory, oldFactory];
//     const newFactory = function (methodName, logLevel, loggerName) {
//         const rawMethod = oldFactory(methodName, logLevel, loggerName);
//
//         return function (message) {
//             rawMethod(`${prefix} : ${message}`);
//         };
//     };
//     logger.methodFactory = newFactory;
// }
//
//
// logger.removePrefix = () => {
//     if (logger.oldMessageFactory && logger.oldMessageFactory.length > 0) {
//         logger.methodFactory = logger.oldMessageFactory.pop();
//     }
// }
//
// logger.clearAllPrefix = () => {
//     if (logger.oldMessageFactory && logger.oldMessageFactory.length > 0) {
//         logger.methodFactory = logger.oldMessageFactory[0];
//         logger.oldMessageFactory = []
//     }
// }

export const getDefaultLogger = () => {
    const logger = log.noConflict();
    logger.setLevel("info")
    return logger;
}
