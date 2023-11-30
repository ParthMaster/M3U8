const fs = require("fs");
const path = require("path");
const resolutions = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "2500k" },
  { name: "720p", width: 1280, height: 720, bitrate: "1500k" },
  { name: "480p", width: 854, height: 480, bitrate: "800k" },
  { name: "360p", width: 640, height: 360, bitrate: "400k" },
];

async function generateMasterPlaylist(resolutions, outputDirectory) {
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

module.exports = generateMasterPlaylist;
