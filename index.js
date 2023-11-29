const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const getVideoInfo = require("./videoInfo.js");
const parseFrameRate = require("./frameRateParser.js");

const inputFilePath = "input.mp4";
const outputDirectory = "output";

ffmpeg.setFfmpegPath(ffmpegStatic);

async function processResolution({
  resolution,
  targetWidth,
  targetHeight,
  videoBitrate,
  frameRate,
  totalFrames,
}) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilePath)
      .videoFilter(`scale=${targetWidth}x${targetHeight}:flags=lanczos`)
      .videoCodec("libx264")
      .outputOptions("-profile:v main")
      .outputOptions("-preset:v medium")
      .videoBitrate(videoBitrate)
      .outputOptions("-maxrate", videoBitrate)
      .outputOptions("-bufsize", `${parseInt(videoBitrate) * 2}k`)
      .outputOptions("-g 60")
      .audioCodec("aac")
      .audioBitrate("128k")
      .audioChannels(2)
      .outputOptions("-map 0")
      .outputOptions("-c:s copy")
      .outputOptions("-sn")
      .outputOptions("-hls_time 6")
      .outputOptions("-hls_playlist_type vod")
      .outputOptions(
        `-hls_segment_filename ${outputDirectory}/${resolution}_%03d.ts`
      )
      .output(`${outputDirectory}/output_${resolution}.m3u8`)
      .on("progress", (progress) => {
        if (progress.frames && progress.timemark) {
          const currentTime = calculateTimeInSeconds(progress.timemark);
          const estimatedCurrentFrame = Math.floor(
            parseFrameRate(frameRate) * currentTime
          );
          const percent = Math.min(
            (estimatedCurrentFrame / totalFrames) * 100,
            100
          );

          process.stdout.write(
            `\rProcessing ${resolution}: ${percent.toFixed(2)}% done`
          );
        }
      })
      .on("end", () => {
        console.log(`\n${resolution} encoding finished.`);
        resolve();
      })
      .on("error", (error) => {
        console.error(`Error encoding ${resolution}:`, error);
        reject(error);
      })
      .run();
  });
}
async function getBestMatchingResolution(inputResolution) {
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

(async () => {
  try {
    const { frameRate, totalFrames, resolution } = await getVideoInfo(
      inputFilePath
    );
    console.log(resolution);
    const resolutions = ["1080p", "720p", "480p", "360p"];
    const convertedResolution = await getBestMatchingResolution(resolution);

    for (const targetResolution of resolutions) {
      let targetWidth, targetHeight, videoBitrate;

      // Adjust target resolution based on input resolution
      if (convertedResolution.width >= 1920 && targetResolution === "1080p") {
        targetWidth = 1920;
        targetHeight = 1080;
        videoBitrate = "2500k";
      } else if (
        convertedResolution.width >= 1280 &&
        targetResolution === "720p"
      ) {
        targetWidth = 1280;
        targetHeight = 720;
        videoBitrate = "1500k";
      } else if (
        convertedResolution.width >= 854 &&
        targetResolution === "480p"
      ) {
        targetWidth = 854;
        targetHeight = 480;
        videoBitrate = "800k";
      } else if (
        convertedResolution.width >= 640 &&
        targetResolution === "360p"
      ) {
        targetWidth = 640;
        targetHeight = 360;
        videoBitrate = "400k";
      } else {
        // If input resolution is lower than the target, use input resolution
        targetWidth = convertedResolution.width;
        targetHeight = convertedResolution.height;
        videoBitrate = "400k";
      }

      console.log(convertedResolution, targetResolution);
      await processResolution({
        resolution: targetResolution,
        targetWidth,
        targetHeight,
        videoBitrate,
        frameRate,
        totalFrames,
      });
    }

    console.log("\nAll resolutions processed.");
  } catch (error) {
    console.error(error.message);
  }
})();

function calculateTimeInSeconds(timemark) {
  const timeComponents = timemark.split(":").map(parseFloat);
  return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
}
