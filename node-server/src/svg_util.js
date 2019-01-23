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


const sanityCheck = data => {
    const sanityFails = {};

    try {
        // SANITY CHECK

        if (!data.filebuffer) {
            sanityFails[data.bid.seqId] = 'Could not fetch file';
            console.error(data.bid.seqId + ': Could not fetch file');

            return {checkPassed: false, data: data, dataFails: sanityFails}
        }

        const svgString = data.filebuffer.toString('utf8');
        const result = convert.xml2js(svgString, {compact: true});

        let height = String(result.svg._attributes.height);
        let width = String(result.svg._attributes.width);

        const re = /([\d.]+)mm/;

        if (!height.includes('mm') || !height.match(re)[1]) {
            sanityFails[data.bid.seqId] = 'Height not recognized';
            console.error(data.bid.seqId + ': Height not recognized');

            data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
            return {checkPassed: false, data: data, dataFails: sanityFails}
        }
        if (!width.includes('mm') || !width.match(re)[1]) {
            sanityFails[data.bid.seqId] = 'Width not recognized';
            console.error(data.bid.seqId + ': Width not recognized');

            data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
            return {checkPassed: false, data: data, dataFails: sanityFails}
        }

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
        console.error(data.bid.seqId + ': Sanity Check failed');
    }
};

module.exports = {
    getSVGDimensions, sanityCheck
};
