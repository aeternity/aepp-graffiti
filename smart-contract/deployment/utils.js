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
        artworkReference: object.value[0].value,
        coordinates: coordinatesToObject(object.value[1])
    }
};

const bidToObject = (object) => {
    return {
        user: Crypto.addressFromDecimal(object.value[0].value),
        amount: object.value[1].value,
        time: object.value[2].value,
        data: artworkDataToObject(object.value[3])
    }
};

const bidListToObject = (object) => object.value.map(bidToObject);

const auctionSlotToObject = (object) => {
    return {
        id: object.value[0].value,
        timeCapacity: object.value[1].value,
        minimumTimePerBid: object.value[2].value,
        maximumTimePerBid: object.value[3].value,
        successfulBids: bidListToObject(object.value[4]),
        failedBids: bidListToObject(object.value[5]),
        startBlockHeight: object.value[6].value,
        endBlockHeight: object.value[7].value
    }
};

const auctionSlotListToObject = (object) => object.value.map(auctionSlotToObject);

module.exports = {
    coordinatesType, artworkDataType, bidType, auctionSlotType, auctionSlotListType,
    coordinatesToObject, artworkDataToObject, bidToObject, bidListToObject, auctionSlotToObject, auctionSlotListToObject
};
