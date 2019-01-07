const Crypto = require('@aeternity/aepp-sdk').Crypto;

const coordinatesType = '(int, int)';
const artworkDataType = `(string, ${coordinatesType})`;
const bidType = `(address, int, int, ${artworkDataType})`;
const auctionSlotType = `(int, int, int, int, list(${bidType}), list(${bidType}), int, int)`;
const auctionSlotListType = `list(${auctionSlotType})`;

const coordinatesToObject = (object) => {
    return {
        x: object.value[0].value,
        y: object.value[1].value
    }
};

const artworkDataToObject = (object) => {
    return {
        artwork_reference: object.value[0].value,
        coordinates: coordinatesToObject(object.value[1].value)
    }
};

const bidToObject = (object) => {
    return {
        user: Crypto.addressFromDecimal(object.value[0].value),
        amount: object.value[1].value,
        time: object.value[2].value,
        data: artworkDataToObject(object.value[3].value)
    }
};

const auctionSlotToObject = (object) => {
    return {
        id: object.value[0].value,
        timeCapacity: object.value[1].value,
        minimumTimePerBid: object.value[2].value,
        maximumTimePerBid: object.value[3].value,
        successfulBids: object.value[4].value.map(bidToObject),
        failedBids: object.value[5].value.map(bidToObject),
        startBlockHeight: object.value[6].value,
        endBlockHeight: object.value[7].value
    }
};

const auctionSlotListToObject = (object) => object.value.map(auctionSlotToObject);

module.exports = {
    coordinatesType, artworkDataType, bidType, auctionSlotType, auctionSlotListType,
    coordinatesToObject, artworkDataToObject, bidToObject, auctionSlotToObject, auctionSlotListToObject
};
