(function () {
  'use strict';

  const PROGRESS_KEY = 'nullStationProgressV1';
  const FINAL_CODE_KEY = 'nullStationFinalCodeV1';
  const pageLevel = Number(document.body.dataset.level || '1');
  let memoryProgress = 0;
  let memoryFinalCode = '';

  const dsaLanguages = {
    python: {
      name: 'Python',
      file: 'next_greater.py',
      starter: `def next_greater(nums):
    """Return the next greater value to the right of every item."""
    # TODO: solve in O(n) with a monotonic stack
    pass`,
    reference: `def next_greater(nums):
    result = [-1] * len(nums)
    stack = []

    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            result[stack.pop()] = value
        stack.append(i)

    return result`,
    checks: [
      [/\bwhile\b/, 'Use a while-loop to release smaller values from the stack.'],
      [/stack\s*=|stack\.append/, 'Create and use a stack of array indices.'],
      [/stack\.append\s*\(/, 'Push each unresolved index onto the stack.'],
      [/stack\.pop\s*\(/, 'Pop indices when their next greater value arrives.'],
      [/result\s*=.*-1|\[-1\]/s, 'Initialize unresolved answers to -1.'],
      [/result\s*\[.*\]\s*=/s, 'Write the current value into the popped index.'],
      [/\breturn\s+result\b/, 'Return the completed result list.'],
    ],
  },
    c: {
      name: 'C',
      file: 'next_greater.c',
      starter: `void nextGreater(const int nums[], int n, int out[]) {
    /* TODO: fill out[] in O(n) with an index stack. */
}`,
      reference: `void nextGreater(const int nums[], int n, int out[]) {
    int stack[n];
    int top = -1;

    for (int i = 0; i < n; i++) {
        out[i] = -1;
    }

    for (int i = 0; i < n; i++) {
        while (top >= 0 && nums[stack[top]] < nums[i]) {
            out[stack[top--]] = nums[i];
        }
        stack[++top] = i;
    }
}`,
      checks: [
      [/\bint\s+stack\s*\[/, 'Create an integer stack for unresolved indices.'],
      [/\btop\s*=\s*-1/, 'Initialize the stack top to -1.'],
      [/\bwhile\s*\(/, 'Use a while-loop to release smaller values.'],
      [/nums\s*\[\s*stack\s*\[\s*top\s*\]\s*\]/, 'Compare against the value at the stacked index.'],
      [/out\s*\[.*\]\s*=\s*-1/s, 'Initialize unresolved output positions to -1.'],
      [/out\s*\[\s*stack\s*\[.*\]\s*\]\s*=/s, 'Write results using the popped stack index.'],
      [/stack\s*\[.*top.*\]\s*=\s*i/s, 'Push the current index onto the stack.'],
      ],
    },
    java: {
      name: 'Java',
      file: 'Solution.java',
      starter: `import java.util.*;

class Solution {
    int[] nextGreater(int[] nums) {
        // TODO: solve in O(n) with a monotonic stack
        return new int[0];
    }
}`,
      reference: `import java.util.*;

class Solution {
    int[] nextGreater(int[] nums) {
        int[] result = new int[nums.length];
        Arrays.fill(result, -1);
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < nums.length; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
                result[stack.pop()] = nums[i];
            }
            stack.push(i);
        }
        return result;
    }
}`,
      checks: [
      [/Deque\s*<\s*Integer\s*>|ArrayDeque\s*<\s*>/, 'Use a deque as the index stack.'],
      [/Arrays\.fill\s*\(\s*result\s*,\s*-1\s*\)/, 'Initialize unresolved answers to -1.'],
      [/\bwhile\s*\(/, 'Use a while-loop to release smaller values.'],
      [/stack\.(peek|peekLast)\s*\(/, 'Inspect the unresolved index at the top.'],
      [/stack\.(pop|removeLast)\s*\(/, 'Pop an index when its answer is found.'],
      [/stack\.(push|addLast)\s*\(\s*i\s*\)/, 'Push the current index onto the stack.'],
      [/result\s*\[.*\]\s*=/s, 'Write the next greater value into result.'],
      [/\breturn\s+result\s*;/, 'Return the completed result array.'],
      ],
    },
    cpp: {
      name: 'C++',
      file: 'next_greater.cpp',
      starter: `#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreater(const vector<int>& nums) {
    // TODO: solve in O(n) with a monotonic stack
    return {};
}`,
      reference: `#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreater(const vector<int>& nums) {
    vector<int> result(nums.size(), -1);
    stack<int> pending;

    for (int i = 0; i < static_cast<int>(nums.size()); i++) {
        while (!pending.empty() && nums[pending.top()] < nums[i]) {
            result[pending.top()] = nums[i];
            pending.pop();
        }
        pending.push(i);
    }
    return result;
}`,
      checks: [
      [/stack\s*<\s*int\s*>/, 'Create a stack of unresolved indices.'],
      [/vector\s*<\s*int\s*>\s+result\s*\(.*-1/s, 'Initialize unresolved answers to -1.'],
      [/\bwhile\s*\(/, 'Use a while-loop to release smaller values.'],
      [/\.(top)\s*\(/, 'Inspect the unresolved index at the top.'],
      [/\.pop\s*\(/, 'Pop an index when its answer is found.'],
      [/\.push\s*\(\s*i\s*\)/, 'Push the current index onto the stack.'],
      [/result\s*\[.*\]\s*=/s, 'Write the next greater value into result.'],
      [/\breturn\s+result\s*;/, 'Return the completed result vector.'],
      ],
    },
  };

  const terminalModes = {
    linux: {
      label: 'Linux / Bash',
      prompt: 'operator@null-station:~/mission/logs $',
      starter: '# Current directory: ~/mission/logs\n# Write one pipeline below\n',
      reference: 'grep -ril --include="*.log" "ACCESS DENIED" . | sort > ../evidence.txt',
    },
    windows: {
      label: 'Windows / PowerShell',
      prompt: 'PS C:\\null-station\\mission\\logs>',
      starter: '# Current directory: C:\\null-station\\mission\\logs\n# Write one pipeline below\n',
      reference: "Get-ChildItem -Recurse -Filter *.log | Select-String -Pattern 'ACCESS DENIED' | Select-Object -ExpandProperty Path -Unique | Sort-Object | Set-Content ..\\evidence.txt",
    },
  };

  const packetStarter = `function assemblePackets(packets) {
  // 1. Ignore corrupt packets
  // 2. Group by channel
  // 3. Order each channel by seq and join payloads
  // 4. Return channel keys in alphabetical order

}`;

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // The URL access token still allows the static pages to work without storage.
    }
  }

  function accessFromUrl() {
    const raw = new URL(window.location.href).searchParams.get('access');
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 4 ? parsed : 0;
  }

  function readProgress() {
    const stored = Number(safeGet(PROGRESS_KEY) || 0);
    const progress = Math.max(memoryProgress, Number.isFinite(stored) ? stored : 0, accessFromUrl());
    memoryProgress = progress;
    return progress;
  }

  function writeProgress(level) {
    const next = Math.max(readProgress(), level);
    memoryProgress = next;
    safeSet(PROGRESS_KEY, String(next));
    return next;
  }

  function readFinalCode() {
    return safeGet(FINAL_CODE_KEY) || memoryFinalCode;
  }

  function writeFinalCode(code) {
    memoryFinalCode = code;
    safeSet(FINAL_CODE_KEY, code);
  }

  function syncProgress() {
    const progress = readProgress();
    document.querySelectorAll('.progress-step').forEach((step, index) => {
      const stepLevel = index + 1;
      step.classList.toggle('is-complete', progress >= stepLevel);
      if (stepLevel === pageLevel) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });

    const fragment = document.querySelector('[data-fragment-status]');
    if (fragment) {
      const recovered = Math.min(progress, 4);
      fragment.textContent = `${recovered} / 4 fragments recovered`;
    }
  }

  function guardAccess() {
    if (pageLevel <= 1 || readProgress() >= pageLevel - 1) return true;
    const gate = document.getElementById('accessGate');
    if (gate) gate.classList.add('is-visible');
    return false;
  }

  function resetMission() {
    safeRemove(PROGRESS_KEY);
    safeRemove(FINAL_CODE_KEY);
    memoryProgress = 0;
    memoryFinalCode = '';
    window.location.href = 'index.html';
  }

  function setButtonBusy(button, busy, label) {
    if (!button) return;
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.originalLabel;
  }

  function renderJudge(type, title, copy, tests) {
    const panel = document.getElementById('judgeOutput');
    if (!panel) return;

    panel.className = `judge-panel is-visible ${type === 'success' ? 'is-success' : 'is-error'}`;
    panel.replaceChildren();

    const heading = document.createElement('h3');
    heading.className = 'judge-title';
    heading.textContent = title;

    const body = document.createElement('p');
    body.className = 'judge-copy';
    body.textContent = copy;

    panel.append(heading, body);

    if (tests && tests.length) {
      const list = document.createElement('div');
      list.className = 'test-list';
      tests.forEach((test) => {
        const item = document.createElement('span');
        item.textContent = test;
        list.append(item);
      });
      panel.append(list);
    }
  }

  function revealNext(level) {
    const card = document.getElementById('unlockCard');
    const nextLink = document.getElementById('nextLink');
    if (!card || !nextLink) return;

    writeProgress(level);
    syncProgress();

    const nextPage = document.body.dataset.next;
    nextLink.href = `${nextPage}?access=${level}`;
    card.classList.add('is-revealed');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function insertTabInTextarea(event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = `${input.value.slice(0, start)}  ${input.value.slice(end)}`;
    input.selectionStart = input.selectionEnd = start + 2;
  }

  function installRunShortcut(button, input) {
    input.addEventListener('keydown', (event) => {
      insertTabInTextarea(event);
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        button.click();
      }
    });
  }

  function stripComments(code, language) {
    if (language === 'python') {
      return code.replace(/#.*$/gm, '').trim();
    }
    return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
  }

  function validateDsa(code, language) {
    const config = dsaLanguages[language];
    const clean = stripComments(code, language);

    if (clean.length < 80 || /\b(pass|TODO)\b/i.test(clean) || /return\s+(new\s+int\s*\[\s*0\s*\]|\{\})/.test(clean)) {
      return { ok: false, message: 'The function is still incomplete. Replace the placeholder with your full O(n) solution.' };
    }

    if (/\b(sort|sorted|qsort|Arrays\.sort|Collections\.sort)\b/.test(clean)) {
      return { ok: false, message: 'Sorting changes the target complexity. The station needs an O(n) monotonic stack.' };
    }

    const failedCheck = config.checks.find(([pattern]) => !pattern.test(clean));
    if (failedCheck) {
      return { ok: false, message: failedCheck[1] };
    }

    return { ok: true };
  }

  function initDsaLevel() {
    const select = document.getElementById('languageSelect');
    const input = document.getElementById('codeInput');
    const fileName = document.getElementById('fileName');
    const runButton = document.getElementById('runButton');
    const resetButton = document.getElementById('resetCodeButton');

    function loadLanguage() {
      const config = dsaLanguages[select.value];
      input.value = config.starter;
      fileName.textContent = config.file;
      document.getElementById('judgeOutput').className = 'judge-panel';
    }

    select.addEventListener('change', loadLanguage);
    resetButton.addEventListener('click', loadLanguage);
    runButton.addEventListener('click', () => {
      setButtonBusy(runButton, true, 'Running checks...');
      window.setTimeout(() => {
        const result = validateDsa(input.value, select.value);
        setButtonBusy(runButton, false);
        if (!result.ok) {
          renderJudge('error', 'Stack trace interrupted', result.message);
          return;
        }

        renderJudge(
          'success',
          'All hidden checks passed',
          `${dsaLanguages[select.value].name} solution recognized as an O(n) monotonic-stack approach.`,
          ['[4,5,2,25]', '[13,7,6,12]', 'descending input', 'empty input'],
        );
        revealNext(1);
      }, 520);
    });

    installRunShortcut(runButton, input);
    loadLanguage();
  }

  function validateTerminal(command, mode) {
    const normalized = command.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalized.length < 24) {
      return { ok: false, message: 'The relay needs a complete pipeline, not a single command name.' };
    }

    if (mode === 'linux') {
      const checks = [
        [/\b(grep|find)\b/, 'Search the files with grep (directly or through find).'],
        [/(\s-[a-z]*r[a-z]*\b|-recurse\b)/, 'Search recursively through nested folders.'],
        [/(\s-[a-z]*i[a-z]*\b|--ignore-case)/, 'Make the text match case-insensitive.'],
        [/(\*\.log|\.log)/, 'Limit the search to .log files.'],
        [/access denied/, 'Search for the exact phrase ACCESS DENIED.'],
        [/\|\s*sort\b/, 'Sort the matching paths before writing them.'],
        [/>\s*\.\.\/evidence\.txt|tee\s+\.\.\/evidence\.txt/, 'Write the result to ../evidence.txt.'],
      ];
      const failed = checks.find(([pattern]) => !pattern.test(normalized));
      return failed ? { ok: false, message: failed[1] } : { ok: true };
    }

    const checks = [
      [/get-childitem|\bgci\b/, 'Enumerate files with Get-ChildItem.'],
      [/-recurse\b/, 'Use recursive enumeration.'],
      [/(\*\.log|-filter\s+['"]?\*\.log)/, 'Limit the input to .log files.'],
      [/select-string|\bsls\b/, 'Search file contents with Select-String.'],
      [/access denied/, 'Search for the phrase ACCESS DENIED.'],
      [/sort-object|\bsort\b/, 'Sort the paths before writing them.'],
      [/(set-content|out-file).*evidence\.txt|evidence\.txt.*(set-content|out-file)/, 'Write the result to ..\\evidence.txt.'],
    ];
    const failed = checks.find(([pattern]) => !pattern.test(normalized));
    return failed ? { ok: false, message: failed[1] } : { ok: true };
  }

  function initTerminalLevel() {
    const select = document.getElementById('terminalMode');
    const input = document.getElementById('terminalInput');
    const prompt = document.getElementById('terminalPrompt');
    const runButton = document.getElementById('runButton');
    const resetButton = document.getElementById('resetCodeButton');

    function loadMode() {
      const config = terminalModes[select.value];
      input.value = config.starter;
      prompt.textContent = config.prompt;
      document.getElementById('judgeOutput').className = 'judge-panel';
    }

    select.addEventListener('change', loadMode);
    resetButton.addEventListener('click', loadMode);
    runButton.addEventListener('click', () => {
      setButtonBusy(runButton, true, 'Scanning logs...');
      window.setTimeout(() => {
        const result = validateTerminal(input.value, select.value);
        setButtonBusy(runButton, false);
        if (!result.ok) {
          renderJudge('error', 'Relay command rejected', result.message);
          return;
        }

        renderJudge(
          'success',
          'Evidence channel restored',
          `The ${terminalModes[select.value].label} pipeline satisfies every forensic step.`,
          ['recursive scan', 'case ignored', '*.log only', 'sorted evidence'],
        );
        revealNext(2);
      }, 580);
    });

    installRunShortcut(runButton, input);
    loadMode();
  }

  function runPacketTests(code) {
    return new Promise((resolve) => {
      const workerSource = `
        const send = self.postMessage.bind(self);
        const denyNetwork = () => { throw new Error('Network APIs are disabled in the local judge.'); };
        self.fetch = denyNetwork;
        self.XMLHttpRequest = undefined;
        self.WebSocket = undefined;
        self.importScripts = denyNetwork;

        function stable(value) {
          if (Array.isArray(value)) return value.map(stable);
          if (value && typeof value === 'object') {
            return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
          }
          return value;
        }

        self.onmessage = async (event) => {
          try {
            self.postMessage = denyNetwork;
            const build = new Function(
              '\"use strict\";\\n' + event.data.code +
              '\\n; return typeof assemblePackets === \"function\" ? assemblePackets : null;'
            );
            const assemblePackets = build();
            if (!assemblePackets) throw new Error('Define a function named assemblePackets.');

            const cases = [
              {
                name: 'mixed channels',
                input: [
                  { channel: 'beta', seq: 2, payload: '!', corrupt: false },
                  { channel: 'alpha', seq: 2, payload: 'lo', corrupt: false },
                  { channel: 'alpha', seq: 1, payload: 'Hel', corrupt: false },
                  { channel: 'beta', seq: 1, payload: 'Go', corrupt: false },
                  { channel: 'alpha', seq: 0, payload: 'X', corrupt: true }
                ],
                expected: { alpha: 'Hello', beta: 'Go!' }
              },
              {
                name: 'out-of-order packets',
                input: [
                  { channel: 'nav', seq: 30, payload: 'tion', corrupt: false },
                  { channel: 'nav', seq: 10, payload: 'Navi', corrupt: false },
                  { channel: 'nav', seq: 20, payload: 'ga', corrupt: false }
                ],
                expected: { nav: 'Navigation' }
              },
              {
                name: 'all corrupt',
                input: [{ channel: 'void', seq: 1, payload: 'noise', corrupt: true }],
                expected: {}
              },
              { name: 'empty transmission', input: [], expected: {} }
            ];

            const passed = [];
            for (const test of cases) {
              const original = JSON.stringify(test.input);
              let actual = assemblePackets(structuredClone(test.input));
              if (actual && typeof actual.then === 'function') actual = await actual;
              if (JSON.stringify(test.input) !== original) {
                throw new Error('Do not mutate the original packet array.');
              }
              if (JSON.stringify(stable(actual)) !== JSON.stringify(stable(test.expected))) {
                throw new Error('Failed hidden case: ' + test.name + '.');
              }
              passed.push(test.name);
            }
            send({ ok: true, passed });
          } catch (error) {
            send({ ok: false, message: error && error.message ? error.message : String(error) });
          }
        };
      `;

      const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
      const worker = new Worker(workerUrl);
      let settled = false;

      function finish(result) {
        if (settled) return;
        settled = true;
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        resolve(result);
      }

      const timeout = window.setTimeout(() => {
        finish({ ok: false, message: 'Execution exceeded 1200 ms. Check for an infinite loop.' });
      }, 1200);

      worker.onmessage = (event) => {
        window.clearTimeout(timeout);
        finish(event.data);
      };
      worker.onerror = (event) => {
        window.clearTimeout(timeout);
        finish({ ok: false, message: event.message || 'The JavaScript worker could not run this solution.' });
      };
      worker.postMessage({ code });
    });
  }

  function initPacketLevel() {
    const input = document.getElementById('codeInput');
    const runButton = document.getElementById('runButton');
    const resetButton = document.getElementById('resetCodeButton');

    input.value = packetStarter;
    resetButton.addEventListener('click', () => {
      input.value = packetStarter;
      document.getElementById('judgeOutput').className = 'judge-panel';
    });
    runButton.addEventListener('click', async () => {
      setButtonBusy(runButton, true, 'Running sandbox...');
      const result = await runPacketTests(input.value);
      setButtonBusy(runButton, false);
      if (!result.ok) {
        renderJudge('error', 'Packet assembly failed', result.message);
        return;
      }

      renderJudge(
        'success',
        'All packet tests passed',
        'The navigation message is coherent and the source packets remain untouched.',
        result.passed,
      );
      revealNext(3);
    });

    installRunShortcut(runButton, input);
  }

  function generateTenDigitCode() {
    const digits = [];
    const bytes = new Uint8Array(10);

    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }

    digits.push(String(1 + (bytes[0] % 9)));
    for (let i = 1; i < bytes.length; i += 1) digits.push(String(bytes[i] % 10));
    return digits.join('');
  }

  function launchConfetti() {
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    const colors = ['#57e6ff', '#b9ff66', '#9d7bff', '#ffaf66', '#ff6d8a'];

    for (let i = 0; i < 54; i += 1) {
      const piece = document.createElement('i');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
      piece.style.setProperty('--delay', `${Math.random() * 0.9}s`);
      piece.style.setProperty('--duration', `${3.8 + Math.random() * 2.5}s`);
      piece.style.setProperty('--color', colors[i % colors.length]);
      layer.append(piece);
    }

    document.body.append(layer);
    window.setTimeout(() => layer.remove(), 7500);
  }

  function showFinalSuccess(celebrate) {
    let code = readFinalCode();
    if (!/^\d{10}$/.test(code)) {
      code = generateTenDigitCode();
      writeFinalCode(code);
    }

    const card = document.getElementById('finalSuccess');
    const output = document.getElementById('finalCode');
    output.textContent = code;
    card.classList.add('is-visible');
    if (celebrate) launchConfetti();
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function initLogicLevel() {
    const input = document.getElementById('logicInput');
    const runButton = document.getElementById('runButton');
    const copyButton = document.getElementById('copyCodeButton');

    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^1-7]/g, '').slice(0, 5);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') runButton.click();
    });
    runButton.addEventListener('click', () => {
      const answer = input.value.trim();
      if (!/^([1-7])(?!.*\1)([1-7])(?!.*\2)([1-7])(?!.*\3)([1-7])(?!.*\4)([1-7])$/.test(answer)) {
        renderJudge('error', 'Lock pattern invalid', 'Enter five different digits using only 1 through 7.');
        return;
      }

      if (answer !== '52714') {
        renderJudge('error', 'The moon lock stays closed', 'At least one clue is contradicted. Recount exact positions before misplaced digits.');
        return;
      }

      writeProgress(4);
      syncProgress();
      renderJudge(
        'success',
        'Five-moon lock solved',
        'Every clue agrees. BYTE has recovered the final navigation fragment.',
        ['unique solution', '5 exact checks', 'no repeated digits'],
      );
      showFinalSuccess(true);
    });

    copyButton.addEventListener('click', async () => {
      const code = document.getElementById('finalCode').textContent;
      try {
        await navigator.clipboard.writeText(code);
        copyButton.textContent = 'Code copied';
      } catch {
        copyButton.textContent = 'Select code to copy';
      }
      window.setTimeout(() => { copyButton.textContent = 'Copy code'; }, 1800);
    });
  }

  function restoreSolvedState() {
    const progress = readProgress();
    if (progress < pageLevel) return;
    if (pageLevel < 4) revealNext(pageLevel);
    if (pageLevel === 4) showFinalSuccess(false);
  }

  document.querySelectorAll('[data-reset-mission]').forEach((button) => {
    button.addEventListener('click', resetMission);
  });

  syncProgress();
  if (!guardAccess()) return;

  if (pageLevel === 1) initDsaLevel();
  if (pageLevel === 2) initTerminalLevel();
  if (pageLevel === 3) initPacketLevel();
  if (pageLevel === 4) initLogicLevel();
  restoreSolvedState();
})();
