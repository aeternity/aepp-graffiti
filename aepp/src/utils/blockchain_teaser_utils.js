import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

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

const geolocationToObject = (object) => object.value;

const artworkListToObject = (object) => object.value.map(artworkToObject);

export default {
    artworkType, geolocationType, artworkListType,
    geolocationToObject, artworkToObject, artworkListToObject
};
