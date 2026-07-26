const message = document.querySelector('#message');
const display = document.querySelector('#display');
const displayText = document.querySelector('#displayText');
const showButton = document.querySelector('#showButton');
const invert = document.querySelector('#invert');
const installButton = document.querySelector('#installButton');
let installPrompt;

const colours = { white: '#ffffff', green: '#9dff00', yellow: '#ffe600', red: '#ff3131' };
const state = JSON.parse(localStorage.getItem('big-text-state') || '{}');
message.value = state.message || '';
invert.checked = Boolean(state.invert);
(document.querySelector(`[name="colour"][value="${state.colour || 'white'}"]`) || document.querySelector('[value="white"]')).checked = true;

function currentColour() { return document.querySelector('[name="colour"]:checked').value; }
function save() { localStorage.setItem('big-text-state', JSON.stringify({ message: message.value, colour: currentColour(), invert: invert.checked })); }
function updateDisplay() {
  const color = colours[currentColour()];
  displayText.textContent = message.value || 'Type a message to begin';
  display.style.color = invert.checked ? '#000000' : color;
  display.style.backgroundColor = invert.checked ? color : '#000000';
  save();
  fitText();
}

function fits() { return displayText.scrollWidth <= display.clientWidth && displayText.scrollHeight <= display.clientHeight; }
function fitText() {
  if (!display.classList.contains('active')) return;
  let low = 2, high = Math.max(display.clientWidth, display.clientHeight), best = 2;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    displayText.style.fontSize = `${mid}px`;
    if (fits()) { best = mid; low = mid + 1; } else high = mid - 1;
  }
  displayText.style.fontSize = `${best}px`;
}

function openDisplay() {
  updateDisplay();
  display.classList.add('active');
  document.documentElement.requestFullscreen?.().catch(() => {});
  screen.orientation?.lock?.('landscape').catch(() => {});
  requestAnimationFrame(fitText);
  display.focus();
}
function closeDisplay() {
  display.classList.remove('active');
  if (document.fullscreenElement) document.exitFullscreen?.();
  screen.orientation?.unlock?.();
}

message.addEventListener('input', updateDisplay);
document.querySelectorAll('[name="colour"], #invert').forEach(input => input.addEventListener('change', updateDisplay));
showButton.addEventListener('click', openDisplay);
display.addEventListener('click', closeDisplay);
window.addEventListener('resize', fitText);
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) display.classList.remove('active'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDisplay(); });

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installButton.hidden = false; });
installButton.addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.hidden = true; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
updateDisplay();
