const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const parseFrameRate = require("./frame-rate-parser");
const moment = require("moment");

function formatTime(inputTime) {
  const timeArray = inputTime.split(":");

  if (timeArray.length === 3) {
    const formattedTime = moment(inputTime, "HH:mm:ss.SSSSSSSSS").format(
      "HH:mm:ss.SS"
    );
    return formattedTime;
  } else if (timeArray.length === 1) {
    const formattedTime = moment
      .utc(parseFloat(inputTime) * 1000)
      .format("HH:mm:ss.SS");
    return formattedTime;
  } else {
    // Invalid format
    return "Invalid time format";
  }
}

async function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffprobe(filePath, { path: ffprobeStatic.path }, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

async function getVideoInfo(videoFilePath) {
  try {
    const metadata = await getVideoMetadata(videoFilePath);
    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );
    console.log(videoStream);
    // Extract frame rate, total frames, and resolution from the metadata
    const frameRate = videoStream.r_frame_rate;
    const totalFrames =
      videoStream.nb_frames ?? videoStream.tags.NUMBER_OF_FRAMES;
    const resolution = {
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
    };
    const durationInSeconds = videoStream.duration ?? videoStream.tags.DURATION;

    return {
      frameRate: parseFrameRate(frameRate),
      totalFrames: parseInt(totalFrames),
      resolution,
      durationInSeconds: formatTime(durationInSeconds),
    };
  } catch (error) {
    throw new Error(`Error getting video metadata: ${error.message}`);
  }
}

module.exports = getVideoInfo;
