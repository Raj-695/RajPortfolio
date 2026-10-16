# Raj Kahar · Video Editor portfolio

Static site with no build step: `index.html`, `styles.css`, `script.js`, plus the content in `data/projects.js`.

## Preview
Run `py -m http.server 8000` in this folder, then open http://localhost:8000.

## What's on the page
- **Hero edit suite**: a program monitor (the `assets/hero/reel-loop.mp4` loop) and a timeline built from `data/projects.js`. Each project is a clip on V3 (long-form), V2 (reels) or V1 (film). Hovering a clip shows its preview on the monitor, and clicking it plays that project in its card.
- **Work**: a featured card, a Short-form grid and a Film, sound & motion grid. Videos play inside their card with a custom player. J/K/L, Space, `,` `.` (one frame), M and F work on the playing video.
- **Colour**: a before/after wipe made from `assets/grade/raw.mp4` and `graded.mp4` (Seenmatic Video 36 at 6–12 s, ungraded vs colour-graded export).
- Services, process (drawn as timeline markers), about, and contact with Nepal local time.

## Edit content
All project text lives in `data/projects.js`. `group` sets the section and timeline track, `short` is the clip label, and `featured: true` makes the large card.

Each project `id` needs three files:
- `assets/posters/<id>.webp`: still frame (1080 px wide for 9:16, 1920 px for 16:9)
- `assets/previews/<id>.mp4`: 5 s muted hover loop (480 px)
- `assets/video/<id>.mp4`: full video with sound (H.264, faststart)

All videos are 720p (1280x720 or 720x1280), encoded from the original exports in `E:\Editing stuff\Exports`:
```
ffmpeg -i in.mov -vf scale=720:-2:flags=lanczos -c:v libx264 -preset slow -crf 22 -maxrate 2800k -bufsize 5600k -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart assets/video/<id>.mp4
ffmpeg -ss <t> -t 5 -i in.mov -an -vf scale=480:-2 -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart assets/previews/<id>.mp4
ffmpeg -ss <t> -i in.mov -frames:v 1 -vf scale=1080:-2 -c:v libwebp -quality 82 assets/posters/<id>.webp
```
(Use scale=-2:720 for 16:9. The No Skip card is only the first 59.4 s of "draft 4.mp4", ending on a picture cut with a 0.8 s fade.)

The hero loop is 6 cut-free shots with 0.4 s dissolves and loops back into shot 1 seamlessly (19.7 s). The build script was session scratch: `hero.py` lists the source windows.

## Publishing
The whole folder is now small enough for any static host (every file is under 25 MB).
