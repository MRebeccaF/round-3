# Null Station — Web Enumeration

A standalone four-page coding challenge for first- and second-year computer-science students.

## Run it

Open `index.html` directly, or serve the folder locally for the most consistent browser behavior:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Challenge route

1. **Stack Deck** — next-greater-element DSA task with Python, C, Java, and C++ starters.
2. **Ghost Logs** — equivalent Linux/Bash or Windows/PowerShell forensic pipeline.
3. **Packet Lab** — JavaScript data reconstruction tested in a time-limited Web Worker.
4. **Five-Moon Lock** — a constraint puzzle with exactly one valid sequence.

Completing a level reveals the otherwise hidden link to the next page. The final puzzle generates a random numeric 10-digit completion code.

## Prototype judge note

The DSA and terminal challenges use deterministic browser-side structure checks so this demo has no compiler or backend dependency. The JavaScript challenge executes real hidden cases in a disposable Web Worker. A production classroom version should connect the multi-language challenges to a sandboxed compiler service.
