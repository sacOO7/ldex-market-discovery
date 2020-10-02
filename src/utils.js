import axios from "axios";
import {minMembers} from "./dex";

export async function isDexAccount(clientConfig, walletAddress) {
    try {
        const response = await axios.get(clientConfig.getMultiSignatureGroupUrl(walletAddress));
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

export async function getTotalTransactions(clientConfig, walletAddress) {
    let url = clientConfig.getTransactionsUrl(walletAddress);
    const response = await axios.get(url);
    return response.data.meta.count;
}


