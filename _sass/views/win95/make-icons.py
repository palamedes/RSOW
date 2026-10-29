"""Windows 95 design: makes _icons.scss, its pixel art as SVG data URIs.

    python3 _sass/views/win95/make-icons.py

Icons are 16x16 rows of letters, one letter per palette colour ("." is
clear); glyphs are one-colour rows of "x". The rest (the title-bar
buttons, the Start flag and banner, Paint's tool and colour boxes,
WordPad's bars and ruler, Explorer's column headers, the monitor) are
drawn with the same helpers. Each comes out as one path per colour.
"""
import os
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "_icons.scss")
PAL = {
 'k':'#000','w':'#fff','s':'#c0c0c0','g':'#808080','n':'#000080','b':'#0000ff',
 'c':'#00ffff','t':'#008080','y':'#ffff00','o':'#808000','r':'#ff0000','m':'#800000',
 'G':'#00ff00','d':'#008000','f':'#f2c79a','h':'#8a4b14','p':'#ff00ff','e':'#e0e0e0',
}
I = {}
I['folder'] = [
"................",
"................",
"..kkkkk.........",
".kyyyyyk........",
"kyyyyyyykkkkkkk.",
"kwwwwwwwwwwwwwyk",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kwyyyyyyyyyyyyok",
"kooooooooooooook",
".kkkkkkkkkkkkkk.",
]
I['folder-open'] = [
"................",
"................",
"..kkkkk.........",
".kyyyyyk........",
"kyyyyyyykkkkkk..",
"kyyyyyyyyyyyyyk.",
"kyyykkkkkkkkkkkk",
"kyykwwwwwwwwwwwk",
"kyykwyyyyyyyyyyk",
"kykwyyyyyyyyyyok",
"kykwyyyyyyyyyok.",
"kkwyyyyyyyyyyok.",
"kkwyyyyyyyyyok..",
"kwyyyyyyyyyyok..",
"kooooooooooook..",
"kkkkkkkkkkkkk...",
]
I['doc'] = [
"..kkkkkkkkk.....",
"..kwwwwwwwkk....",
"..kwwwwwwwkwk...",
"..kwggggwwkkkk..",
"..kwwwwwwwwwwk..",
"..kwgggggggwwk..",
"..kwwwwwwwwwwk..",
"..kwgggggggwwk..",
"..kwwwwwwwwwwk..",
"..kwgggggggwwk..",
"..kwwwwwwwwwwk..",
"..kwggggggwwwk..",
"..kwwwwwwwwwwk..",
"..kwwwwwwwwwwk..",
"..kkkkkkkkkkkk..",
"................",
]
I['wordpad'] = [
"..kkkkkkkkk.....",
"..kwwwwwwwkk....",
"..kwwwwwwwkwk...",
"..kwnwwwnwkkkk..",
"..kwnwwwnwwwwk..",
"..kwnwnwnwwwwk..",
"..kwnwnwnwwwwk..",
"..kwwnwnwwwwwk..",
"..kwwwwwwwwwwk..",
"..kwgggggggwwk..",
"..kwwwwwwwwwwk..",
"..kwgggggggwwk..",
"..kwwwwwwwwwwk..",
"..kwggggggwwwk..",
"..kkkkkkkkkkkk..",
"................",
]
I['computer'] = [
"................",
".kkkkkkkkkkkkkk.",
".kwwwwwwwwwwwwgk",
".kwkkkkkkkkkkwgk",
".kwkttttttttkwgk",
".kwktcctttttkwgk",
".kwktcttttttkwgk",
".kwkttttttttkwgk",
".kwkttttttttkwgk",
".kwkkkkkkkkkkwgk",
".kwwwwwwwwwwwwgk",
".kggggggggggggk.",
"....kkkkkkkk....",
"..kkssssssssskk.",
"..kwwwwwwwwwwgk.",
"..kkkkkkkkkkkkk.",
]
I['help'] = [
"................",
"...kkkkkkkkkkk..",
"..knnnnnnnnnnnk.",
"..knnnnyyyynnnk.",
"..knnnyynnyynnk.",
"..knnnnnnnyynnk.",
"..knnnnnnyynnnk.",
"..knnnnnyynnnnk.",
"..knnnnnyynnnnk.",
"..knnnnnnnnnnnk.",
"..knnnnnyynnnnk.",
"..knnnnnnnnnnnk.",
"..kkkkkkkkkkkkk.",
"..kwwwwwwwwwwwk.",
"...kkkkkkkkkkkk.",
"................",
]
I['joystick'] = [
"................",
"......kkkk......",
".....krrrrk.....",
".....krwrrk.....",
".....krrrrk.....",
"......kkkk......",
".......kk.......",
".......kk.......",
".......kk.......",
"..kkkkkkkkkkkk..",
".kssssskksssssgk",
".kswwwwwwwwwwsgk",
".ksrrsssssssssgk",
".ksssssssssssggk",
".kggggggggggggk.",
"..kkkkkkkkkkkk..",
]
I['chart'] = [
"................",
".kkkkkkkkkkkkkk.",
".kwwwwwwwwwwwwk.",
".kwwwwwwwwwwwwk.",
".kwkwwwwwwwddwk.",
".kwkwwwwwwwddwk.",
".kwkwwwwrrwddwk.",
".kwkwwwwrrwddwk.",
".kwkwbbwrrwddwk.",
".kwkwbbwrrwddwk.",
".kwkwbbwrrwddwk.",
".kwkwbbwrrwddwk.",
".kwkkkkkkkkkkwk.",
".kwwwwwwwwwwwwk.",
".kkkkkkkkkkkkkk.",
"................",
]
I['globe'] = [
"................",
".....kkkkkk.....",
"...kkbbddbbkk...",
"..kbbddddbbbbk..",
".kbbbdddbbbddbk.",
".kbbbbddbbdddbk.",
"kbbbbbdbbddddbbk",
"kbbbbbbbbbdddbbk",
"kbddbbbbbbbdbbbk",
"kbddddbbbbbbbbbk",
"kbbddddbbbbbbbbk",
".kbbdddbbbbbbbk.",
".kbbbddbbbbbbbk.",
"..kbbbdbbbbbbk..",
"...kkbbbbbbkk...",
".....kkkkkk.....",
]
I['user'] = [
"................",
"......kkkk......",
".....kffffk.....",
"....kffffffk....",
"....kfkffkfk....",
"....kffffffk....",
"....ksffffsk....",
"....kssggssk....",
".....kssssk.....",
"......kssk......",
"...kkknnnnkkk...",
"..knnnnwwnnnnk..",
".knnnnnwwnnnnnk.",
".knnnnnnnnnnnnk.",
".knnnnnnnnnnnnk.",
".kkkkkkkkkkkkkk.",
]
I['picture'] = [
"................",
".kkkkkkkkkkkkkk.",
".kccccccccyyyck.",
".kcccccccyyyyyk.",
".kccwwwccyyyyyk.",
".kcwwwwwccyyyck.",
".kcccccccccccck.",
".kcccccdcccccck.",
".kccccdddccccck.",
".kcccdddddcGGck.",
".kccdddddddGGGk.",
".kcdddddddddGGk.",
".kdddddddddddGk.",
".kGGGGGGGGGGGGk.",
".kkkkkkkkkkkkkk.",
"................",
]
I['paint'] = [
"................",
"..........kk....",
".........kssk...",
"........ksgk....",
".......ksgk.....",
"......khhk......",
".....khhk.......",
"..kkkkkk........",
".kwwwwwwkk......",
"kwrrwwbbwwk.....",
"kwrrwwbbwwwk....",
"kwwwwwwwwwwk....",
"kwyywwddwwk.....",
"kwyywwddwk......",
".kkwwwwkk.......",
"...kkkk.........",
]
I['speaker'] = [
"................",
".......kk.......",
"......ksk.......",
".....kssk...k...",
".kkkkssskk...k..",
".kwwsssssk.k..k.",
".kwssssssk..k.k.",
".kwssssssk..k.k.",
".kwssssssk..k.k.",
".kgssssssk.k..k.",
".kkkkggggk...k..",
".....kggk...k...",
"......kgk.......",
".......kk.......",
"................",
"................",
]
I['info'] = [
"................",
".....kkkkkk.....",
"...kkbbbbbbkk...",
"..kbbbbwwbbbbk..",
".kbbbbbwwbbbbbk.",
".kbbbbbbbbbbbbk.",
"kbbbbbwwwbbbbbbk",
"kbbbbbbwwbbbbbbk",
"kbbbbbbwwbbbbbbk",
"kbbbbbbwwbbbbbbk",
".kbbbbbwwbbbbbk.",
".kbbbbwwwwbbbbk.",
"..kbbbbbbbbbbk..",
"...kkbbbbbbkk...",
".....kkkkkk.....",
"................",
]
I['tag'] = [
"................",
".kkkkkkk........",
".kyyyyyyk.......",
".kykkyyyyk......",
".kykkyyyyyk.....",
".kyyyyyyyyyk....",
".kyyyyyyyyyyk...",
"..kyyyyyyyyyyk..",
"...kyyyyyyyyyyk.",
"....kyyyyyyyyok.",
".....kyyyyyyok..",
"......kyyyyok...",
".......kyyok....",
"........kok.....",
".........k......",
"................",
]
I['tools'] = [
"................",
"..kkkkkkk.......",
".kssssssgk......",
".kswwwwsggk.....",
".kssssssgk......",
"..kkkkkkk.......",
".....khhk.......",
"......khhk......",
".......khhk.....",
"........khhk....",
".........khhk...",
"..........khhk..",
"...........khhk.",
"............khk.",
".............k..",
"................",
]
I['calendar'] = [
"................",
"..k..k..k..k....",
".krrrrrrrrrrrrk.",
".krrrrrrrrrrrrk.",
".kkkkkkkkkkkkkk.",
".kwwwwwwwwwwwwk.",
".kwkwkwkwkwkwwk.",
".kwwwwwwwwwwwwk.",
".kwkwkwkwkwkwwk.",
".kwwwwwwwwwwwwk.",
".kwkwkwkwrrwwwk.",
".kwwwwwwwrrwwwk.",
".kwkwkwkwwwwwwk.",
".kwwwwwwwwwwwwk.",
".kkkkkkkkkkkkkk.",
"................",
]
I['notepad'] = [
"..k.k.k.k.k.....",
".kkkkkkkkkkkk...",
".kwwwwwwwwwwk...",
".kwkkkkkkkwwk...",
".kwwwwwwwwwwk...",
".kwkkkkkkkkwk...",
".kwwwwwwwwwwk...",
".kwkkkkkkwwwk...",
".kwwwwwwwwwwk...",
".kwkkkkkkkkwk...",
".kwwwwwwwwwwk...",
".kwkkkkkwwwwk...",
".kwwwwwwwwwwk...",
".kkkkkkkkkkkk...",
"................",
"................",
]
I['blue-screen'] = [
"................",
".kkkkkkkkkkkkkk.",
".kbbbbbbbbbbbbk.",
".kbwwwwbbbbbbbk.",
".kbbbbbbbbbbbbk.",
".kbwwwwwwwwbbbk.",
".kbwwwwwwbbbbbk.",
".kbbbbbbbbbbbbk.",
".kbwwwwwwwbbbbk.",
".kbbbbbbbbbbbbk.",
".kkkkkkkkkkkkkk.",
"......kkkk......",
"....kkkkkkkk....",
"................",
"................",
"................",
]
I['mail'] = [
"................",
"................",
"................",
".kkkkkkkkkkkkkk.",
".kkwwwwwwwwwwkk.",
".kwkwwwwwwwwkwk.",
".kwwkwwwwwwkwwk.",
".kwwwkwwwwkwwwk.",
".kwwwwkkkkwwwwk.",
".kwwwkwwwwkwwwk.",
".kwwkwwwwwwkwwk.",
".kwkwwwwwwwwkwk.",
".kkkkkkkkkkkkkk.",
"................",
"................",
"................",
]
I['rss'] = [
"................",
".kkkkkkkkkkkkkk.",
".kooooooooooooook"[:16],
]
del I['rss']

def svg(rows, name):
    assert len(rows) == 16, (name, len(rows))
    paths = {}
    for y, row in enumerate(rows):
        assert len(row) == 16, (name, y, row, len(row))
        x = 0
        while x < 16:
            ch = row[x]
            if ch == '.':
                x += 1; continue
            run = 1
            while x + run < 16 and row[x + run] == ch:
                run += 1
            paths.setdefault(ch, []).append(f"M{x} {y}h{run}v1h-{run}z")
            x += run
    body = "".join(f"<path fill='{PAL[c]}' d='{''.join(d)}'/>" for c, d in paths.items())
    s = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>{body}</svg>"
    return s.replace('<', '%3C').replace('>', '%3E').replace('#', '%23')

out = ["// Generated pixel-art icons (16x16, the Windows 95 palette). Each is an",
       "// SVG data URI; draw them at 16 or 32px so the pixels stay square.",
       "// Made by make-icons.py beside this file: edit the rows there and rerun",
       "// it rather than editing these.",
       "", "$icons: ("]
for name, rows in I.items():
    out.append(f'  "{name}": url("data:image/svg+xml,{svg(rows, name)}"),')
out.append(");")
open(OUT, 'w').write("\n".join(out) + "\n")
print("wrote", len(I), "icons")


# ── glyphs: one colour, any size ─────────────────────────
def glyph(rows, color='#000', name=''):
    h = len(rows); w = len(rows[0])
    d = []
    for y, row in enumerate(rows):
        assert len(row) == w, (name, y)
        x = 0
        while x < w:
            if row[x] != 'x':
                x += 1; continue
            run = 1
            while x + run < w and row[x + run] == 'x':
                run += 1
            d.append(f"M{x} {y}h{run}v1h-{run}z")
            x += run
    s = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' width='{w}' height='{h}' shape-rendering='crispEdges'><path fill='{color}' d='{''.join(d)}'/></svg>"
    return s

G = {}
G['min'] = ["xxxxxx", "xxxxxx"]
G['max'] = ["xxxxxxxxx", "xxxxxxxxx", "x.......x", "x.......x", "x.......x", "x.......x", "x.......x", "x.......x", "xxxxxxxxx"]
G['restore'] = ["..xxxxxx", "..xxxxxx", "..x....x", "xxxxxx.x", "xxxxxx.x", "x....xxx", "x....x..", "x....x..", "xxxxxx.."]
G['close'] = ["xx....xx", ".xx..xx.", "..xxxx..", "...xx...", "..xxxx..", ".xx..xx.", "xx....xx"]
G['down'] = ["xxxxxxx", ".xxxxx.", "..xxx..", "...x..."]
G['up'] = ["...x...", "..xxx..", ".xxxxx.", "xxxxxxx"]
G['right'] = ["x...", "xx..", "xxx.", "xxxx", "xxx.", "xx..", "x..."]
G['left'] = ["...x", "..xx", ".xxx", "xxxx", ".xxx", "..xx", "...x"]
G['check'] = ["......x", ".....xx", "x...xxx", "xx.xxx.", "xxxxx..", ".xxx...", "..x...."]
G['dot'] = [".xx.", "xxxx", "xxxx", ".xx."]
GL = {}
for n, rows in G.items():
    GL[n] = glyph(rows, '#000', n)
GL['down-white'] = glyph(G['down'], '#fff')
GL['right-white'] = glyph(G['right'], '#fff')
GL['check-white'] = glyph(G['check'], '#fff')
GL['down-grey'] = glyph(G['down'], '#808080')
GL['up-grey'] = glyph(G['up'], '#808080')

# the three title-bar buttons, drawn for the no-script fallback (decorative)
def btn(x, inner):
    return (f"<g transform='translate({x} 0)'><path fill='#0a0a0a' d='M0 0h20v18H0z'/><path fill='#fff' d='M0 0h19v17H0z'/>"
            f"<path fill='#808080' d='M1 1h18v16H1z'/><path fill='#dfdfdf' d='M1 1h17v15H1z'/><path fill='#c0c0c0' d='M2 2h16v14H2z'/>{inner}</g>")
def glyph_path(rows, ox, oy):
    d = []
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            if row[x] != 'x':
                x += 1; continue
            run = 1
            while x + run < len(row) and row[x + run] == 'x':
                run += 1
            d.append(f"M{ox+x} {oy+y}h{run}v1h-{run}z")
            x += run
    return f"<path d='{''.join(d)}'/>"
tb = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 62 18' width='62' height='18' shape-rendering='crispEdges'>"
      + btn(0, glyph_path(G['min'], 6, 11)) + btn(20, glyph_path(G['max'], 5, 4)) + btn(42, glyph_path(G['close'], 6, 5)) + "</svg>")
GL['titlebuttons'] = tb

# the Start flag: four panes, waving
flag = [
"................",
"......rrrr.GG...",
"..k..rrrrr.GGGG.",
".....rrrrr.GGGGG",
".k..rrrrr.GGGGG.",
"....rrrrr.GGGGG.",
"k...rrrr..GGGG..",
"................",
"....bbbb..yyyy..",
"..k.bbbbb.yyyyy.",
"...bbbbb.yyyyy..",
".k.bbbbb.yyyyy..",
"...bbbbb.yyyyy..",
"k..bbbb...yyy...",
"................",
"................",
]
FL = {'r': '#ff0000', 'G': '#00a800', 'b': '#0000ff', 'y': '#ffd800', 'k': '#000'}
paths = {}
for y, row in enumerate(flag):
    assert len(row) == 16, ('flag', y)
    for x, ch in enumerate(row):
        if ch in FL:
            paths.setdefault(ch, []).append(f"M{x} {y}h1v1h-1z")
GL['flag'] = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>"
              + "".join(f"<path fill='{FL[c]}' d='{''.join(d)}'/>" for c, d in paths.items()) + "</svg>")

# the Start menu's banner: the site's name up the left edge, like "Windows95"
GL['banner'] = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 320' width='28' height='320'>"
                "<text transform='translate(21 312) rotate(-90)' font-family='Arial, Helvetica, Liberation Sans, sans-serif' font-size='19'>"
                "<tspan fill='#c0c0c0' font-weight='400'>RandomString</tspan><tspan fill='#fff' font-weight='700'>OfWords</tspan></text></svg>")

GL['rss'] = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'><path fill='#000' d='M0 0h16v16H0z'/>"
             "<path fill='#ff8000' d='M1 1h14v14H1z'/><path fill='#fff' d='M3 11h2v2H3zM3 7h2c2 0 4 2 4 4v2H7v-2c0-1-1-2-2-2H3zM3 3h2c4 0 8 4 8 8v2h-2v-2c0-3-3-6-6-6H3z'/></svg>")


# Paint's colour box: the current colours, then 2 rows of 14 sunken wells
PALETTE = ["#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080ff","#004080","#4000ff","#804000",
           "#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040"]
parts = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 34' width='300' height='34' shape-rendering='crispEdges'>"]
def well(x, y, w, h, fill):
    return (f"<path fill='#808080' d='M{x} {y}h{w}v1H{x}zM{x} {y}h1v{h}h-1z'/><path fill='#fff' d='M{x} {y+h-1}h{w}v1H{x}zM{x+w-1} {y}h1v{h}h-1z'/>"
            f"<path fill='#000' d='M{x+1} {y+1}h{w-2}v1H{x+1}zM{x+1} {y+1}h1v{h-2}h-1z'/><path fill='#dfdfdf' d='M{x+1} {y+h-2}h{w-2}v1H{x+1}zM{x+w-2} {y+1}h1v{h-2}h-1z'/>"
            f"<path fill='{fill}' d='M{x+2} {y+2}h{w-4}v{h-4}H{x+2}z'/>")
parts.append(well(0, 1, 32, 32, "#c0c0c0"))
parts.append("<path fill='#fff' d='M12 13h14v14H12z'/><path fill='#000' d='M6 7h14v14H6z'/>")
for i, c in enumerate(PALETTE):
    col, row = i % 14, i // 14
    parts.append(well(36 + col * 18, 1 + row * 16, 17, 16, c))
parts.append("</svg>")
GL['palette'] = "".join(parts)

# Paint's tool box: two columns of little tool buttons, for show
TOOLS = [
 ["..xxxx..", ".x....x.", "x..xx..x", ".x....x.", "..xxxx.."],   # select (free-form)
 ["xxxxxxxx", "x......x", "x......x", "x......x", "xxxxxxxx"],   # select
 ["....xx..", "...x..x.", "..x..x..", ".xxxx...", "xxx....."],   # eraser
 ["...xxx..", "..x..x..", ".xxxxxx.", ".x....x.", "..xxxx.."],   # fill
 ["....x...", "...xxx..", "..xxx...", ".xxx....", "xx......"],   # pick colour
 [".xxx....", "x...x...", "x...x...", ".xxx.x..", "......x."],   # magnifier
 ["......x.", ".....x..", "....x...", "...x....", "xx......"],   # pencil
 ["....xxx.", "...xxx..", "..xxx...", ".x......", "x......."],   # brush
 ["x.x.x...", ".x.x.x..", "x.x.x...", ".x.x....", "x.x....."],   # airbrush
 ["xxxxxx..", "..xx....", "..xx....", "..xx....", ".xxxx..."],   # text
 ["x.......", ".x......", "..x.....", "...x....", "....x..."],   # line
 ["..xxx...", ".x...x..", "x.....x.", "x.......", "x......."],   # curve
 ["xxxxxxx.", "x.....x.", "x.....x.", "x.....x.", "xxxxxxx."],   # rectangle
 ["..xx....", ".x..xx..", "x.....x.", ".x...x..", "..xxx..."],   # polygon
 ["..xxx...", ".x...x..", "x.....x.", ".x...x..", "..xxx..."],   # ellipse
 [".xxxxx..", "x.....x.", "x.....x.", "x.....x.", ".xxxxx.."],   # rounded rectangle
]
parts = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 208' width='52' height='208' shape-rendering='crispEdges'>"]
for i, rows in enumerate(TOOLS):
    x, y = (i % 2) * 26, (i // 2) * 26
    w = h = 25
    parts.append(f"<path fill='#0a0a0a' d='M{x} {y}h{w}v{h}H{x}z'/><path fill='#fff' d='M{x} {y}h{w-1}v{h-1}H{x}z'/>"
                 f"<path fill='#808080' d='M{x+1} {y+1}h{w-2}v{h-2}H{x+1}z'/><path fill='#dfdfdf' d='M{x+1} {y+1}h{w-3}v{h-3}H{x+1}z'/>"
                 f"<path fill='#c0c0c0' d='M{x+2} {y+2}h{w-4}v{h-4}H{x+2}z'/>")
    d = []
    for ry, row in enumerate(rows):
        rx = 0
        while rx < len(row):
            if row[rx] != 'x':
                rx += 1; continue
            run = 1
            while rx + run < len(row) and row[rx + run] == 'x':
                run += 1
            d.append(f"M{x+4+rx*2} {y+7+ry*2}h{run*2}v2h-{run*2}z")
            rx += run
    parts.append(f"<path fill='#000' d='{''.join(d)}'/>")
parts.append("</svg>")
GL['toolbox'] = "".join(parts)

# Display Properties' monitor: a 1995 CRT with a 144x90 screen at (18,10)
def bevel(x, y, w, h, tl, br, fill):
    return (f"<path fill='{br}' d='M{x} {y}h{w}v{h}H{x}z'/><path fill='{tl}' d='M{x} {y}h{w-1}v{h-1}H{x}z'/>"
            f"<path fill='{fill}' d='M{x+1} {y+1}h{w-2}v{h-2}H{x+1}z'/>")
mon = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 138' width='180' height='138' shape-rendering='crispEdges'>"]
mon.append(bevel(0, 0, 180, 112, '#ffffff', '#0a0a0a', '#c0c0c0'))
mon.append(bevel(1, 1, 178, 110, '#dfdfdf', '#808080', '#c0c0c0'))
mon.append(bevel(16, 8, 148, 94, '#808080', '#ffffff', '#000000'))
mon.append("<path fill='#00ff00' d='M156 105h4v2h-4z'/><path fill='#808080' d='M10 105h20v1H10z'/>")
mon.append(bevel(66, 112, 48, 10, '#dfdfdf', '#0a0a0a', '#c0c0c0'))
mon.append(bevel(40, 122, 100, 14, '#ffffff', '#0a0a0a', '#c0c0c0'))
mon.append("</svg>")
GL['monitor'] = "".join(mon)

# ── WordPad's bars (for show) ────────────────────────────
SMALL = {}
SMALL['floppy'] = [
"................",".kkkkkkkkkkkkkk.",".knnwwwwwwwwnnk.",".knnwggggggwnnk.",".knnwwwwwwwwnnk.",".knnwggggggwnnk.",
".knnwwwwwwwwnnk.",".knnnnnnnnnnnnk.",".knnnnnnnnnnnnk.",".knnssssssssnnk.",".knnsskkssssnnk.",".knnsskkssssnnk.",
".knnsskkssssnnk.",".knnssssssssnnk.",".kkkkkkkkkkkkkk.","................"]
SMALL['printer'] = [
"................","....kkkkkkkk....","....kwwwwwwk....","....kwkkkkwk....","....kwwwwwwk....","..kkkkkkkkkkkk..",
".kssssssssssssk.",".kssssssssssGsk.",".kssssssssssssk.",".kggggggggggggk.",".kkkkkkkkkkkkkk.","..kwwwwwwwwwwk..",
"..kwkkkkkkkkwk..","..kwwwwwwwwwwk..","..kkkkkkkkkkkk..","................"]
SMALL['scissors'] = [
"................","...k......k.....","...k......k.....","....k....k......","....k....k......",".....k..k.......",
"......kk........","......kk........",".....n..n.......","...nnn..nnn.....","..n..n..n..n....","..n..n..n..n....",
"...nn....nn.....","................","................","................"]
SMALL['paste'] = [
"................","......kkkk......","..kkkkksskkkkk..",".khhhhkkkkhhhhk.",".khwwwwwwwwwwhk.",".khwkkkkkkkwwhk.",
".khwwwwwwwwwwhk.",".khwkkkkkkwwwhk.",".khwwwwwwwwwwhk.",".khwkkkkkkkwwhk.",".khwwwwwwwwwwhk.",".khwkkkkwwwwwhk.",
".khwwwwwwwwwwhk.",".khhhhhhhhhhhhk.",".kkkkkkkkkkkkkk.","................"]
SMALL['undo'] = [
"................","................","....k...........","...kk...........","..kkkkkkkk......",".kkkkkkkkkk.....",
"..kkk.....kk....","...k.......k....","...........k....","...........k....","..........k.....",".........k......",
"................","................","................","................"]
def pix(rows, ox, oy):
    out = {}
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            ch = row[x]
            if ch == '.':
                x += 1; continue
            run = 1
            while x + run < len(row) and row[x + run] == ch:
                run += 1
            out.setdefault(ch, []).append(f"M{ox+x} {oy+y}h{run}v1h-{run}z")
            x += run
    return "".join(f"<path fill='{PAL[c]}' d='{''.join(d)}'/>" for c, d in out.items())
def icon_rows(name):
    return I.get(name) or SMALL[name]
def tbtn(x, y, w=24, h=22):
    return (f"<path fill='#0a0a0a' d='M{x} {y}h{w}v{h}H{x}z'/><path fill='#fff' d='M{x} {y}h{w-1}v{h-1}H{x}z'/>"
            f"<path fill='#808080' d='M{x+1} {y+1}h{w-2}v{h-2}H{x+1}z'/><path fill='#dfdfdf' d='M{x+1} {y+1}h{w-3}v{h-3}H{x+1}z'/>"
            f"<path fill='#c0c0c0' d='M{x+2} {y+2}h{w-4}v{h-4}H{x+2}z'/>")
def sep(x, y, h=22):
    return f"<path fill='#808080' d='M{x} {y}h1v{h}h-1z'/><path fill='#fff' d='M{x+1} {y}h1v{h}h-1z'/>"
def combo(x, y, w, label):
    return (f"<path fill='#808080' d='M{x} {y}h{w}v1H{x}zM{x} {y}h1v22h-1z'/><path fill='#fff' d='M{x} {y+21}h{w}v1H{x}zM{x+w-1} {y}h1v22h-1z'/>"
            f"<path fill='#0a0a0a' d='M{x+1} {y+1}h{w-2}v1H{x+1}zM{x+1} {y+1}h1v20h-1z'/><path fill='#fff' d='M{x+2} {y+2}h{w-4}v18H{x+2}z'/>"
            + tbtn(x + w - 19, y + 2, 17, 18) + glyph_path(G['down'], x + w - 14, y + 9)
            + f"<text x='{x+6}' y='{y+16}' font-family='Arial, Liberation Sans, Helvetica, sans-serif' font-size='13' fill='#000'>{label}</text>")
bars = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 560 56' width='560' height='56' shape-rendering='crispEdges'>"]
x = 4
for name in ['doc', 'folder-open', 'floppy', 'printer']:
    bars.append(tbtn(x, 2) + pix(icon_rows(name), x + 4, 5)); x += 24
x += 6; bars.append(sep(x - 4, 2))
for name in ['scissors', 'paste', 'undo']:
    bars.append(tbtn(x, 2) + pix(icon_rows(name), x + 4, 5)); x += 24
x += 6; bars.append(sep(x - 4, 2))
bars.append(tbtn(x, 2) + pix(icon_rows('calendar'), x + 4, 5))
# format bar
y = 30
bars.append(combo(4, y, 168, 'Times New Roman'))
bars.append(combo(178, y, 52, '19'))
x = 238
for ch, style in [('B', "font-weight='700' font-family='Arial, Liberation Sans, sans-serif'"), ('I', "font-style='italic' font-family='Times New Roman, Liberation Serif, serif'"), ('U', "text-decoration='underline' font-family='Arial, Liberation Sans, sans-serif'")]:
    bars.append(tbtn(x, y) + f"<text x='{x+12}' y='{y+16}' text-anchor='middle' font-size='14' {style}>{ch}</text>")
    x += 24
x += 6; bars.append(sep(x - 4, y))
lines = {'left': ["xxxxxxxxx", ".........", "xxxxxx...", ".........", "xxxxxxxxx", ".........", "xxxxxx..."],
         'center': ["xxxxxxxxx", ".........", ".xxxxxxx.", ".........", "xxxxxxxxx", ".........", ".xxxxxxx."],
         'right': ["xxxxxxxxx", ".........", "...xxxxxx", ".........", "xxxxxxxxx", ".........", "...xxxxxx"]}
for i, k in enumerate(['left', 'center', 'right']):
    bars.append(tbtn(x, y) + glyph_path(lines[k], x + 7, y + 7)); x += 24
bars.append("</svg>")
GL['wp-bars'] = "".join(bars)

ruler = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1400 24' width='1400' height='24' shape-rendering='crispEdges'>",
         "<path fill='#808080' d='M0 4h1400v1H0z'/><path fill='#fff' d='M0 5h1400v14H0z'/><path fill='#dfdfdf' d='M0 19h1400v1H0z'/>"]
d = []
for i in range(0, 1400, 12):
    k = (i // 12) % 8
    if k == 0:
        continue
    h = 4 if k == 4 else 2
    d.append(f"M{i} {12 - h // 2}h1v{h}h-1z")
ruler.append(f"<path fill='#000' d='{''.join(d)}'/>")
for n in range(1, 15):
    ruler.append(f"<text x='{n*96}' y='16' text-anchor='middle' font-family='Arial, Liberation Sans, sans-serif' font-size='10' fill='#000'>{n}</text>")
ruler.append("</svg>")
GL['wp-ruler'] = "".join(ruler)
# the ruler's margin markers (left: two triangles; right: one)
GL['wp-marker-l'] = glyph(["x.......x", "xx.....xx", "xxx...xxx", "xxxxxxxxx", "x.......x", "xxxxxxxxx"][::1], '#000')

# Explorer's Details view column headers (Type / Modified / blank)
def header(cols):
    W = sum(w for _, w in cols)
    out = [f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} 24' width='{W}' height='24' shape-rendering='crispEdges'>"]
    x = 0
    for label, w in cols:
        out.append(f"<path fill='#0a0a0a' d='M{x} 0h{w}v24H{x}z'/><path fill='#fff' d='M{x} 0h{w-1}v23H{x}z'/>"
                   f"<path fill='#808080' d='M{x+1} 1h{w-2}v22H{x+1}z'/><path fill='#c0c0c0' d='M{x+1} 1h{w-3}v21H{x+1}z'/>")
        if label:
            out.append(f"<text x='{x+8}' y='16.5' font-family='Tahoma, Segoe UI, Liberation Sans, Arial, sans-serif' font-size='14' fill='#000'>{label}</text>")
        x += w
    out.append("</svg>")
    return "".join(out)
GL['details-head'] = header([('Type', 158), ('Modified', 124), ('', 98)])
GL['details-head-narrow'] = header([('Modified', 124), ('', 98)])

def enc(s):
    return s.replace('%', '%25').replace('<', '%3C').replace('>', '%3E').replace('#', '%23')
out = ["", "$glyphs: ("]
for n, s in GL.items():
    out.append(f'  "{n}": url("data:image/svg+xml,{enc(s)}"),')
out.append(");")
open(OUT, 'a').write("\n".join(out) + "\n")
print("wrote", len(GL), "glyphs")
