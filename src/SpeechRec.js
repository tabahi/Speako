
const SpeechRecognition =  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarListx =  window.SpeechGrammarList || window.webkitSpeechGrammarList;

var recognition = null;
var lang_set = "en";   //zh-CN


const DS = require('./design.js');

var speaker_turn = false;
var voiced = false;
export var flag = 0;


export function SpeechRecSetup()
{
    flag_set(0);
    voice_select_change();
    setup_voice_selector();
    //window.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById("start_button").disabled = false;
    document.getElementById("msg").innerText = "Press Start to start the conversation";
}

function speech_recognition_onresult(e)
{
    const speechbox = document.getElementById("speechbox");
    speechbox.value = "";
    for (const res of e.results)
    {
        if (res.isFinal)
        {
            //speechbox.value += "\n";
            
            convo_texts.push(res[0].transcript);
            convo_sources.push(2);
            load_frame();
            flag_set(2);
            intelli_respond();
        }
        speechbox.value += res[0].transcript;
    }
}

function define_speech_recognition()
{
    if (typeof SpeechRecognition !== "undefined")
    {
        recognition = null;
        recognition = new SpeechRecognition();
        const onResult = event => {  speech_recognition_onresult(event); };
        lang_set = document.getElementById("lang_set").value;
        recognition.lang = lang_set;
        var grammar = '#JSGF V1.0; grammar songs; public <song> = 紫| 竹 | 调 | 月亮 | 我的心 | 雷曼 | 情感 | 计算 ;';
        var speechRecognitionList = new SpeechGrammarListx();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.maxAlternatives = 1;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.addEventListener("result", onResult);
        recognition.onend = function() {
                if(document.getElementById("speechbox").value.length<1)
                {
                    document.getElementById("msg").innerText = "I didn't hear anything. Start again.";
                    flag_set(0);
                }
                else document.getElementById("speechbox").value = "";
            }
    }
}

export function voice_select_change(isChecked=document.getElementById("voice_enable_check").isChecked)
{
    voiced = isChecked;
    if(voiced)
    {
        if (typeof SpeechRecognition !== "undefined")
        {
            document.getElementById("speechbox").readOnly = true;
            document.getElementById("msg").innerText = "Voiced conversation enabled";
        }
        else
        {
            document.getElementById("voice_enable_check").checked = false;
            voiced = false;
            document.getElementById("msg").innerText = "Your browser doesn't support Speech Recognition.";
        }
    }
    else
    {
        document.getElementById("speechbox").readOnly = false;
        document.getElementById("msg").innerText = "Voiced conversation disabled";
    }
}



function intelli_respond()
{
    if(convo_sources.length>0)
    for(let i=convo_sources.length-1; i>=0; i--)
    {
        if(convo_sources[i]==2) //latest reply from human
        {
            const reply = find_bot_reply_to_human(convo_texts[i].toLowerCase());
            bot_says(reply);
            break;
        }
    }
}


function bot_says(string_to_speak)
{
    convo_texts.push(string_to_speak);
    convo_sources.push(1);

    if(voiced)
    {
        if(flag!=0) document.getElementById("msg").innerText = "Speaking...";
        var utterThis = new SpeechSynthesisUtterance(string_to_speak);
        utterThis.lang = lang_set;

        var synth = window.speechSynthesis;
        utterThis.voice = currentVoice;
        utterThis.addEventListener('end', function(event) {
            //console.log('Utterance time ' + event.elapsedTime + ' ms.');
            if(flag!=0)
            {
                document.getElementById("msg").innerText = "Listening...";
                flag_set(1);
            }
            load_frame();
        });
        synth.speak(utterThis);
    }
    else
    {
        if(flag!=0) flag_set(1);
        load_frame();
    }
}



export function start_btn_click()
{
    if(flag!=0)
        flag_set(0);
    else
        flag_set(2);
}


function flag_set(flag_val)
{
    
    if(flag_val==0)  //stopped
    {
        speaker_turn = false;
        document.getElementById("start_button").value = "Start";
        document.getElementById("start_button").className = "w3-button w3-wide w3-green w3-padding w3-round";
        
        if(flag==1) document.getElementById("msg").innerText = "Bot stopped";   //otherwise it shows session over
        flag = flag_val;
        if((voiced) && (recognition)) recognition.stop();
        else if (!voiced) document.getElementById("send_button").disabled = true;
        document.getElementById("voice_enable_check").disabled = false;
        recognition = null;
    }
    else if(flag_val==1)    //human speaking
    {
        speaker_turn = true;
        
        document.getElementById("start_button").value = "Stop";
        document.getElementById("start_button").className = "w3-button w3-wide w3-red w3-padding w3-round";
        
        
        if((voiced) && (recognition)) recognition.start();
        else if (!voiced) document.getElementById("send_button").disabled = false;
        flag = flag_val;
        
    }
    else if(flag_val==2) //bot speaking
    {
        speaker_turn = false;
        
        if((voiced) && (recognition)) recognition.stop();
        else if (!voiced) document.getElementById("send_button").disabled = true;
        if(flag==0) //first bot sentence
        {
            flag = flag_val;
            document.getElementById("start_button").value = "Stop";
            document.getElementById("start_button").className = "w3-button w3-wide w3-red w3-padding w3-round";
            if(voiced) define_speech_recognition();
            load_convo_model();
        }
        else 
        
        flag = flag_val;
        
        document.getElementById("voice_enable_check").disabled = true;
        
    }
}


export function human_text_response(send_text)
{
    if((speaker_turn) && (send_text.length>0))
    {
        convo_texts.push(send_text);
        convo_sources.push(2);
        flag_set(2);
        load_frame();
        document.getElementById("speechbox").value = "";
        intelli_respond();
    }
}




var last_load_convo = 0;
function load_frame()
{
    const chatdiv = document.getElementById("chatdiv");
    
    for (let i=last_load_convo; i<convo_sources.length; i++)
    {
        let new_div = document.createElement('div');
        if(convo_sources[i]==1) //bot
        {
            new_div.className  = "MsgContainer";
            new_div.innerHTML = `<div class="msg-left"><p>${convo_texts[i]}</p></div></div>`;
        }
        else if(convo_sources[i]==2)    //user
        {
            new_div.className  = "MsgContainer darker";
            new_div.innerHTML = `<div class="msg-right"><p>${convo_texts[i]}</p></div></div>`;
        }
        chatdiv.appendChild(new_div);
    }
    last_load_convo = convo_sources.length;
    
    window.setTimeout( function(){chatdiv.scrollTo( 0, 999999 );}, 100 );
    
}








let voices;
let currentVoice;

function setup_voice_selector()
{
    const voiceSelect = document.getElementById('voices');
    
    lang_set = document.getElementById("lang_set").value;
    const populateVoices = () => {
        if(voiceSelect)
        {
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


var convo_texts = [];
var convo_sources = [];


const localstorekey = "model";
var convo_model = null;
var last_bot_node = 0;
var start_bot_node = 0;

function find_bot_reply_to_human(input_text)
{
    let best_match_index = 0;
    let best_match_key = 0;
    let possible_keys = get_next_node_key(last_bot_node, "Human");

    if(possible_keys.length<=0) //dead end
    {
        return "This session is over. Please restart to start again.";
    }

    for (let k=0; k<possible_keys.length; k++)  //find the best match for human words
    {
        let this_key_match = 0;
        let key_words = get_node_from_key(possible_keys[k]).text.toLowerCase().split(',');

        for (let kw=0; kw<key_words.length; kw++)
        {
            if(key_words[kw]=="*") this_key_match += 10;
            else if(input_text.indexOf(key_words[kw])>=0) this_key_match += 1;

        }
        if((this_key_match>0) && (this_key_match>=best_match_index))
        {
            best_match_index = this_key_match;
            best_match_key = possible_keys[k];
        }
    }

    if(best_match_index>0)  //has matching node
    {
        let next_action_key = get_next_node_key(best_match_key)[0]; //ignoring multiple options for now
        last_bot_node = next_action_key;
        let next_node = get_node_from_key(next_action_key);
        let ret_reply = "I don't know what to say.";
        if(next_node.reasonsList)
        {
            ret_reply = "";
            for (let i=0;i<next_node.reasonsList.length;i++)
            {
                ret_reply += next_node.reasonsList[i].text;
            }
        }
        else if(next_node.text)
        {
            ret_reply = next_node.text;
        }
        if(next_node.category=="UndesiredEvent" || next_node.category=="DesiredEvent")
        {
            document.getElementById("msg").innerText = "Session over";
            flag_set(0);
        }
        
        return ret_reply;
    }
    else    //fallback
    {
        let fallbacks = get_next_node_key(last_bot_node, "Bot fallback");
        if(fallbacks.length > 0)
        {
            console.log("has fallback");
            for (let k=0; k<fallbacks.length; k++)
            {
                if(get_next_node_key(fallbacks[k], "Human").length > 0) 
                {
                    console.log("fallback has next");
                    last_bot_node = fallbacks[k];   //only move to this node if has nodes next to it.
                    return get_node_from_key(fallbacks[k]).text;
                }
            }
            return get_node_from_key(fallbacks[0]).text;
        }
        else return "I don't understand.";  //global fallback
    }
}

function get_next_node_key(from_key, category=null)
{
    
    let possible_keys = [];
    if(convo_model)
    for (let n=0; n<convo_model.linkDataArray.length; n++)
    {
            if(convo_model.linkDataArray[n].from==from_key) 
            {
                if(category)
                {
                    if(get_node_from_key(convo_model.linkDataArray[n].to).category==category)
                    possible_keys.push(convo_model.linkDataArray[n].to);
                }
                else
                    possible_keys.push(convo_model.linkDataArray[n].to);
            }
    }
    return possible_keys;
}

function get_node_from_key(key)
{
    if(convo_model)
    for (let n=0; n<convo_model.nodeDataArray.length; n++)
    {
        if(convo_model.nodeDataArray[n].key==key)
        {
            return convo_model.nodeDataArray[n];
        }
    }
    return {category:"Error",text:"XYZ"};
}

function load_convo_model()
{
    let stored_model = window.localStorage.getItem(localstorekey);
    if(!stored_model)
    {
        
        document.getElementById("msg").innerText = "Loading bot...";
        DS.model_load_from_url(null, true).then(function ()
        {
            convo_texts.push("Using default conversation model.");
            convo_sources.push(1);
            load_convo_model();
        });
    }

    if(stored_model)
    {
        stored_model = JSON.parse(stored_model);
        //stored_model.linkDataArray
        //console.log(stored_model.nodeDataArray);
        for (let i=0; i<stored_model.nodeDataArray.length; i++)
        {
            if(stored_model.nodeDataArray[i].category == "Bot Start")
            {
                convo_model = stored_model;

                //convo_texts.push(convo_model.nodeDataArray[i].text);
                //convo_sources.push(1);
                start_bot_node = convo_model.nodeDataArray[i].key;
                last_bot_node = start_bot_node;
                //load_frame();
                bot_says(convo_model.nodeDataArray[i].text);
                document.getElementById("msg").innerText = "Bot started";
                break;
            }
        }
    }
}


