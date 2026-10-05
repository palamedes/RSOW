#!/usr/bin/env python3
"""Waveform peaks for the narration player.

  python3 _tools/audio-peaks.py assets/audio/<slug>.ogg [more.ogg ...]
  python3 _tools/audio-peaks.py --all      every post's `audio:` file

Writes assets/audio/<slug>.peaks.json next to each file: 1,000 loudness
values (0-100) spread evenly across the track, plus its duration. Loudness
is the RMS of each slice: for speech it shows the shape of the sentences,
where raw peaks come out as a near-solid block. The site
player (_includes/audio-player.html) fetches that file to draw the waveform
in its seek bar; a track without one gets the plain progress bar instead.

Run it on the .ogg the site serves, after encoding, so the waveform lines
up with exactly what plays. Needs ffmpeg; nothing else beyond the stdlib.
"""
import array
import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUCKETS = 1000
RATE = 8000          # plenty to find peaks in speech, and quick to decode


def peaks_for(path):
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-nostdin", "-i", str(path), "-ac", "1", "-ar", str(RATE), "-f", "s16le", "-"],
        check=True, capture_output=True).stdout
    samples = array.array("h")
    samples.frombytes(pcm)
    if sys.byteorder == "big":
        samples.byteswap()
    n = len(samples)
    if not n:
        raise SystemExit("%s: no audio decoded" % path)
    raw = []
    for i in range(BUCKETS):
        a = i * n // BUCKETS
        b = max(a + 1, (i + 1) * n // BUCKETS)
        chunk = samples[a:b]
        raw.append(math.sqrt(sum(x * x for x in chunk) / len(chunk)))
    # Scale against a high percentile rather than the single loudest slice,
    # so one shout doesn't flatten everything else.
    ref = sorted(raw)[int(BUCKETS * 0.98)] or 1
    peaks = [round(min(1.0, v / ref) * 100) for v in raw]
    return {"version": 1, "duration": round(n / RATE, 2), "peaks": peaks}


def post_audio_files():
    files = []
    for post in sorted((ROOT / "_posts").glob("*.md")):
        head = post.read_text(encoding="utf-8").split("\n---", 1)[0]
        m = re.search(r"^audio:\s*(\S+)", head, re.M)
        if m:
            files.append(ROOT / m.group(1).lstrip("/"))
    return files


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__.strip())
        return 0
    targets = post_audio_files() if argv == ["--all"] else [Path(a) for a in argv]
    for src in targets:
        if not src.exists():
            print("missing: %s" % src, file=sys.stderr)
            continue
        out = src.with_suffix(".peaks.json")
        data = peaks_for(src)
        out.write_text(json.dumps(data, separators=(",", ":")) + "\n", encoding="utf-8")
        print("%-60s %6.1fs  %5d bytes" % (out.relative_to(ROOT) if out.is_relative_to(ROOT) else out,
                                           data["duration"], out.stat().st_size))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
