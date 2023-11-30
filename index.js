const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const getVideoInfo = require("./video-info");
const fs = require("fs");
const path = require("path");

const inputFilePath = "input1.mkv";
const outputDirectory = "output";
const resolutions = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "2500k" },
  { name: "720p", width: 1280, height: 720, bitrate: "1500k" },
  { name: "480p", width: 854, height: 480, bitrate: "800k" },
  { name: "360p", width: 640, height: 360, bitrate: "400k" },
];

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
        `-hls_segment_filename ${outputDirectory}/${resolution}_%03d.ts`
      )
      .output(`${outputDirectory}/output_${resolution}.m3u8`)
      .on("progress", (progress) => {
        if (progress.frames && progress.timemark) {
          const currentTime = calculateTimeInSeconds(progress.timemark);
          const estimatedCurrentFrame = Math.floor(frameRate * currentTime);
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

    const convertedResolution = await getBestMatchingResolution(resolution);

    const inputResolution = {
      width: convertedResolution.width,
      height: convertedResolution.height,
    };

    // Filter resolutions based on input resolution
    const filteredResolutions = resolutions.filter(
      (res) =>
        res.width <= inputResolution.width &&
        res.height <= inputResolution.height
    );

    console.log(
      "resolution:",
      resolution,
      "\nconvertedResolution:",
      convertedResolution,
      "\nfilteredResolutions:",
      filteredResolutions
    );

    for (const targetResolution of filteredResolutions) {
      console.log({
        resolution: targetResolution.name,
        targetWidth: targetResolution.width,
        targetHeight: targetResolution.height,
        videoBitrate: targetResolution.bitrate,
        frameRate,
        totalFrames,
      });
      await processResolution({
        resolution: targetResolution.name,
        targetWidth: targetResolution.width,
        targetHeight: targetResolution.height,
        videoBitrate: targetResolution.bitrate,
        frameRate,
        totalFrames,
      });
    }
    await generateMasterPlaylist(filteredResolutions);
    console.log("\nAll resolutions processed.");
  } catch (error) {
    console.error(error.message);
  }
})();

function calculateTimeInSeconds(timemark) {
  const timeComponents = timemark.split(":").map(parseFloat);
  return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
}

async function generateMasterPlaylist(resolutions) {
  const masterPlaylistPath = path.join(outputDirectory, "master.m3u8");

  const playlists = resolutions.map((resolution) => {
    return {
      path: `output_${resolution.name}.m3u8`,
      resolution: `${resolution.width}x${resolution.height}`,
    };
  });
  console.log(playlists);
  const masterContent = `#EXTM3U\n${playlists
    .map(
      (playlist) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${getBandwidth(
          playlist.resolution
        )},RESOLUTION=${playlist.resolution}\n${playlist.path}`
    )
    .join("\n")}`;

  fs.writeFileSync(masterPlaylistPath, masterContent);

  console.log("Master playlist created:", masterPlaylistPath);
}

function getBandwidth(resolution) {
  // Calculate bandwidth based on resolution (you can adjust this calculation)
  const [width, height] = resolution.split("x");
  const bitrate = resolutions.find(
    (res) => res.width === parseInt(width) && res.height === parseInt(height)
  ).bitrate;
  return parseInt(bitrate) * 1000; // Convert bitrate to bits per second
}
