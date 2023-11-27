const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const getVideoInfo = require("./utils/video-info");
const parseFrameRate = require("./utils/frame-rate-parser");

const inputFilePath = "input.mp4";
const outputDirectory = "output";

ffmpeg.setFfmpegPath(ffmpegStatic);

// ffmpeg -i input.mp4 -vf "scale=256x144:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 120k -maxrate 120k -bufsize 240k -g 60 -c:a aac -b:a 64k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename output/144p_%03d.ts output/output_144p.m3u8

getVideoInfo(inputFilePath)
    .then(({ frameRate, totalFrames }) => {
        ffmpeg()
            .input(inputFilePath)
            .videoFilter("scale=1920x1080:flags=lanczos")
            .videoCodec("libx264")
            .outputOptions("-profile:v main")
            .outputOptions("-preset:v medium")
            .videoBitrate("2500k")
            .outputOptions("-maxrate 2500k")
            .outputOptions("-bufsize 5000k")
            .outputOptions("-g 60")
            .audioCodec("aac")
            .audioBitrate("128k")
            .audioChannels(2)
            .outputOptions("-map 0")
            .outputOptions("-c:s copy")
            .outputOptions("-sn")
            .outputOptions("-hls_time 6")
            .outputOptions("-hls_playlist_type vod")
            .outputOptions(`-hls_segment_filename ${outputDirectory}/1080p_%03d.ts`)
            .output(`${outputDirectory}/output_1080p.m3u8`)
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
                console.log("FFmpeg has finished.");
            })
            .on("error", (error) => {
                console.error("Error:", error);
            })
            .run();
    })
    .catch((error) => {
        console.error(error.message);
    });

function calculateTimeInSeconds(timemark) {
    const timeComponents = timemark.split(":").map(parseFloat);
    return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
}