#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["wordfreq", "pyyaml"]
# ///
"""Word notes helper: uncommon words in RSOW posts, with a hover card each.

  uv run _tools/word-notes.py candidates _posts/<file>.md [--max-zipf 3.0]
      The post's uncommon words, rarest first, with a snippet of where each
      appears. Zipf is wordfreq's scale: 3 = once per million words,
      2 = once per ten million. Frequency only nominates; a person decides.

  uv run _tools/word-notes.py check [_posts/<file>.md ...]
      For each post that lists `words:`, confirm every key has an entry in
      _data/glossary/ and that the built page (_site/) has a spot the script
      will actually underline. Build first:
          bundle exec jekyll build --future
      With no files, checks every post that lists words.

  uv run _tools/word-notes.py unused
      Glossary entries no post in this checkout uses.

The marking rules here mirror assets/js/word-notes.js: the first occurrence
of a word (or one of its forms, optionally plural) in the post body that is
not inside a heading, link, code, caption or aside, and not inside the phrase
an AI Note anchors to.
"""
import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GLOSSARY = ROOT / "_data" / "glossary"
FIGURES = ROOT / "assets" / "images" / "words"
SITE = ROOT / "_site"

# Must match SKIP in assets/js/word-notes.js.
SKIP_TAGS = {"a", "code", "pre", "kbd", "samp", "h1", "h2", "h3", "h4", "h5", "h6",
             "script", "style", "button", "textarea", "select", "aside", "figcaption"}
SKIP_CLASSES = {"post-actions", "word-note"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}


def yaml():
    import yaml as _yaml
    return _yaml


def front_matter(path):
    text = Path(path).read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    data = yaml().safe_load(text[3:end]) or {}
    body = text[end + 4:]
    return data, body


def load_glossary():
    entries = {}
    for f in sorted(GLOSSARY.glob("*.yml")):
        entries[f.stem] = yaml().safe_load(f.read_text(encoding="utf-8")) or {}
    return entries


def norm_quotes(s):
    return (s.replace("‘", "'").replace("’", "'").replace("‚", "'")
             .replace("‛", "'").replace("“", '"').replace("”", '"')
             .replace("„", '"').replace("‟", '"'))


def forms_of(key, entry):
    forms = entry.get("forms") or [entry.get("word") or key]
    return sorted({str(f) for f in forms}, key=len, reverse=True)


def pattern_for(forms):
    # Same shape as the JS: a non-letter (or start) before, optional plural
    # suffix, no letter after. Spaces in a form match any run of whitespace.
    alts = "|".join(re.escape(f).replace(r"\ ", r"\s+") for f in forms)
    return re.compile(r"(^|[^\w])((?:" + alts + r")(?:s|es)?)(?!\w)", re.IGNORECASE)


# ── candidates ───────────────────────────────────────────────────────────

def plain_text(body):
    body = re.sub(r"```.*?```", " ", body, flags=re.S)
    body = re.sub(r"{%.*?%}|{{.*?}}", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", body)
    body = re.sub(r"\]\([^)]*\)", "]", body)
    body = re.sub(r"https?://\S+", " ", body)
    body = re.sub(r"`[^`]*`", " ", body)
    return html.unescape(body)


def cmd_candidates(args):
    from wordfreq import zipf_frequency
    glossary = load_glossary()
    known = {}
    for key, e in glossary.items():
        for f in forms_of(key, e):
            known[f.lower()] = key
    _, body = front_matter(args.post)
    text = norm_quotes(plain_text(body))
    seen = {}
    for m in re.finditer(r"[A-Za-z]+(?:'[A-Za-z]+)*", text):
        tok = m.group(0)
        if "'" in tok:
            base, rest = tok.split("'", 1)
            if rest.lower() != "s":
                continue  # a contraction (hasn't, they're): not a vocabulary word
            tok = base    # a possessive (Earth's): judge the word itself
        if len(tok) < 4 or (tok.isupper() and len(tok) > 1):
            continue
        low = tok.lower()
        rec = seen.setdefault(low, {"count": 0, "lower": False, "at": m.start()})
        rec["count"] += 1
        if tok[0].islower():
            rec["lower"] = True
    rows = []
    for low, rec in seen.items():
        if not rec["lower"] and not args.keep_caps:
            continue  # only ever capitalized: almost always a name
        z = zipf_frequency(low, "en")
        if z < args.max_zipf:
            rows.append((z, low, rec))
    rows.sort(key=lambda r: (r[0], r[1]))
    if not rows:
        print("No words under Zipf %.1f." % args.max_zipf)
        return 0
    for z, low, rec in rows:
        i = rec["at"]
        snip = " ".join(text[max(0, i - 55): i + 55].split())
        tag = "  [glossary: %s]" % known[low] if low in known else ""
        print("%5.2f  %-22s x%-2d%s\n       ...%s..." % (z, low, rec["count"], tag, snip))
    return 0


# ── check ────────────────────────────────────────────────────────────────

class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text")

    def __init__(self, tag=None, attrs=None, parent=None, text=None):
        self.tag, self.attrs, self.parent, self.text = tag, attrs or {}, parent, text
        self.children = []

    def classes(self):
        return set((self.attrs.get("class") or "").split())


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, dict(attrs), self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(Node(None, None, self.cur, data))


def walk(node):
    for c in node.children:
        yield c
        if c.tag is not None:
            yield from walk(c)


def find(node, pred):
    for n in walk(node):
        if n.tag is not None and pred(n):
            return n
    return None


def text_of(node):
    return "".join(n.text for n in walk(node) if n.tag is None)


def skipped(node):
    """Why a text node won't be underlined, or None if it can be."""
    n = node.parent
    while n is not None and n.tag != "#root":
        if n.tag in SKIP_TAGS:
            return "inside <%s>" % n.tag
        hit = n.classes() & SKIP_CLASSES
        if hit:
            return "inside .%s" % sorted(hit)[0]
        if "post-content" in n.classes():
            return None
        n = n.parent
    return None


def closest(node, tag):
    n = node.parent
    while n is not None and n.tag != "#root":
        if n.tag == tag:
            return n
        n = n.parent
    return None


BLOCKS = {"p", "li", "blockquote", "td", "th", "dd", "dt"}


def in_context(t, start, hit):
    """The text of the paragraph (or list item...) around a match, with the
    match in [brackets] — what `check --json` reports."""
    n = t.parent
    while n is not None and n.tag != "#root" and n.tag not in BLOCKS:
        n = n.parent
    block = n if n is not None and n.tag != "#root" else t.parent
    pos = 0
    for x in walk(block):
        if x is t:
            break
        if x.tag is None:
            pos += len(x.text)
    text = text_of(block)
    i = pos + start
    return " ".join((text[:i] + "[" + hit + "]" + text[i + len(hit):]).split())


def check_post(path, glossary, problems):
    data, _ = front_matter(path)
    keys = [str(k) for k in (data.get("words") or [])]
    if not keys:
        return None
    name = Path(path).name
    for key in keys:
        e = glossary.get(key)
        if e is None:
            problems.append("%s: \"%s\" has no _data/glossary/%s.yml" % (name, key, key))
        elif not str(e.get("definition") or "").strip():
            problems.append("%s: _data/glossary/%s.yml has no definition" % (name, key))
    slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", Path(path).stem)
    built = SITE / "post" / slug / "index.html"
    if not built.exists():
        problems.append("%s: no built page at %s (run `bundle exec jekyll build --future`)"
                        % (name, built.relative_to(ROOT)))
        return None
    raw = built.read_text(encoding="utf-8")
    m = re.search(r'id="word-notes-data"[^>]*>(.*?)</script>', raw, re.S)
    if not m:
        problems.append("%s: built page has no word-notes data (stale build, or the include is missing)" % name)
        return None
    shipped = {d["key"] for d in json.loads(m.group(1))}
    tree = Tree()
    tree.feed(raw)
    content = find(tree.root, lambda n: "post-content" in n.classes())
    if content is None:
        problems.append("%s: built page has no .post-content" % name)
        return None
    # Phrases the AI Notes anchor to, in each <p>: never underline inside them.
    ai = []
    m = re.search(r'id="ai-notes-data"[^>]*>(.*?)</script>', raw, re.S)
    if m:
        ai = [norm_quotes(n["quote"]) for n in json.loads(m.group(1)) if n.get("quote")]
    blocked = {}
    offsets = {}
    for p in (n for n in walk(content) if n.tag == "p"):
        ptext = norm_quotes(text_of(p))
        spans = []
        for q in ai:
            i = ptext.find(q)
            while i != -1:
                spans.append((i, i + len(q)))
                i = ptext.find(q, i + 1)
        blocked[id(p)] = spans
        pos = 0
        for t in (n for n in walk(p) if n.tag is None):
            offsets[id(t)] = pos
            pos += len(t.text)
    texts = [n for n in walk(content) if n.tag is None]
    marked = []  # (text node id, start, end)
    results = []
    for key in keys:
        e = glossary.get(key)
        if e is None or key not in shipped:
            continue
        rx = pattern_for(forms_of(key, e))
        found, reasons = None, []
        for t in texts:
            s = norm_quotes(t.text)
            for mm in rx.finditer(s):
                start = mm.start(2)
                end = start + len(mm.group(2))
                why = skipped(t)
                if not why:
                    p = closest(t, "p")
                    if p is not None and id(t) in offsets:
                        a, b = offsets[id(t)] + start, offsets[id(t)] + end
                        if any(a < y and b > x for x, y in blocked.get(id(p), [])):
                            why = "inside an AI Note's anchor phrase"
                if not why and any(tid == id(t) and start < y and end > x for tid, x, y in marked):
                    why = "already underlined for another word"
                if why:
                    reasons.append("\"%s\" %s" % (mm.group(2), why))
                    continue
                found = (t, start, end, mm.group(2))
                break
            if found:
                break
        if found:
            t, start, end, hit = found
            marked.append((id(t), start, end))
            JSON_OUT.append({"post": name, "key": key, "context": in_context(t, start, hit)})
            before = " ".join(t.text[:start].split()[-6:])
            after = " ".join(t.text[end:].split()[:6])
            results.append("  %-24s \"...%s [%s] %s...\"" % (key, before, hit, after))
        else:
            detail = "; ".join(sorted(set(reasons))) if reasons else "not in the post body"
            problems.append("%s: \"%s\" won't be underlined (%s)" % (name, key, detail))
        fig = e.get("figure")
        if fig and not (FIGURES / ("%s.svg" % fig)).exists():
            problems.append("%s: figure assets/images/words/%s.svg is missing" % (name, fig))
    return results


JSON_OUT = []


def cmd_check(args):
    glossary = load_glossary()
    posts = args.posts or sorted(str(p) for p in (ROOT / "_posts").glob("*.md"))
    problems, checked = [], 0
    for path in posts:
        before = len(problems)
        results = check_post(path, glossary, problems)
        if results is None and len(problems) == before:
            continue
        checked += 1
        print("%s  %s" % ("OK " if len(problems) == before else "!! ", Path(path).name))
        for r in results or []:
            print(r)
    for key, e in glossary.items():
        for field in ("definition", "pos"):
            if not str(e.get(field) or "").strip():
                problems.append("_data/glossary/%s.yml: missing %s" % (key, field))
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(JSON_OUT, f, ensure_ascii=False, indent=1)
    print()
    if problems:
        print("%d problem(s):" % len(problems))
        for p in problems:
            print("  - " + p)
        return 1
    print("All good: %d post(s) checked." % checked)
    return 0


def cmd_unused(args):
    glossary = load_glossary()
    used = set()
    for p in (ROOT / "_posts").glob("*.md"):
        data, _ = front_matter(p)
        used.update(str(k) for k in (data.get("words") or []))
    unused = sorted(set(glossary) - used)
    print("\n".join(unused) if unused else "Every glossary entry is used.")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("candidates")
    c.add_argument("post")
    c.add_argument("--max-zipf", type=float, default=3.0)
    c.add_argument("--keep-caps", action="store_true", help="include words only ever capitalized")
    k = sub.add_parser("check")
    k.add_argument("posts", nargs="*")
    k.add_argument("--json", metavar="FILE", help="also write where each underline lands, as JSON")
    sub.add_parser("unused")
    args = ap.parse_args()
    return {"candidates": cmd_candidates, "check": cmd_check, "unused": cmd_unused}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
