const express = require("express");
const multer = require("multer");
const { sequelize, Video } = require("./sequelize");
const getVideoInfo = require("./utils/video-info");
const generateMasterPlaylist = require("./utils/generate-master-playlist");
const processResolution = require("./utils/process-resolution");
const getBestMatchingResolution = require("./utils/best-matching-resolution");

const app = express();
const port = 4000;

const resolutions = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "2500k" },
  { name: "720p", width: 1280, height: 720, bitrate: "1500k" },
  { name: "480p", width: 854, height: 480, bitrate: "800k" },
  { name: "360p", width: 640, height: 360, bitrate: "400k" },
];

// Set up multer storage and filename settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    const modifiedFileName = replaceSpacesWithUnderscores(file.originalname);
    cb(null, modifiedFileName);
  },
});

const upload = multer({ storage: storage });

// Sequelize model synchronization
sequelize.sync().then(() => {
  console.log("Sequelize models synced.");
});

// Middleware to replace spaces with underscores in filenames
const replaceSpacesWithUnderscores = (filename) => {
  return filename.replace(/ /g, "_");
};

// Route for uploading a video
app.post("/uploadVideo", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const video = await Video.create({
      path: req.file.filename,
    });

    return res
      .status(200)
      .json({ message: "Video uploaded successfully.", video });
  } catch (error) {
    console.error("Error uploading video:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Route for processing resolutions based on video ID
app.get("/processResolution/:videoId", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const video = await Video.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found." });
    }

    res.status(200).set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write("data: Process started\n\n");

    const inputFilePath = `uploads/${video.path}`;
    await processResolutions(inputFilePath);

    // Send a final message to indicate process completion
    res.write("data: Resolution processing complete\n\n");

    // End the SSE connection
    return res.end();
    // Add the necessary resolution processing logic here...
  } catch (error) {
    console.error("Error processing resolution:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

const processResolutions = async (inputFilePath) => {
  const outputDirectory = "output";
  try {
    const { frameRate, totalFrames, resolution, durationInSeconds } =
      await getVideoInfo(inputFilePath);
    const convertedResolution = await getBestMatchingResolution(resolution);

    const inputResolution = {
      width: convertedResolution.width,
      height: convertedResolution.height,
    };

    const filteredResolutions = resolutions.filter(
      (res) =>
        res.width <= inputResolution.width &&
        res.height <= inputResolution.height
    );

    for await (const targetResolution of filteredResolutions) {
      await processResolution({
        resolution: targetResolution.name,
        targetWidth: targetResolution.width,
        targetHeight: targetResolution.height,
        videoBitrate: targetResolution.bitrate,
        frameRate,
        totalFrames,
        durationInSeconds,
        inputFilePath,
        outputDirectory,
      });
    }

    await generateMasterPlaylist(filteredResolutions, outputDirectory);

    console.log("\nAll resolutions processed.");
  } catch (error) {
    console.error(error);
  }
};

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
