# AdroIT Archive Challenge

A local, intermediate web-enumeration game set on an abandoned early-2000s school computer club website. It is entirely simulated: no real scanning, CAPTCHA service, login attack, or data collection occurs.

## Run locally here

Prerequisite: Python 3.8 or later must be installed and available as `python`.

From the project directory, create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the application dependency and start the Flask development server:

```powershell
python -m pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5001/` in a browser. Press `Ctrl+C` in the terminal to stop the server.

If PowerShell blocks script activation, run the commands in Command Prompt instead:

```bat
.venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python app.py
```

## Test

```powershell
python -m unittest -v
```

`SOLUTION.md` is for instructors only. Do not serve or link it from the application.

## ffuf/Hydra training extension

The app now includes a separate, entirely local enumeration lab. Its four unlinked
top-level portal routes are listed in `wordlists/ffuf_directories.txt`; three are
convincing decoys and only `internal-portal-x92` is the real route. `/flag` and
`/congratulations` are intentionally misleading bait routes.

The real portal references `/static/app.js`, whose maintenance note leads to a
local debug log. Each portal has an independent, IP-scoped lockout after three
failed login attempts. The lockout is 480 seconds—twice the 240-second reference
setting—so this remains a controlled local CTF exercise rather than a real login
attack. `wordlists/hydra_passwords.txt` is provided for the lab only.

Round 3 is presented in-site as **Evidence 03 — The Mirror Web Enumeration**.
The source challenge's core route is also present: `mirror-cache-9w` is unlinked,
listed in the provided ffuf wordlist, and returns the CyberLeek evidence directly.
`/robots.txt` contains only conventional decoy disallows. The original portal path
still leads to its session-gated evidence endpoint, so no existing archive routes
or puzzle stages change.

For the direct mirror exercise, enumerate only the local server:

```bash
ffuf -u http://127.0.0.1:5001/FUZZ -w wordlists/ffuf_directories.txt -mc 200
```

If you already have ffuf and Hydra installed, point them only at your local
`127.0.0.1:5001` development server. They are optional client tools and are not
Python dependencies of this website.
