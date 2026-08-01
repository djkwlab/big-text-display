const message = document.querySelector('#message');
const presetMessages = document.querySelector('#presetMessages');
const presetMessageButtons = [...presetMessages.querySelectorAll('button')];
const display = document.querySelector('#display');
const displayText = document.querySelector('#displayText');
const showButton = document.querySelector('#showButton');
const shareButton = document.querySelector('#shareButton');
const shareStatus = document.querySelector('#shareStatus');
const invert = document.querySelector('#invert');
const installButton = document.querySelector('#installButton');
const customColourControls = document.querySelector('#customColourControls');
const colourPreview = document.querySelector('#colourPreview');
const customSwatch = document.querySelector('#customSwatch');
const rgbInputs = ['red', 'green', 'blue'].map(id => document.querySelector(`#${id}`));
const editor = document.querySelector('.editor');
const sharedPreview = document.querySelector('#sharedPreview');
const sharedMessageText = document.querySelector('#sharedMessageText');
const displaySharedButton = document.querySelector('#displaySharedButton');
let installPrompt;

const colours = { white: '#ffffff', green: '#9dff00', yellow: '#ffe600', red: '#ff3131' };
const state = JSON.parse(localStorage.getItem('big-text-state') || '{}');
const sharedMessage = new URLSearchParams(window.location.search).get('message');
message.value = sharedMessage ?? (state.message || '');
invert.checked = Boolean(state.invert);
(document.querySelector(`[name="colour"][value="${state.colour || 'white'}"]`) || document.querySelector('[value="white"]')).checked = true;
const savedRgb = Array.isArray(state.customRgb) && state.customRgb.length === 3 ? state.customRgb : [255, 255, 255];
rgbInputs.forEach((input, index) => { input.value = savedRgb[index]; });

function currentColour() { return document.querySelector('[name="colour"]:checked').value; }
function updatePresetMessages() {
  presetMessageButtons.forEach(button => {
    const selected = button.dataset.message === message.value;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
}
function customColour() { return `rgb(${rgbInputs.map(input => input.value).join(', ')})`; }
function updateCustomColourControls() {
  const color = customColour();
  customColourControls.hidden = currentColour() !== 'custom';
  colourPreview.style.backgroundColor = color;
  customSwatch.style.backgroundColor = color;
  rgbInputs.forEach(input => { document.querySelector(`#${input.id}Value`).value = input.value; });
}
function save() { localStorage.setItem('big-text-state', JSON.stringify({ message: message.value, colour: currentColour(), customRgb: rgbInputs.map(input => Number(input.value)), invert: invert.checked })); }
function updateDisplay() {
  updateCustomColourControls();
  const color = currentColour() === 'custom' ? customColour() : colours[currentColour()];
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

message.addEventListener('input', () => {
  updatePresetMessages();
  updateDisplay();
});
presetMessages.addEventListener('click', event => {
  const button = event.target.closest('button[data-message]');
  if (!button) return;
  message.value = button.dataset.message;
  updatePresetMessages();
  updateDisplay();
  message.focus();
});
document.querySelectorAll('[name="colour"], #invert').forEach(input => input.addEventListener('change', updateDisplay));
rgbInputs.forEach(input => input.addEventListener('input', () => {
  document.querySelector('[value="custom"]').checked = true;
  updateDisplay();
}));
showButton.addEventListener('click', openDisplay);
shareButton.addEventListener('click', async () => {
  if (!message.value.trim()) {
    message.focus();
    shareStatus.textContent = 'Enter a message to share.';
    return;
  }

  const shareUrl = new URL(window.location.href);
  shareUrl.search = '';
  shareUrl.searchParams.set('message', message.value);
  const shareData = { title: 'Big Text message', text: message.value, url: shareUrl.toString() };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      shareStatus.textContent = 'Message shared.';
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl.toString());
      shareStatus.textContent = 'Share link copied.';
    } else {
      shareStatus.textContent = 'Sharing is not supported in this browser.';
    }
  } catch (error) {
    if (error.name !== 'AbortError') shareStatus.textContent = 'Unable to share the message.';
  }
});
displaySharedButton.addEventListener('click', openDisplay);
display.addEventListener('click', closeDisplay);
window.addEventListener('resize', fitText);
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) display.classList.remove('active'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDisplay(); });

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installButton.hidden = false; });
installButton.addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.hidden = true; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
updatePresetMessages();
updateDisplay();
if (sharedMessage) {
  editor.hidden = true;
  sharedPreview.hidden = false;
  sharedMessageText.textContent = sharedMessage;
}
