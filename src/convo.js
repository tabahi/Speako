


const DS = require('./design.js');
const SP = require('./speech.js');

var speaker_turn = false;
var voiced = false;
export var flag = 0;    //state change tracking flag

var default_model_url = null;
var local_model_id = null;

export function ConvoSetup(local_model='convo_model', model_url='./model.json')
{
    
    default_model_url = model_url;
    local_model_id = local_model;
    console.log("Using model: ", default_model_url, local_model_id);
    
    SP.SpeechSetup();
    
    flag_set(0);
    voice_enabled();
    document.getElementById("start_button").disabled = false;
    document.getElementById("msg").innerText = "Press Start to start the conversation";
}


function process_command(event_node_text)
{
    console.log(event_node_text);
    if(event_node_text.indexOf('URL')>=0)   //URL command
        window.location.replace(event_node_text.split('=')[1], '_blank');

}

export function start_btn_click()
{
    if(flag!=0)
        flag_set(0);
    else
        flag_set(2);
}


function flag_set(flag_val) //state change tracking function
{
    
    if(flag_val==0)  //stopped
    {
        speaker_turn = false;
        document.getElementById("start_button").value = "Start";
        document.getElementById("start_button").className = "w3-button w3-wide w3-green w3-padding w3-round";
        if(flag==1) document.getElementById("msg").innerText = "Bot stopped";   //otherwise it shows session over

        flag = flag_val;
        
        if(voiced) SP.Stop_Rec();
        else if (!voiced) document.getElementById("send_button").disabled = true;
        document.getElementById("voice_enable_check").disabled = false;
    }
    else if(flag_val==1)    //human speaking turn
    {
        speaker_turn = true;
        
        document.getElementById("start_button").value = "Stop";
        document.getElementById("start_button").className = "w3-button w3-wide w3-red w3-padding w3-round";
        
        
        if(voiced) SP.Start_Rec();
        else if (!voiced) document.getElementById("send_button").disabled = false;
        flag = flag_val;
        
    }
    else if(flag_val==2) //bot speaking turn
    {
        speaker_turn = false;
        
        if(voiced) SP.Stop_Rec();
        else if (!voiced) document.getElementById("send_button").disabled = true;
        if(flag==0) //first bot sentence
        {
            flag = flag_val;
            document.getElementById("start_button").value = "Stop";
            document.getElementById("start_button").className = "w3-button w3-wide w3-red w3-padding w3-round";
            
            
            if(voiced) SP.define_speech_recognition(human_speech_response, on_human_speech_response_end);
            load_convo_model();
        }
        else 
        
        flag = flag_val;
        
        document.getElementById("voice_enable_check").disabled = true;
        
    }
}

function on_human_speech_response_end()
{
    if(document.getElementById("speechbox").value.length<1)
    {
        document.getElementById("msg").innerText = "I didn't hear anything. Start again.";
        flag_set(0);
    }
    else document.getElementById("speechbox").value = "";
}

function human_speech_response(e)
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
            update_chatbox();
            flag_set(2);
            intelli_respond();
        }
        speechbox.value += res[0].transcript;
    }
}


export function human_text_response(send_text)
{
    if((speaker_turn) && (send_text.length>0))
    {
        convo_texts.push(send_text);
        convo_sources.push(2);
        flag_set(2);
        update_chatbox();
        document.getElementById("speechbox").value = "";
        intelli_respond();
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

        function after_speech_ends()
        {
            if(flag!=0)
            {
                document.getElementById("msg").innerText = "Listening...";
                flag_set(1);
            }
            update_chatbox();
        }
        SP.speak_this(string_to_speak, after_speech_ends);
    }
    else
    {
        if(flag!=0) flag_set(1);
        update_chatbox();
    }
}









var last_load_convo = 0;
function update_chatbox()
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





var convo_texts = [];
var convo_sources = [];


var convo_model = null;
var last_bot_node = 0;
var start_bot_node = 0;

function find_bot_reply_to_human(input_text)
{
    let best_match_index = 0;
    let best_match_key = 0;
    let possible_keys = get_next_node_key(last_bot_node, ["Human"]);

    if(possible_keys.length<=0) //dead end
    {
        return "This session is over. Please restart to start again.<br>[No possible human responses after the last sentence by bot.] [在机器人的最后一句话之后没有可能的人类反应。]";
    }

    for (let k=0; k<possible_keys.length; k++)  //find the best match for human words
    {
        let this_key_match = 0;
        let this_node_words = get_node_from_key(possible_keys[k]).possibilitiesList;
        
        for (let kw=0; kw<this_node_words.length; kw++)
        {
            if(this_node_words[kw].text=="*") this_key_match += 10;
            else if(input_text.indexOf(this_node_words[kw].text)>=0)
            {
                this_key_match += 1;
                if(this_node_words[kw].text.indexOf(' ') > 0)
                this_key_match += 5;
            }
            
        }
        if((this_key_match>0) && (this_key_match>=best_match_index))
        {
            best_match_index = this_key_match;
            best_match_key = possible_keys[k];
            //console.log(get_node_from_key(best_match_key).possibilitiesList, best_match_index);
        }
    }

    if(best_match_index>0)  //has matching node
    {
        let next_action_keys = get_next_node_key(best_match_key, ["DesiredEvent"]); 

        if(next_action_keys.length < 1)
        next_action_keys = get_next_node_key(best_match_key, ["Bot"]);

        if(next_action_keys.length < 1)
        next_action_keys = get_next_node_key(best_match_key, ["UndesiredEvent"]);

        if(next_action_keys.length < 1)
        return "I don't know what to say<br>[Missing bot node or wrong node connected next to human response.] [缺少机器人回复或连接到人类响应旁边的错误节点。]";

        let next_action_key = next_action_keys[0];

        if(next_action_keys.length > 1) //has multiple possible bot nodes, select randomly
        {
            let rand = Math.floor(Math.random() * (next_action_keys.length-0.01));
            next_action_key = next_action_keys[rand];
        }

        last_bot_node = next_action_key;
        let next_node = get_node_from_key(next_action_key);

        let ret_reply = "[Empty bot node] [空机器人响应]";
        if(next_node.text)
            ret_reply = next_node.text;
            
        if(next_node.category=="UndesiredEvent" || next_node.category=="DesiredEvent")
        {
            if(next_node.possibilitiesList)
            {
                for (let i=0; i<next_node.possibilitiesList.length;i++)
                    if(next_node.possibilitiesList.indexOf('='))
                        process_command(next_node.possibilitiesList[i].text);
            }
            document.getElementById("msg").innerText = "Session over";
            flag_set(0);
        }
        
        return ret_reply;
    }
    else    //fallback
    {
        let fallbacks = get_next_node_key(last_bot_node, ["Bot fallback"]);
        if(fallbacks.length > 0)
        {
            for (let k=0; k<fallbacks.length; k++)
            {
                if(get_next_node_key(fallbacks[k], ["Human"]).length > 0) 
                {
                    console.log("fallback has next");
                    last_bot_node = fallbacks[k];   //only move to this node if has nodes next to it.
                    return get_node_from_key(fallbacks[k]).text;
                }
            }
            return get_node_from_key(fallbacks[0]).text;
        }
        else return "I don't understand. [Bot fallback response is missing after this node.] [在此节点之后缺少机器人的回退响应。]";  //global fallback
    }
}

function get_next_node_key(from_key, categories=null)
{
    
    let possible_keys = [];
    if(convo_model)
    for (let n=0; n<convo_model.linkDataArray.length; n++)
    {
            if(convo_model.linkDataArray[n].from==from_key) 
            {
                if(categories)
                {
                    if(categories.indexOf(get_node_from_key(convo_model.linkDataArray[n].to).category) > -1)
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

function load_convo_model(recursive=false)
{
    
    console.log(default_model_url, local_model_id);
    let stored_model = window.localStorage.getItem(local_model_id);
    if((!stored_model) && (!recursive))
    {
        document.getElementById("msg").innerText = "Loading bot...";
        DS.model_load_from_url(default_model_url, local_model_id, true).then(function ()
        {
            convo_texts.push("Using default conversation model.");
            convo_sources.push(1);
            load_convo_model(true);
        }).catch((e) => {document.getElementById("msg").innerText = "Error: " + e;});
    }
    
    let lang_set = window.localStorage.getItem('convo_lang');
    if(!lang_set)
    {
        window.localStorage.setItem('convo_lang', 'en-US');
    }

    if(stored_model)
    {
        stored_model = JSON.parse(stored_model);
        //stored_model.linkDataArray
        //console.log(stored_model.nodeDataArray);
        let has_bot_start = false;
        for (let i=0; i<stored_model.nodeDataArray.length; i++)
        {
            if(stored_model.nodeDataArray[i].category == "Bot Start")
            {
                convo_model = stored_model;

                //convo_texts.push(convo_model.nodeDataArray[i].text);
                //convo_sources.push(1);
                start_bot_node = convo_model.nodeDataArray[i].key;
                last_bot_node = start_bot_node;
                //update_chatbox();
                bot_says(convo_model.nodeDataArray[i].text);
                document.getElementById("msg").innerText = "Bot started";
                has_bot_start = true;
                break;
            }
        }
        if(!has_bot_start)
        {
            bot_says("[Bot Start node not found] [找不到机器人启动消息]");
            flag_set(0);
        }
        
    }
}


export function voice_enabled(isChecked=document.getElementById("voice_enable_check").isChecked)
{
    if(isChecked)
    {
        
        const SpeechRecognition =  window.SpeechRecognition || window.webkitSpeechRecognition;
        if (typeof SpeechRecognition !== "undefined")
        {
            voiced = isChecked;
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
        voiced = isChecked;
        document.getElementById("speechbox").readOnly = false;
        document.getElementById("msg").innerText = "Voiced conversation disabled";
    }
}
