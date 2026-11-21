# Palace menu mockup

Röntgen, an early draft of Belveder's menu: the Upper Belvedere in x-ray, one room per project type.
It is a rough draft with invented sample data, not app code.

- Each room is a folder type from `D:\Private\Projects`; the ground-floor hall is the overview.
- A room shows its most recently changed projects as objects; the rest go into the drawers of a cabinet on the back wall.
- On a phone: swipe sideways to change room or project, drag the sheet up to read, drag it down to go back.

Files:

- `core.js`: the palace as line geometry, the line and x-ray shaders.
- `data.js`: sample projects, machines and GitHub rows.
- `roentgen.html`: the page; `build.py` inlines the two scripts into `out/roentgen.html` (not committed).

```sh
python3 design/palace/build.py
```

Uses three.js r128 from cdnjs and Funnel Display and Funnel Sans from Google Fonts.
Tested in headless Chromium only.

Published copy: https://claude.ai/artifact/86m7sExLQrrQuq5x921MQB
