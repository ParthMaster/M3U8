const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const parseFrameRate = require("./frame-rate-parser");

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

    return {
      frameRate: parseFrameRate(frameRate),
      totalFrames: parseInt(totalFrames),
      resolution,
    };
  } catch (error) {
    throw new Error(`Error getting video metadata: ${error.message}`);
  }
}

module.exports = getVideoInfo;
