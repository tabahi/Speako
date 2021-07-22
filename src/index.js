

const SR = require('./SpeechRec.js');
const DS = require('./design.js');

function setup()
{
    console.log(window.location.pathname);
    const this_path = window.location.pathname;
    if(this_path=="/design.htm" || this_path=="/design")
        DS.DesignerSetup();
    else
        SR.SpeechRecSetup();
    console.log("Start");
}




export function start_btn_click()
{
    SR.start_btn_click();
}


export function DS_btn(btn_name)
{
    DS.DS_btn(btn_name);
}







window.onload = setup;