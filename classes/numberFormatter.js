
/**
 * Returns a number in Indian numbering system as a String
 *
 * @param {Number/String} number The integer to be converted.
 * @param {Number} decimals The number of digits needed after decimal point.
 * @return {String} Converted number as a String in Indian numbering unit.
 */

function changeNumberFormat(number, decimals, recursiveCall) {
    // console.log(number)
    const decimalPoints = decimals || 2;
    const noOfLakhs = number / 100000;
    const noOfThousand = number / 1000;
    // const noOfCrores = number / 10000000;
    const noOfArabs = number / 1000000000;
    let displayStr;
    let isPlural;
    // console.log("number", decimalPoints, noOfLakhs, noOfThousand, " | ",noOfArabs)

    function roundOf(integer) {
        return +integer.toLocaleString(undefined, {
            minimumFractionDigits: decimalPoints,
            maximumFractionDigits: decimalPoints,
        });
    }
    if (noOfThousand >= 1 && noOfThousand <= 99) {
        const lakhs = roundOf(noOfThousand);
        isPlural = lakhs > 1 && !recursiveCall;

        displayStr = `${lakhs} Thousand`;

        // console.log("=====>",displayStr)
    }
    else if (noOfLakhs >= 1 && noOfLakhs <= 99) {
        const lakhs = roundOf(noOfLakhs);
        isPlural = lakhs > 1 && !recursiveCall;

        displayStr = `${lakhs} Lac`;
    } else if (noOfLakhs >= 100) {
        const crores = roundOf(noOfLakhs / 100);
        const crorePrefix = crores >= 100000 ? changeNumberFormat(crores, decimals, true) : crores;
        isPlural = crores > 1 && !recursiveCall;

        displayStr = `${crorePrefix} Cr`;
    } else if (noOfArabs >= 1 && noOfArabs <= 99) {
        
        const arabs = roundOf(noOfArabs);
        isPlural = arabs > 1 && !recursiveCall;
        
        displayStr = `${arabs} Arab`;
    }
    else if (noOfArabs >= 100) {
        const kharabs = roundOf(noOfArabs / 100);
        const kharabPrefix = crores >= 10000000 ? changeNumberFormat(kharabs, decimals, true) : kharabs;
        isPlural = kharabs > 1 && !recursiveCall;

        displayStr = `${kharabPrefix} Kharab`;
    }
    else {
        displayStr = roundOf(number);
    }
    // console.log("displayStr", displayStr)
    if (displayStr === "NaN Cr") {
        displayStr = number;
        return displayStr;

    }
    // console.log("displayStr", displayStr)

    return displayStr;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = {
    changeNumberFormat,
    numberWithCommas,

}