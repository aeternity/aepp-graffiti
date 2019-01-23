const convert = require('xml-js');
const Base64 = require('js-base64').Base64;

const sanityCheck = data => {
    const sanityFails = {};

    try {
        // SANITY CHECK

        if (!data.filebuffer) {
            sanityFails[data.bid.seqId] = 'Could not fetch file';
            console.error(data.bid.seqId + ': Could not fetch file');
            return [false, sanityFails];
        }

        const svgString = data.filebuffer.toString('utf8');

        const result = convert.xml2js(svgString, {compact: true});

        let height = String(result.svg._attributes.height);
        let width = String(result.svg._attributes.width);

        const re = /([\d.]+)mm/;

        if (!height.includes('mm') || !height.match(re)[1]) {
            sanityFails[data.bid.seqId] = 'Height not recognized';
            console.error(data.bid.seqId + ': Height not recognized');
            return [false, sanityFails];
        }
        if (!width.includes('mm') || !width.match(re)[1]) {
            sanityFails[data.bid.seqId] = 'Width not recognized';
            console.error(data.bid.seqId + ': Width not recognized');
            return [false, sanityFails];
        }

        let origin = String(result.svg._attributes['wallCanvas:origin']);
        if (!origin) {
            result.svg._attributes['wallCanvas:origin'] = `${data.bid.data.coordinates.x * 10} ${data.bid.data.coordinates.y * 10}`
        }

        const x = Number(origin.split(" ")[0]);
        const y = Number(origin.split(" ")[1]);

        if (x !== data.bid.data.coordinates.x * 10 || y !== data.bid.data.coordinates.y * 10) {
            sanityFails[data.bid.seqId] = 'Contract coordinates is not equal to svg data';
            console.error(data.bid.seqId + ': Contract coordinates is not equal to svg data');
            console.error(data.bid.seqId + `: Contract: x:${data.bid.data.coordinates.x * 10} y:${data.bid.data.coordinates.y * 10}`);
            console.error(data.bid.seqId + `: SVG-Data: x:${x} y:${y}`);
            return [false, sanityFails];
        }

        data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
        return [true, sanityFails];
    } catch (e) {
        console.error(data.bid.data.artworkReference + ': Sanity Check failed');
    }
};

module.exports = {
    sanityCheck
};
