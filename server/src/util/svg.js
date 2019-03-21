const convert = require('xml-js');
const Base64 = require('js-base64').Base64;

const pixelsPerCentimeter = 1;
const svgScalingFactor = 1;
const centimeterToMillimeter = 10;

const getSVGDimensions = (svgString) => {
    try {
        const result = convert.xml2js(svgString, {compact: true});
        let height = String(result.svg._attributes.height);
        let width = String(result.svg._attributes.width);
        const re = /([\d.]+)mm/;
        if (height.includes('mm')) {
            height = Number(height.match(re)[1]) / (pixelsPerCentimeter * centimeterToMillimeter)
        }
        if (width.includes('mm')) {
            width = Number(width.match(re)[1]) / (pixelsPerCentimeter * centimeterToMillimeter)
        }

        result.svg._attributes.height = (height / svgScalingFactor) + "mm";
        result.svg._attributes.width = (width / svgScalingFactor) + "mm";

        const svg = convert.js2xml(result, {compact: true});
        return {width, height, svg}

    } catch (e) {
        console.error('Could not get width / height from image ', svgString.substr(0, 20), e);
        return {width: 0, height: 0, svg: null}
    }
};

const sanityCheckFileOnly = (data, id) => {
    const sanityFails = {};

    if (!data.filebuffer) {
        sanityFails[id] = 'Could not fetch file';
        console.error(id + ': Could not fetch file');

        return {checkPassed: false, data: data, dataFails: sanityFails, result: null}
    }

    const svgString = data.filebuffer.toString('utf8');
    let result = null;
    try {
        result = convert.xml2js(svgString, {compact: true});
    } catch (e) {
        sanityFails[id] = 'Could not parse file';
        console.error(id + ': Could not parse file');
        return {checkPassed: false, data: data, dataFails: sanityFails, result: null}
    }

    let height = String(result.svg._attributes.height);
    let width = String(result.svg._attributes.width);

    const re = /([\d.]+)mm/;

    if (!height.includes('mm') || !height.match(re)[1]) {
        sanityFails[id] = 'Height not recognized';
        console.error(id + ': Height not recognized');

        data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
        return {checkPassed: false, data: data, dataFails: sanityFails, result: result}
    }
    if (!width.includes('mm') || !width.match(re)[1]) {
        sanityFails[id] = 'Width not recognized';
        console.error(id + ': Width not recognized');

        data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
        return {checkPassed: false, data: data, dataFails: sanityFails, result: result}
    }

    return {checkPassed: true, data: data, dataFails: sanityFails, result: result}
};

const sanityCheck = (dataToCheck) => {
    try {
        // SANITY CHECK

        const checkedFile = sanityCheckFileOnly(dataToCheck, dataToCheck.bid.seqId);
        const data = checkedFile.data;
        const sanityFails = checkedFile.dataFails;
        const result = checkedFile.result;
        if (!checkedFile.checkPassed) return {checkPassed: checkedFile.checkPassed, data: data, dataFails: sanityFails};

        let origin = String(result.svg._attributes['wallCanvas:origin']);
        if (!origin) {
            result.svg._attributes['wallCanvas:origin'] = `${data.bid.data.coordinates.x * centimeterToMillimeter} ${data.bid.data.coordinates.y * centimeterToMillimeter}`
        }

        const x = Number(origin.split(" ")[0]);
        const y = Number(origin.split(" ")[1]);

        if (x !== data.bid.data.coordinates.x * centimeterToMillimeter || y !== data.bid.data.coordinates.y * centimeterToMillimeter) {
            sanityFails[data.bid.seqId] = 'Contract coordinates is not equal to svg data';
            console.error(data.bid.seqId + ': Contract coordinates is not equal to svg data');
            console.error(data.bid.seqId + `: Contract: x:${data.bid.data.coordinates.x * centimeterToMillimeter} y:${data.bid.data.coordinates.y * centimeterToMillimeter}`);
            console.error(data.bid.seqId + `: SVG-Data: x:${x} y:${y}`);

            data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
            return {checkPassed: false, data: data, dataFails: sanityFails}
        }

        data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
        return {checkPassed: true, data: data, dataFails: sanityFails}
    } catch (e) {
        console.error(dataToCheck.bid.seqId + ': Sanity Check failed');
        console.error(e);

        const sanityFails = {};
        sanityFails[dataToCheck.bid.seqId] = 'Sanity Check failed: ' + e.message;
        return {checkPassed: false, data: data, dataFails: sanityFails}

    }
};

module.exports = {
    getSVGDimensions, sanityCheckFileOnly, sanityCheck
};
