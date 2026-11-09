# Raj Kahar · Video Editor portfolio

Static site with no build step: `index.html`, `styles.css`, `script.js`, plus the content in `data/projects.js`.

## Preview
Run `py -m http.server 8000` in this folder, then open http://localhost:8000.

## What's on the page
- **Hero**: a live edit timeline behind the headline (ruler + timecode on one clock, clips light up under the playhead) and a drifting wall of the reels with glass arrow buttons; clicking a tile plays that reel in its card. Both pause while off screen.
- **Work**: the featured interview + its vertical short, then the top 3 per niche from `categories` in `data/projects.js` (projects not listed there are not shown).
- **Motion graphics**: `motion` in `data/projects.js`, short silent loops cut from delivered videos into `assets/mg/<id>.mp4|.jpg` (480x854, nvenc cq24, 0.2 s fade in / 0.3 s fade out).
- **Liquid glass**: every `.lg` element gets an SVG lens in Chromium (script.js); other browsers keep the CSS glass.
- **Numbers / clients / experience**: from `stats` and `clients` in `data/projects.js`; the Seenmatic + freelance experience text is in `index.html`.
- **Animation**: the All Star Jewellery cartoon scenes, `animations` in `data/projects.js`, files in `assets/anim/<id>.mp4|.jpg` (silent loops).
- **Work**: a featured card, a reel grid with filters (first 8 shown, then "Show all") and a Film, sound & motion grid. Videos play inside their card with a custom player. J/K/L, Space, `,` `.` (one frame), M and F work on the playing video.
- **Colour**: a before/after wipe made from `assets/grade/raw.mp4` and `graded.mp4` (Seenmatic Video 36 at 6–12 s, ungraded vs colour-graded export).
- Services, process (drawn as timeline markers), about, and contact with Nepal local time.

## Edit content
All project text lives in `data/projects.js`. `group` sets the section and timeline track, `short` is the clip label, and `featured: true` makes the large card.

Each project `id` needs three files:
- `assets/posters/<id>.jpg`: hand-picked best frame (720 px wide for 9:16, 1280 px for 16:9)
- `assets/previews/<id>.mp4`: 5 s muted hover loop (480 px)
- `assets/video/<id>.mp4`: full video with sound (H.264, faststart)

All videos are 720p (1280x720 or 720x1280), encoded from the original exports in `F:\Exports` (moved from E: in Nov 2026; new ones were encoded with h264_nvenc -cq 23 -maxrate 2800k):
```
ffmpeg -i in.mov -vf scale=720:-2:flags=lanczos -c:v libx264 -preset slow -crf 22 -maxrate 2800k -bufsize 5600k -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart assets/video/<id>.mp4
ffmpeg -ss <t> -t 5 -i in.mov -an -vf scale=480:-2 -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart assets/previews/<id>.mp4
ffmpeg -nostdin -i in.mov -ss <t> -frames:v 1 -vf scale=720:-2:flags=lanczos -q:v 2 assets/posters/<id>.jpg
```
(Posters are JPEG on purpose: this ffmpeg's WebP encoder crushes stills into blur. Use scale=-2:720 for 16:9. The No Skip card is only the first 59.4 s of "draft 4.mp4", ending on a picture cut with a 0.8 s fade.)

The hero loop is 6 cut-free shots with 0.4 s dissolves and loops back into shot 1 seamlessly (19.7 s). The build script was session scratch: `hero.py` lists the source windows.

## Publishing
The whole folder is now small enough for any static host (every file is under 25 MB).
