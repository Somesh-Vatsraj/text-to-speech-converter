// ---------- DOM Elements ----------
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const pitchRange = document.getElementById('pitchRange');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const statusBox = document.getElementById('statusBox');

// ---------- Speech Synthesis API ----------
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let voices = [];

// ---------- Populate Voices ----------
function loadVoices() {
    voices = speechSynth.getVoices();
    if (!voices.length) {
        // Some browsers need a little delay
        setTimeout(loadVoices, 200);
        return;
    }
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) option.selected = true;
        voiceSelect.appendChild(option);
    });
}

// Load voices when they change (or on first load)
if (speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = loadVoices;
} else {
    loadVoices();
}
// Additional fallback
setTimeout(loadVoices, 500);

// ---------- Update range displays ----------
rateRange.addEventListener('input', () => {
    rateValue.textContent = parseFloat(rateRange.value).toFixed(1) + '×';
});
pitchRange.addEventListener('input', () => {
    pitchValue.textContent = parseFloat(pitchRange.value).toFixed(1);
});

// ---------- Speak Function ----------
function speakText() {
    const text = textInput.value.trim();
    if (!text) {
        statusMessage.textContent = '⚠️ Please enter some text to speak.';
        statusMessage.className = 'status';
        return;
    }

    // If already speaking, cancel it
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Set voice
    const selectedIndex = parseInt(voiceSelect.value);
    if (!isNaN(selectedIndex) && voices[selectedIndex]) {
        utterance.voice = voices[selectedIndex];
    }

    utterance.rate = parseFloat(rateRange.value);
    utterance.pitch = parseFloat(pitchRange.value);

    // Events
    utterance.onstart = () => {
        statusMessage.textContent = '🔊 Speaking...';
        statusMessage.className = 'status speaking';
        statusBox.innerHTML = '<i class="fas fa-circle" style="color:#facc15; font-size:0.6rem;"></i> Speaking';
        speakBtn.disabled = true;
    };

    utterance.onend = () => {
        statusMessage.textContent = '✅ Finished speaking.';
        statusMessage.className = 'status';
        statusBox.innerHTML = '<i class="fas fa-circle" style="color:#4ade80; font-size:0.6rem;"></i> Ready';
        speakBtn.disabled = false;
        currentUtterance = null;
    };

    utterance.onerror = (event) => {
        if (event.error !== 'canceled') {
            statusMessage.textContent = '❌ Error: ' + event.error;
            statusMessage.className = 'status';
            statusBox.innerHTML = '<i class="fas fa-circle" style="color:#ef4444; font-size:0.6rem;"></i> Error';
            speakBtn.disabled = false;
        } else {
            // canceled – treat as stop
            statusMessage.textContent = '⏹️ Stopped.';
            statusMessage.className = 'status';
            statusBox.innerHTML = '<i class="fas fa-circle" style="color:#a0aec0; font-size:0.6rem;"></i> Stopped';
            speakBtn.disabled = false;
        }
        currentUtterance = null;
    };

    // Speak!
    speechSynth.speak(utterance);
}

// ---------- Stop Function ----------
function stopSpeaking() {
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
    if (currentUtterance) {
        currentUtterance = null;
    }
    statusMessage.textContent = '⏹️ Stopped.';
    statusMessage.className = 'status';
    statusBox.innerHTML = '<i class="fas fa-circle" style="color:#a0aec0; font-size:0.6rem;"></i> Stopped';
    speakBtn.disabled = false;
}

// ---------- Clear Text ----------
function clearText() {
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
    textInput.value = '';
    statusMessage.textContent = '🗑️ Text cleared.';
    statusMessage.className = 'status';
    statusBox.innerHTML = '<i class="fas fa-circle" style="color:#4ade80; font-size:0.6rem;"></i> Ready';
    speakBtn.disabled = false;
    currentUtterance = null;
}

// ---------- Event Listeners ----------
speakBtn.addEventListener('click', speakText);
stopBtn.addEventListener('click', stopSpeaking);
clearBtn.addEventListener('click', clearText);

// Optional: Ctrl+Enter to speak
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        speakText();
    }
});

// Cancel speech on page unload
window.addEventListener('beforeunload', () => {
    if (speechSynth.speaking) speechSynth.cancel();
});

console.log('🚀 Text-to-Speech Converter ready!');