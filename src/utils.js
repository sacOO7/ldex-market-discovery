import axios from "axios";
import {minMembers} from "./dex";
import {QueryBuilder} from "./query-builder";

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
        return false;
    }
}

export async function getTotalTransactions(options, walletAddress) {
    let url = QueryBuilder(options).buildTransactionsUrl(walletAddress);
    const response = await axios.get(url);
    return response.data.meta.count;
}


