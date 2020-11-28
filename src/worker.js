import {expose} from "threads/worker";
import {getMultiSignatureDexWallets} from "./index";

expose(async function getDexMarkets(options) {
    let dexWallets = getMultiSignatureDexWallets(options);
    let dexMarkets = [];
    for await (let dexWallet of dexWallets) {
        dexMarkets.push(dexWallet);
    }
    return dexMarkets;
});
