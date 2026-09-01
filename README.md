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