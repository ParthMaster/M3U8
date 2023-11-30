const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

function calculateTimeInSeconds(timemark) {
  const timeComponents = timemark.split(":").map(parseFloat);
  return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
}

ffmpeg.setFfmpegPath(ffmpegStatic);

async function processResolution({
  resolution,
  targetWidth,
  targetHeight,
  videoBitrate,
  frameRate,
  totalFrames,
  durationInSeconds,
  inputFilePath,
  outputDirectory,
}) {
  const outputFilename = `${path.basename(
    inputFilePath,
    path.extname(inputFilePath)
  )}_${resolution}`;
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilePath)
      .videoFilter(`scale=${targetWidth}x${targetHeight}:flags=lanczos`)
      .videoCodec("libx265")
      //   .outputOptions("-profile:v main")
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
        `-hls_segment_filename ${outputDirectory}/${outputFilename}_%03d.ts`
      )
      .output(`${outputDirectory}/output_${outputFilename}.m3u8`)
      .on("progress", (progress) => {
        // console.log(progress);
        if (progress.frames && progress.timemark) {
          const currentTime = calculateTimeInSeconds(progress.timemark);
          const estimatedCurrentFrame = Math.floor(frameRate * currentTime);
          const percent = Math.min(
            (estimatedCurrentFrame / totalFrames) * 100,
            100
          );
          process.stdout.write(
            `\rProcessing ${resolution}: ${percent.toFixed(
              2
            )}% done, current: ${
              progress.timemark
            } duration: ${durationInSeconds}`
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

module.exports = processResolution;
