const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");

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

        // Extract frame rate, total frames, and resolution from the metadata
        const frameRate = metadata.streams[0].r_frame_rate;
        const totalFrames = metadata.streams[0].nb_frames;
        const resolution = {
            width: metadata.streams[0].width,
            height: metadata.streams[0].height,
        };

        return { frameRate, totalFrames, resolution };
    } catch (error) {
        throw new Error(`Error getting video metadata: ${error.message}`);
    }
}

module.exports = getVideoInfo;
