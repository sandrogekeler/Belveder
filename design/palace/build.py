"""Inline core.js and data.js into the page: python3 design/palace/build.py writes design/palace/out/roentgen.html."""
from pathlib import Path

here = Path(__file__).parent
core, data = (here / "core.js").read_text(), (here / "data.js").read_text()
panel_css = data.split("const PANEL_CSS = `")[1].split("`;")[0]
html = (
    (here / "roentgen.html").read_text()
    .replace("/*@CORE*/", core)
    .replace("/*@DATA*/", data)
    .replace("/*@PANELCSS*/", "")
    .replace("<style>\n", "<style>\n" + panel_css, 1)
)
out = here / "out"
out.mkdir(exist_ok=True)
(out / "roentgen.html").write_text(html)
print("built", out / "roentgen.html")
