function getBestMatchingResolution(inputResolution) {
  const resolutions = [
    { name: "1080p", width: 1920, height: 1080 },
    { name: "720p", width: 1280, height: 720 },
    { name: "480p", width: 854, height: 480 },
    { name: "360p", width: 640, height: 360 },
  ];

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
const getRes = () => {
  const res = getBestMatchingResolution({ width: 1280, height: 720 });
  console.log(res)
};
getRes();
