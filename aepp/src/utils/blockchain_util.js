const Crypto = require('@aeternity/aepp-sdk').Crypto;

const coordinatesType = '(int, int)';
const artworkDataType = `(string, ${coordinatesType})`;
const bidType = `(int, address, int, int, int, ${artworkDataType})`;
const auctionSlotType = `(int, int, int, int, list(${bidType}), list(${bidType}), int, int)`;
const auctionSlotListType = `list(${auctionSlotType})`;
const auctionMetaDataType = '(string, int, int)';

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
    seqId: object.value[0].value,
    user: Crypto.addressFromDecimal(object.value[1].value),
    amount: object.value[2].value,
    time: object.value[3].value,
    amountPerTime: object.value[4].value,
    data: artworkDataToObject(object.value[5])
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

const atomsToAe = (atoms) => atoms / 1000000000000000000;
const aeToAtoms = (ae) => ae * 1000000000000000000;

const slotIsActive = (slot, height) => slot.startBlockHeight < height && slot.endBlockHeight > height;
const slotIsPast = (slot, height) => slot.startBlockHeight < height && slot.endBlockHeight <= height;
const slotIsFuture = (slot, height) => slot.startBlockHeight >= height && slot.endBlockHeight > height;
const slotCapacityUsed = (slot) => slot.successfulBids.reduce((acc, x) => Number(x.time) + acc, 0);
const slotCapacityRemaining = (slot) => slot.timeCapacity - slotCapacityUsed(slot);

const auctionSlotListToObject = (object) => object.value.map(auctionSlotToObject);

const auctionMetaDataToObject = (object) => {
  return {
    geolocation: object.value[0].value,
    canvasWidth: object.value[1].value,
    canvasHeight: object.value[2].value,
  }
};

export default {
  coordinatesToObject, artworkDataToObject, bidToObject, bidListToObject, auctionSlotToObject, auctionSlotListToObject,
  auctionMetaDataToObject, coordinatesType, artworkDataType, bidType, auctionSlotType, auctionSlotListType,
  auctionMetaDataType, atomsToAe, aeToAtoms, slotIsActive, slotIsPast, slotIsFuture, slotCapacityUsed, slotCapacityRemaining
}
