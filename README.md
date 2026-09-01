# Signal Harbor

An original, browser-only CTF-style training run. It is inspired by the *format* of guided security rooms: story briefing, category and difficulty, progressive objectives, flags, hints, and completion tracking.

## Rooms

1. **Gate 8080** — simulated service enumeration.
2. **Hidden Manifest** — simulated directory discovery and exposed-artifact review.
3. **Silent Cargo** — defensive file-upload validation review.
4. **Relay Fragment 9X** — multi-part, two-pass forensic decoding.
5. **Completion** — submit the four flags in order.

All hosts, output, flags, and artifacts are fictional and self-contained. The site makes no network requests and does not provide a vulnerable target.

## Run locally

Open `index.html` in a browser, or serve the directory:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Production path

For a real multi-user platform, move flag validation and progress to a backend, authenticate learners, and provision each hands-on target in a disposable, network-isolated environment. Never place flags or answers in client-delivered source code for production rooms.
