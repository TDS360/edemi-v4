# Èdè Mi (v4)

A Yorùbá learning app: 21 courses, a 5-game hub with tower and leaderboards, phone-call practice, an Audio Lab for OpenSLR recordings, a Writing Lab, profile with badges and daily goal.

## Run it
- Open `index.html` in a browser (works from a folder, no server needed), or
- run `python3 build.py` to make one self-contained file, `dist/ede-mi.html`.

Phone calls and the Writing Lab need Claude (the published artifact provides it). Everything else works offline.

## Files
| File | What it does |
|---|---|
| `index.html` | Page shell. Lists the script order. |
| `css/app.css`, `css/features.css` | Styles (base, then v4 features). |
| `js/01-content.js` | Original 8 lessons, alphabet, tone data. |
| `js/02-courses.js` | **The 21 courses** and the extra lessons. Edit words here. |
| `js/03-core.js` | Saved progress, XP, badges, sound, speech, registries. |
| `js/04-learn.js` | Courses page, lessons, quizzes, flashcards. |
| `js/05-tones.js` | Tone parser, Tone Lab, Alphabet. |
| `js/06-call.js` | Chat and Call (10 scenarios across 3 levels). |
| `js/07-words.js` | Phrasebook and Culture. |
| `js/08-audiolab.js` | Audio Lab: import clips (IndexedDB), drills. |
| `js/09-games-common.js` | Game Hub, icons, tower, leaderboard (simulated rivals). |
| `js/10-…12-…` | Games 1-5. |
| `js/14-games-voice.js` | Games 6-8: Say It, Echo, Recall (speak out loud; auto-check or self-check). |
| `js/13-home-profile-write.js` | Home, Profile, Writing Lab. |
| `js/99-main.js` | Navigation and startup. Must load last. |
| `tools/prepare_openslr.py` | Picks clips from OpenSLR SLR86 for the Audio Lab. |
| `build.py` | Builds the single-file version. |

## Add a game (one file)
1. Copy `templates/game-template.js` to `js/15-my-game.js` and edit it. It is a complete working game.
2. In `index.html`, add `<script src="js/15-my-game.js"></script>` where the comment says (above `99-main.js`).
3. Optional: `python3 build.py` for the single-file version.
`registerGame({...})` adds it to the Game Hub, the leaderboards, the page addresses and the back button. The header of the template lists every helper you can use.

## Chat vs Call
- **Chat** (`#chat`): typed texting with a Yorùbá speaker, corrected as you go, rated at the end. Works wherever Claude is available.
- **Call** (`#call`): spoken. It rings, checks for a microphone and speech recognition, and if either is missing it sends you Home. Calls need both Claude (the published artifact) and a microphone (your own hosting), so they cannot run in the same place today.
- **Writing Lab** (`#write`): longer pieces, checked for spelling and tone marks.

## OpenSLR audio
1. Download from https://www.openslr.org/86/ the zip(s) and `line_index_*.tsv`.
2. `python3 tools/prepare_openslr.py --zip yo_ng_female.zip --tsv line_index_female.tsv --out clips --count 150`
3. In the app: Audio Lab → Choose files → select everything in `clips/`.
Licence: CC BY-SA 4.0, Copyright Google, Inc. Keep the credit.
