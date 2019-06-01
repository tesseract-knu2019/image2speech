import Tesseract from 'tesseract.js';

const { TesseractWorker } = Tesseract;
const worker = new TesseractWorker({
  // langPath: document.URL + 'tessdata/'
});

// Speech

var synth = window.speechSynthesis;

var inputTxt = document.querySelector('.txt');
var voiceSelect = document.querySelector('.voice-select');

var playButton = document.querySelector('#play');
var stopButton = document.querySelector('#stop');

var autoplay = document.querySelector('#autoplay');
var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var voices = [];

function populateVoiceList() {
  voices = synth.getVoices();

  var ENGKORVoices = voices.filter((v) => v.lang == "en-US" || v.lang == "ko-KR")
  var nonENGKORVoices = voices.filter((v) => !(v.lang == "en-US" || v.lang == "ko-KR"))

  ENGKORVoices.sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });

  nonENGKORVoices.sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });

  voices = [...ENGKORVoices, ...nonENGKORVoices];

  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  // voiceSelect.innerHTML = '';
  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(){
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (inputTxt.value !== '') {
    var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(var i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
      }
    }
    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
  }
}

playButton.onclick = function(event) {
  event.preventDefault();
  speak();
  inputTxt.blur();
}

stopButton.onclick = function(event) {
  event.preventDefault();
  synth.cancel();
}

pitch.onchange = function() {
  pitchValue.textContent = pitch.value;
}

rate.onchange = function() {
  rateValue.textContent = rate.value;
}

// Image

document.onImageSelected = function(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.querySelector(".input-image");
  var progressText = document.querySelector(".progress-text");
  var language = document.querySelector(".language-select").value;

  reader.onload = function(event) {
    imgtag.src = event.target.result;
    worker
      .recognize(event.target.result, language)
      .progress(message => {
        progressText.innerHTML = message.status + " ( " + message.progress.toFixed(2) +  "% )"
      })
      .then((result) => {
        progressText.innerHTML = "Done!"
        console.log(result)
        inputTxt.value = result.text;
        if(autoplay.checked) speak();
      })
  };

  reader.readAsDataURL(selectedFile);
}
