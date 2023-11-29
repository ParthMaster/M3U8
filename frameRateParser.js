// frameRateParser.js

function parseFrameRate(frameRateString, precision = 2) {
  if (frameRateString.includes("/")) {
    return parseFractionalFrameRate(frameRateString, precision);
  } else {
    return parseDecimalFrameRate(frameRateString, precision);
  }
}

function parseFractionalFrameRate(frameRateString, precision) {
  const [numerator, denominator] = frameRateString.split("/").map(Number);

  if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
    const result = numerator / denominator;
    return parseFloat(result.toFixed(precision));
  }

  throw new Error(`Invalid frame rate: ${frameRateString}`);
}

function parseDecimalFrameRate(frameRateString, precision) {
  const numericFrameRate = parseFloat(frameRateString);

  if (!isNaN(numericFrameRate) && numericFrameRate > 0) {
    return parseFloat(numericFrameRate.toFixed(precision));
  }

  throw new Error(`Invalid frame rate: ${frameRateString}`);
}

module.exports = parseFrameRate;
