(function () {
  'use strict';

  const PROGRESS_KEY = 'signalHarborProgressV1';
  const COMPLETION_KEY = 'signalHarborCompletionV1';
  const level = Number(document.body.dataset.level || 1);
  const access = Number(new URL(window.location.href).searchParams.get('access') || 0);

  function readProgress() {
    try { return Math.max(Number(localStorage.getItem(PROGRESS_KEY) || 0), access); }
    catch { return access; }
  }

  function writeProgress(value) {
    const next = Math.max(readProgress(), value);
    try { localStorage.setItem(PROGRESS_KEY, String(next)); } catch { /* storage is optional */ }
    return next;
  }

  function updateProgress() {
    const element = document.querySelector('[data-progress]');
    if (element) element.textContent = `${Math.min(readProgress(), 4)} / 4 flags verified`;
  }

  function showNotice(type, title, message, facts) {
    const panel = document.getElementById('judgeOutput');
    if (!panel) return;
    panel.className = `judge-panel is-visible ${type === 'success' ? 'is-success' : 'is-error'}`;
    panel.replaceChildren();
    const heading = document.createElement('h3');
    heading.className = 'judge-title'; heading.textContent = title;
    const copy = document.createElement('p');
    copy.className = 'judge-copy'; copy.textContent = message;
    panel.append(heading, copy);
    if (facts?.length) {
      const list = document.createElement('div'); list.className = 'test-list';
      facts.forEach((fact) => { const item = document.createElement('span'); item.textContent = fact; list.append(item); });
      panel.append(list);
    }
  }

  function revealNext() {
    writeProgress(level); updateProgress();
    const card = document.getElementById('unlockCard');
    const link = document.getElementById('nextLink');
    if (!card || !link) return;
    const nextHref = `${document.body.dataset.next}?access=${level}`;
    link.href = nextHref;
    link.textContent = new URL(nextHref, window.location.href).href;
    card.classList.add('is-revealed');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function guardAccess() {
    if (level === 1 || readProgress() >= level - 1) return true;
    document.getElementById('accessGate')?.classList.add('is-visible');
    return false;
  }

  function normalized(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }

  function installReset() {
    document.querySelectorAll('[data-reset-mission]').forEach((button) => button.addEventListener('click', () => {
      try { localStorage.removeItem(PROGRESS_KEY); localStorage.removeItem(COMPLETION_KEY); } catch { /* no-op */ }
      window.location.href = 'index.html';
    }));
  }

  function initRecon() {
    const run = document.getElementById('runButton');
    const output = document.getElementById('simOutput');
    run.addEventListener('click', () => {
      output.hidden = false;
      output.textContent = `Starting simulated scan at 2026-09-01 21:10 UTC\n\nNmap scan report for dock-gateway.training (10.88.19.27)\nHost is up (0.0021s latency).\n\nPORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 9.6\n80/tcp   open  http     Caddy 2.7.6\n8080/tcp open  http-alt Caddy 2.7.6\n\nService detection performed. This target is simulated and local to the training story.`;
      run.textContent = 'Scan complete'; run.disabled = true;
    });
    document.getElementById('submitAnswers').addEventListener('click', () => {
      const ports = normalized(document.getElementById('answerPorts').value);
      const server = normalized(document.getElementById('answerServer').value);
      const service = normalized(document.getElementById('answerService').value);
      if (ports !== '3' || !['caddy 2.7.6', 'caddy/2.7.6'].includes(server) || service !== 'http-alt') {
        showNotice('error', 'Answers need another look', 'Read each value directly from the simulated scan output.'); return;
      }
      showNotice('success', 'Dock gateway mapped', 'Flag recovered: HBR{open_docks_8080}', ['3 TCP services', 'Caddy 2.7.6', 'alternate HTTP discovered']);
      revealNext();
    });
  }

  function initDirectoryRoom() {
    const run = document.getElementById('runButton');
    const output = document.getElementById('simOutput');
    run.addEventListener('click', () => {
      output.hidden = false;
      output.textContent = `ffuf -w common-paths.txt -u http://dock-gateway.training:8080/FUZZ\n\n/admin                  [Status: 302, Size: 0]\n/assets                 [Status: 301, Size: 0]\n/_harbor                [Status: 301, Size: 0]\n/health                 [Status: 200, Size: 18]\n\nTip: enumerate the interesting directory one level deeper.`;
      run.textContent = 'Wordlist complete'; run.disabled = true;
    });
    document.getElementById('discoverDirectory').addEventListener('click', () => {
      const path = normalized(document.getElementById('directoryAnswer').value).replace(/\/$/, '');
      if (!['/_harbor', '_harbor'].includes(path) && !['/_harbor/manifest/releases.txt', '_harbor/manifest/releases.txt'].includes(path)) {
        showNotice('error', 'No archive route found', 'Start with the discovered parent path. Its response contains the next evidence reference.'); return;
      }
      if (['/_harbor', '_harbor'].includes(path)) {
        output.hidden = false;
        output.textContent = `HTTP/1.1 302 Found\nLocation: /_harbor/\nX-Archive-Ref: bWFuaWZlc3QvcmVsZWFzZXMudHh0\n\nThe response header is encoded. Decode it, then append the result to the discovered parent route.`;
        showNotice('success', 'Parent route confirmed', 'A response header contains the archive reference. Decode it before trying the next route.'); return;
      }
      document.getElementById('sourcePreview').hidden = false;
      showNotice('success', 'Release archive located', 'The simulated source archive contains an encoded evidence payload. Decode it before submitting the flag.', ['encoded response header', 'nested archive route', 'Base64 payload recovered']);
    });
    document.getElementById('submitAnswers').addEventListener('click', () => {
      if (normalized(document.getElementById('flagAnswer').value) !== 'hbr{paths_are_clues}') {
        showNotice('error', 'Flag not accepted', 'Copy the full flag from the manifest preview, including braces.'); return;
      }
      showNotice('success', 'Archive sealed', 'Flag two has been recorded. The cargo archive is now available.', ['directory enumeration', 'source exposure', 'flag verified']);
      revealNext();
    });
  }

  function initArtifactRoom() {
    const decode = document.getElementById('runButton');
    const output = document.getElementById('simOutput');
    decode.addEventListener('click', () => {
      output.hidden = false;
      output.textContent = `cargo-note.dat\n\nencoding chain: base64 -> base64 -> plaintext\npayload:\nU0VKU2UzWmhiR2xrWVhSbFgySmxlVzl1WkY5dGFXMWxmUT09\n\nIntegrity note: Decode every declared layer before trusting the artifact.`;
      decode.textContent = 'Note decoded'; decode.disabled = true;
    });
    document.getElementById('submitAnswers').addEventListener('click', () => {
      const control = document.querySelector('input[name="uploadControl"]:checked')?.value;
      const flag = normalized(document.getElementById('flagAnswer').value);
      if (control !== 'magic' || flag !== 'hbr{validate_beyond_mime}') {
        showNotice('error', 'Review incomplete', 'Choose the control that confirms a file is truly the claimed format, then submit the decoded flag.'); return;
      }
      showNotice('success', 'Cargo review complete', 'Correct: server-side structural checks and safe parsing are stronger than trusting a filename or browser MIME value.', ['defensive upload review', 'artifact decoded', 'flag verified']);
      revealNext();
    });
  }

  function initCipherRoom() {
    const decode = document.getElementById('runButton');
    const output = document.getElementById('simOutput');
    decode.addEventListener('click', () => {
      output.hidden = false;
      output.textContent = `RECOVERED TRANSIT RELAY / FRAGMENT 9X\n\nrecord-a: 3438343235323762373236663735373436353566\nrecord-b: 3633366637323732363536633631373436393666\nrecord-c: 3665356637373639366537333764\n\nchain note: the first pass is readable only after the second pass.\nformat note: no separators were preserved.`;
      decode.textContent = 'Artifact recovered'; decode.disabled = true;
    });
    document.getElementById('submitAnswers').addEventListener('click', () => {
      const encoding = normalized(document.getElementById('encodingAnswer').value);
      const flag = normalized(document.getElementById('flagAnswer').value);
      if (!['hex', 'base16', 'hexadecimal'].includes(encoding) || flag !== 'hbr{route_correlation_wins}') {
        showNotice('error', 'Evidence chain incomplete', 'The artifact needs two decoding passes. Identify the encoding and submit the complete recovered flag.'); return;
      }
      showNotice('success', 'Correlation complete', 'You reconstructed the relay note from the nested evidence records.', ['two-pass decode', 'hex / Base16 identified', 'flag verified']);
      revealNext();
    });
  }

  function initFinalRoom() {
    document.getElementById('submitAnswers').addEventListener('click', () => {
      const input = normalized(document.getElementById('flagBundle').value).replace(/\s/g, '');
      const expected = 'hbr{open_docks_8080},hbr{paths_are_clues},hbr{validate_beyond_mime},hbr{route_correlation_wins}';
      if (input !== expected) { showNotice('error', 'Signal bundle rejected', 'Enter the three flags in order, separated by commas.'); return; }
      const code = 'SH-2026-PORT-47';
      try { localStorage.setItem(COMPLETION_KEY, code); } catch { /* no-op */ }
      document.getElementById('finalCode').textContent = code;
      document.getElementById('finalSuccess').classList.add('is-visible');
      showNotice('success', 'Harbor signal restored', 'You completed the original Signal Harbor training run.', ['recon', 'discovery', 'secure design']);
      updateProgress();
    });
  }

  installReset(); updateProgress();
  if (!guardAccess()) return;
  if (level === 1) initRecon();
  if (level === 2) initDirectoryRoom();
  if (level === 3) initArtifactRoom();
  if (level === 4) initCipherRoom();
  if (level === 5) initFinalRoom();
})();
