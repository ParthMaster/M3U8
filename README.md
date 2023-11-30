To run the commands, follow these steps:

1. **Prepare FFmpeg:**
   Make sure you have FFmpeg installed on your system. You can download it from the [official FFmpeg website](https://ffmpeg.org/download.html) or use a package manager like `apt`, `brew`, or `chocolatey` depending on your operating system.

2. **Create a Directory:**
   Create a directory to organize your files. For example, create a directory named `Loki` where you will store the output files.

   ```bash
   mkdir Loki
   ```

3. **Generate Output Files:**
   Run the FFmpeg commands in your terminal. Replace `input.mkv` with the actual filename of your input MKV file.

   - For 1080p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=1920x1080:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 2500k -maxrate 2500k -bufsize 5000k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/1080p_%03d.ts test/output_1080p.m3u8
     ```

   - For 720p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=1280x720:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 1500k -maxrate 1500k -bufsize 3000k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/720p_%03d.ts test/output_720p.m3u8
     ```

   - For 480p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=854x480:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 800k -maxrate 800k -bufsize 1600k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/480p_%03d.ts test/output_480p.m3u8
     ```

   - For 360p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=640x360:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 400k -maxrate 400k -bufsize 800k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/360p_%03d.ts test/output_360p.m3u8
     ```

   - For 240p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=426x240:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 250k -maxrate 250k -bufsize 500k -g 60 -c:a aac -b:a 64k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/240p_%03d.ts test/output_240p.m3u8
     ```

   - For 144p:

     ```bash
     ffmpeg -i input.mkv -vf "scale=256x144:flags=lanczos" -c:v libx264 -profile:v main -preset:v medium -b:v 120k -maxrate 120k -bufsize 240k -g 60 -c:a aac -b:a 64k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/144p_%03d.ts test/output_144p.m3u8
     ```

4. **Generate Master Playlist:**
   After generating all the individual resolution playlists, create a master playlist (`master.m3u8`) using the provided example:

   ```bash
   echo "#EXTM3U" > master.m3u8
   echo "#EXT-X-VERSION:3" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080" >> master.m3u8
   echo "output_1080p.m3u8" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720" >> master.m3u8
   echo "output_720p.m3u8" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480" >> master.m3u8
   echo "output_480p.m3u8" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360" >> master.m3u8
   echo "output_360p.m3u8" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=250000,RESOLUTION=426x240" >> master.m3u8
   echo "output_240p.m3u8" >> master.m3u8
   echo "#EXT-X-STREAM-INF:BANDWIDTH=120000,RESOLUTION=256x144" >> master.m3u8
   echo "output_144p.m3u8" >> master.m3u8
   ```

5. **Serve the Content:**
   To test your adaptive streaming setup, you can use a local web server to serve the content. You can use Python's built-in HTTP server for this:

   ```bash
   cd Loki
   python -m http.server
   ```

   Open your web browser and navigate to `http://localhost:8000/master.m3u8`. The browser should interpret the master playlist and allow you to switch between different resolutions based on your network conditions and device capabilities.

Remember to adjust the filenames and paths in the commands based on your actual file locations and naming conventions.

======================================================================

Absolutely, you can manually create the `master.m3u8` file using a text editor. Simply open your preferred text editor (such as Notepad, TextEdit, or Visual Studio Code) and copy-paste the content you provided into a new file. Save the file with the name `master.m3u8`.

Here's how you can do it:

1. Open your text editor.
2. Copy the following content:

   ```bash
   #EXTM3U
   #EXT-X-VERSION:3
   #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080
   output_1080p.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720
   output_720p.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480
   output_480p.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360
   output_360p.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=250000,RESOLUTION=426x240
   output_240p.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=120000,RESOLUTION=256x144
   output_144p.m3u8
   ```

3. Save the file with the name `master.m3u8`.

Now, you have manually created the `master.m3u8` file. Make sure it is in the same directory as your other M3U8 files, and you can use it for adaptive streaming.

=============================================================================

The error you're encountering indicates an issue with the x264 encoder when working with the MKV format. The error message "main profile doesn't support a bit depth of 10" suggests that the input video has a 10-bit color depth, and the specified x264 profile (`main`) does not support it.

To resolve this, you can try specifying a different x264 profile that supports a 10-bit color depth. The `high` profile is commonly used for this purpose. Here's an updated command:

```bash
ffmpeg -i input.mkv -vf "scale=1920x1080:flags=lanczos" -c:v libx264 -profile:v high -preset:v medium -b:v 2500k -maxrate 2500k -bufsize 5000k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/1080p_%03d.ts test/output_1080p.m3u8
```

In this command, I replaced `-profile:v main` with `-profile:v high`. The `high` profile supports a 10-bit color depth.

If you encounter any issues, you can also try using the `libx265` encoder instead of `libx264`, as `libx265` generally provides better performance for high-bit-depth videos. Here's an example:

```bash
ffmpeg -i input.mkv -vf "scale=1920x1080:flags=lanczos" -c:v libx265 -preset:v medium -b:v 2500k -maxrate 2500k -bufsize 5000k -g 60 -c:a aac -b:a 128k -ac 2 -map 0 -c:s copy -sn -hls_time 6 -hls_playlist_type vod -hls_segment_filename test/1080p_%03d.ts test/output_1080p.m3u8
```

Feel free to choose the option that best fits your needs. If the issue persists, you may want to check the input video properties and consider adjusting the encoding settings accordingly.
