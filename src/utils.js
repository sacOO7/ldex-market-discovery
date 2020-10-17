import axios from "axios";
import {minMembers, transactionType} from "./dex";
import {QueryBuilder} from "./query-builder";
import log from "loglevel";

export async function isDexAccount(options, walletAddress) {
    try {
        const multisigUrl = QueryBuilder(options).buildMultiSignatureGroupUrl(walletAddress);
        const response = await axios.get(multisigUrl);
        const multiSignatureGroups = response.data.data;
        for (const group of multiSignatureGroups) {
            if (group.address === walletAddress) {
                if(group.members.length >= minMembers) {
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        log.error(error);
        return false;
    }
}

export async function getTotalTransactions(options, walletAddress) {
    let url = QueryBuilder(options).buildTransactionsUrl(walletAddress);
    const response = await axios.get(url);
    return response.data.meta.count;
}

export function isLimitOrder(assetData) {
    const fragmentedData = assetData.split(",");
    return fragmentedData.length === 4 && fragmentedData[1] === transactionType.action.limitOrder;
}

export function isMarketOrder(assetData) {
    const fragmentedData = assetData.split(",");
    return fragmentedData.length === 3 && fragmentedData[1] === transactionType.action.marketOrder;
}
