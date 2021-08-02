

const CO = require('./convo.js');
const DS = require('./design.js');


const default_model_url = "./model.json";
const local_model_id = 'convo_model';

function setup()
{
    console.log(window.location.pathname);
    const this_path = window.location.pathname;
    if(this_path.indexOf("/design")>=0) 
        DS.DesignerSetup(local_model_id, default_model_url);
    else
    {
        CO.ConvoSetup(local_model_id, default_model_url);
    }
    console.log("Start");
}




export function start_btn_click()
{
    CO.start_btn_click();
}

export function send_btn_click()
{
    CO.human_text_response(document.getElementById("speechbox").value);
}

export function chat_key_press(event)
{
    if (event.keyCode == 13)    //pressed enter
    {
        CO.human_text_response(document.getElementById("speechbox").value);
    }
}

export function voice_enabled(isChecked)
{
    CO.voice_enabled(isChecked);
}

export function DS_btn(btn_name)
{
    DS.DS_btn(btn_name);
}

export function DS_lang_change(lang_val)
{
    DS.DS_lang_change(lang_val);
}




window.onload = setup;