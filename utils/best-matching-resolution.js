const resolutions = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "2500k" },
  { name: "720p", width: 1280, height: 720, bitrate: "1500k" },
  { name: "480p", width: 854, height: 480, bitrate: "800k" },
  { name: "360p", width: 640, height: 360, bitrate: "400k" },
];

async function getBestMatchingResolution(inputResolution) {
  let bestMatch = resolutions[0];
  let minDifference = Math.abs(
    inputResolution.width * inputResolution.height -
      resolutions[0].width * resolutions[0].height
  );

  for (const res of resolutions) {
    const difference = Math.abs(
      inputResolution.width * inputResolution.height - res.width * res.height
    );

    if (difference < minDifference) {
      minDifference = difference;
      bestMatch = res;
    }
  }

  return bestMatch;
}

module.exports = getBestMatchingResolution;
