#!/usr/bin/env python3
"""Pick short sentences from the OpenSLR Yoruba corpus (SLR86) and write a folder the Èdè Mi Audio Lab can import.

Download first from https://www.openslr.org/86/ :
  yo_ng_female.zip, yo_ng_male.zip (audio) and line_index_female.tsv, line_index_male.tsv (sentences).

Example:
  python3 tools/prepare_openslr.py --zip yo_ng_female.zip --tsv line_index_female.tsv --out clips --count 150
  (add --zip/--tsv again for the male set; add --mp3 to shrink files if ffmpeg is installed)

Output: <out>/<id>.wav (or .mp3), <out>/clips.json, <out>/CREDITS.txt.
Then open Audio Lab in the app, tap Choose files, and select everything in the output folder.
Only the Python standard library is needed (ffmpeg is optional, for --mp3).
"""
import argparse, json, os, re, shutil, subprocess, sys, unicodedata, zipfile

CREDIT = ("Open-source Yoruba speech corpus (OpenSLR SLR86). Copyright Google, Inc. Licensed CC BY-SA 4.0: "
          "https://creativecommons.org/licenses/by-sa/4.0/ . Gutkin, Demirsahin, Kjartansson, Rivera and Tubosun, "
          "'Developing an Open-Source Corpus of Yoruba Speech', Interspeech 2020, pp. 404-408. "
          "Clips were selected from the corpus and, if --mp3 was used, converted to MP3.\n")

def stem(name):
    return os.path.splitext(os.path.basename(name))[0].strip().lower()

def read_tsv(path):
    """id -> sentence. First column is the id, last column is the sentence."""
    out = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            cols = line.rstrip('\r\n').split('\t')
            if len(cols) >= 2 and cols[0].strip():
                text = unicodedata.normalize('NFC', re.sub(r'\s+', ' ', cols[-1]).strip())
                if text:
                    out[stem(cols[0])] = text
    return out

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--zip', action='append', required=True, help='audio zip (repeatable)')
    ap.add_argument('--tsv', action='append', required=True, help='line_index tsv (repeatable)')
    ap.add_argument('--out', default='clips', help='output folder (default: clips)')
    ap.add_argument('--count', type=int, default=150, help='how many clips to keep (default 150, the app accepts 300)')
    ap.add_argument('--min-words', type=int, default=3)
    ap.add_argument('--max-words', type=int, default=9)
    ap.add_argument('--mp3', action='store_true', help='convert to mp3 with ffmpeg to save space')
    a = ap.parse_args()

    sentences = {}
    for t in a.tsv:
        sentences.update(read_tsv(t))
    if not sentences:
        sys.exit('No sentences found. Check the --tsv file (tab separated: id, sentence).')

    # shortest unique sentences first, within the word limits
    seen, cands = set(), []
    for i, text in sentences.items():
        n = len(text.split())
        if a.min_words <= n <= a.max_words and text.lower() not in seen:
            seen.add(text.lower()); cands.append((len(text), i, text))
    cands.sort()
    want = {i: t for _, i, t in cands}

    if a.mp3 and not shutil.which('ffmpeg'):
        sys.exit('--mp3 needs ffmpeg on your PATH. Install it or run without --mp3.')
    os.makedirs(a.out, exist_ok=True)

    rows = []
    for zp in a.zip:
        with zipfile.ZipFile(zp) as z:
            members = {stem(n): n for n in z.namelist() if n.lower().endswith('.wav')}
            for _, i, text in cands:
                if len(rows) >= a.count:
                    break
                if i not in members or any(r['id'] == i for r in rows):
                    continue
                dest = os.path.join(a.out, i + '.wav')
                with z.open(members[i]) as src, open(dest, 'wb') as dst:
                    shutil.copyfileobj(src, dst)
                if a.mp3:
                    mp3 = os.path.join(a.out, i + '.mp3')
                    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', dest, '-ac', '1', '-b:a', '48k', mp3], check=True)
                    os.remove(dest); dest = mp3
                rows.append({'id': i, 'file': os.path.basename(dest), 'text': want[i]})
    if not rows:
        sys.exit('No audio matched the sentences. Make sure the zip and the tsv are from the same set (female with female).')

    with open(os.path.join(a.out, 'clips.json'), 'w', encoding='utf-8') as f:
        json.dump([{'file': r['file'], 'text': r['text']} for r in rows], f, ensure_ascii=False, indent=1)
    with open(os.path.join(a.out, 'CREDITS.txt'), 'w', encoding='utf-8') as f:
        f.write(CREDIT)
    mb = sum(os.path.getsize(os.path.join(a.out, r['file'])) for r in rows) / 1048576
    print(f'Wrote {len(rows)} clips ({mb:.1f} MB) to {a.out}/')
    print('Now open the app, go to Audio Lab, tap Choose files and select everything in that folder.')
    print('Credit (keep this if you share the clips):\n' + CREDIT)

if __name__ == '__main__':
    main()
