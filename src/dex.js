
// todo : create regex strings for transactions
export const transactionType = {
    action: {
        limitOrder: "limit",
        marketOrder: "market",
        closeOrder: "close",
        creditOrder: "credit"
    },
    refund: {
        r1: "Invalid order",
        r2: "Expired order",
        r3: "Closed order",
        r4: "Unmatched market order part",
        r5: "DEX has moved",
        r6: "DEX has been disabled"
    },
    trades: {
        t1: "Orders taken",
        t2: "Order made"
    },
    dividend : "Member dividend"
}

export const minMembers = 5;
