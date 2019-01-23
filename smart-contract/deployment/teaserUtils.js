const Crypto = require('@aeternity/aepp-sdk').Crypto;

const artworkType = '(address, int, string, int)';
const geolocationType = 'string';
const artworkListType = `list(${artworkType})`;

const artworkToObject = (object) => {
    return {
        user: Crypto.addressFromDecimal(object.value[0].value),
        dronetime: object.value[1].value,
        artworkReference: object.value[2].value,
        updatedAt: object.value[3].value,
    }
};


const artworkListToObject = (object) => object.value.map(artworkToObject);

module.exports = {
    artworkType, geolocationType, artworkListType,
    artworkToObject, artworkListToObject
};
