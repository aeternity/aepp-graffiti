const Crypto = require('@aeternity/aepp-sdk').Crypto;

const bidListToObject = (bidList) => {
    return bidList.value.map(bid => {
        return {
            user: Crypto.addressFromDecimal(bid.value[0].value),
            hash: bid.value[1].value,
            coordinates: {
                x: bid.value[2].value[0].value,
                y: bid.value[2].value[1].value
            },
            droneTime: bid.value[3].value,
            amount: bid.value[4].value
        }
    })
};

module.exports = {
    bidListToObject
};
