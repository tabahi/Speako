var SpeechRecognitionx = (window.hasOwnProperty('webkitSpeechRecognition')) ? webkitSpeechRecognition: SpeechRecognition;
var SpeechGrammarListx =  (window.hasOwnProperty('webkitSpeechGrammarList')) ? webkitSpeechGrammarList: window.SpeechGrammarList;
var SpeechRecognitionEvent = (window.hasOwnProperty('webkitSpeechRecognitionEvent')) ?webkitSpeechRecognitionEvent:SpeechRecognitionEvent;

var recognition = null;


export function SpeechSetup()
{
    setup_voice_selector();
}

export function Start_Rec()
{
    if(recognition) recognition.start();
}

export function Stop_Rec()
{
    if(recognition) recognition.stop();
}

export function define_speech_recognition(speech_recognition_callback, on_response_end, rec_start=false)
{
    const lang_set = window.localStorage.getItem('convo_lang') || 'en-US';
    
    if (typeof SpeechRecognitionx !== "undefined")
    {
        recognition = null;
        recognition = new SpeechRecognitionx();
        const onResult = event => {  speech_recognition_callback(event); };
        
        recognition.lang = lang_set;
        var grammar = '#JSGF V1.0; grammar songs; public <song> = 紫| 竹 | 调 | 月亮 | 我的心 | 雷曼 | 情感 | 计算 ;';
        var speechRecognitionList = new SpeechGrammarListx();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.maxAlternatives = 1;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.addEventListener("result", onResult);
        recognition.onend = function() {on_response_end(); }
        if(rec_start) recognition.start();
    }
    else alert("SpeechRecognition not supported.");
}


let voices;
let currentVoice;
var synth = window.speechSynthesis;

export function speak_this(string_to_speak, callback_after_speech)
{
    if(currentVoice)
    {
        var utterThis = new SpeechSynthesisUtterance(string_to_speak);
        const lang_set = window.localStorage.getItem('convo_lang') || 'en-US';
        utterThis.lang = lang_set;

        
        utterThis.voice = currentVoice;
        utterThis.addEventListener('end', function(event) { callback_after_speech(); });
        synth.speak(utterThis);
    }
    else 
    {
        if(voices.length<1) alert("No voice available for speech synthesis.");
        callback_after_speech();
    }
}

function setup_voice_selector()
{
    const voiceSelect = document.getElementById('voices');
    const lang_set = window.localStorage.getItem('convo_lang') || 'en-US';
    console.log('setup_voice_selector');
    const populateVoices = () => {
        if(voiceSelect && (currentVoice==undefined || currentVoice==null))
        {
            console.log('populateVoices');
            const availableVoices = speechSynthesis.getVoices();
            
            
            voiceSelect.innerHTML = '';
            let selected_done = false;
    
            availableVoices.forEach(voice => {
            const option = document.createElement('option');
            
            let optionText = `${voice.name} (${voice.lang})`;
    
            if (voice.default) {
                optionText += ' [default]';
            }
            
            if((currentVoice === voice) || ((!selected_done) && (voice.lang==lang_set)))
            {
                currentVoice = voice;
                option.selected = true;
                selected_done = true;
            }
            option.textContent = optionText;
            voiceSelect.appendChild(option);
            });
            voices = availableVoices;
        }
    };

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
    
    if(voiceSelect)
    {
        voiceSelect.addEventListener('change', event => {
            const selectedIndex = event.target.selectedIndex;
            currentVoice = voices[selectedIndex];
        });
    }
}



