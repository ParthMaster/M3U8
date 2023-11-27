const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const getVideoInfo = require("./utils/video-info");
const parseFrameRate = require("./utils/frame-rate-parser");

const inputFilePath = "input.mp4";
const outputDirectory = "output";

ffmpeg.setFfmpegPath(ffmpegStatic);

// Function to create lower-quality versions
async function createLowerQualityVersions(resolution, frameRate, totalFrames) {
    const lowerQualityResolutions = ["1080p", "720p", "480p", "360p"];

    for (const lowerResolution of lowerQualityResolutions) {
        if (isResolutionLower(resolution, lowerResolution)) {
            await createVideo(lowerResolution, frameRate, totalFrames);
        }
    }
}

// Function to create a video with given resolution
async function createVideo(resolution, frameRate, totalFrames) {
    const outputFileName = `${resolution}_${outputDirectory}.m3u8`;

    ffmpeg()
        .input(inputFilePath)
        .videoFilter(`scale=${getScale(resolution)}:flags=lanczos`)
        .videoCodec("libx264")
        .outputOptions("-profile:v main")
        .outputOptions("-preset:v medium")
        .videoBitrate(getVideoBitrate(resolution))
        .outputOptions(`-maxrate ${getVideoBitrate(resolution)}`)
        .outputOptions(`-bufsize ${getBufferSize(resolution)}`)
        .outputOptions("-g 60")
        .audioCodec("aac")
        .audioBitrate("128k")
        .audioChannels(2)
        .outputOptions("-map 0")
        .outputOptions("-c:s copy")
        .outputOptions("-sn")
        .outputOptions("-hls_time 6")
        .outputOptions("-hls_playlist_type vod")
        .outputOptions(`-hls_segment_filename ${outputDirectory}/${resolution}_%03d.ts`)
        .output(`${outputDirectory}/${outputFileName}`)
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

                process.stdout.write(`Processing: ${percent.toFixed(2)}% done\r`);
            }
        })
        .on("end", () => {
            console.log(`FFmpeg has finished for ${resolution}`);
        })
        .on("error", (error) => {
            console.error(`Error processing ${resolution}:`, error);
        })
        .run();
}

function isResolutionLower(originalResolution, targetResolution) {
    const resolutions = [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 854, height: 480 },
        { width: 640, height: 360 }
    ];

    const originalWidth = originalResolution.width;
    const originalHeight = originalResolution.height;
    const targetWidth = targetResolution.width;
    const targetHeight = targetResolution.height;

    console.log("originalResolution", originalResolution);
    console.log("targetResolution", targetResolution);

    // Check if both resolutions are valid
    if (!isValidResolution(originalWidth, originalHeight) || !isValidResolution(targetWidth, targetHeight)) {
        console.error("Invalid resolution(s)");
        return false;
    }

    // Compare resolutions
    const originalArea = originalWidth * originalHeight;
    const targetArea = targetWidth * targetHeight;

    console.log(originalArea > targetArea);
    return originalArea > targetArea;
}

function isValidResolution(width, height) {
    return typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0;
}

// Function to get the scale for a given resolution
function getScale(resolution) {
    switch (resolution) {
        case "1080p":
            return "1920x1080";
        case "720p":
            return "1280x720";
        case "480p":
            return "854x480";
        case "360p":
            return "640x360";
        default:
            return "1920x1080"; // Default to 1080p
    }
}

// Function to get video bitrate for a given resolution
function getVideoBitrate(resolution) {
    switch (resolution) {
        case "1080p":
            return "2500k";
        case "720p":
            return "1500k";
        case "480p":
            return "800k";
        case "360p":
            return "400k";
        default:
            return "2500k"; // Default to 1080p bitrate
    }
}

// Function to get video buffer size for a given resolution
function getBufferSize(resolution) {
    switch (resolution) {
        case "1080p":
            return "5000k";
        case "720p":
            return "3000k";
        case "480p":
            return "1600k";
        case "360p":
            return "800k";
        default:
            return "5000k"; // Default to 1080p buffer size
    }
}

// Get video information
getVideoInfo(inputFilePath)
    .then(({ resolution, frameRate, totalFrames }) => {
        console.log("resolution", resolution)
        console.log("frameRate", frameRate)
        console.log("totalFrames", totalFrames)
        createLowerQualityVersions(resolution, frameRate, totalFrames);
    })
    .catch((error) => {
        console.error(`Error getting video information: ${error.message}`);
    });


function calculateTimeInSeconds(timemark) {
    const timeComponents = timemark.split(":").map(parseFloat);
    return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
}