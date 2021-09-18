window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.interimResults = true;

let p = document.createElement("p");
p.classList.add("para");
let words = document.querySelector(".words");
words.appendChild(p)



let mic = document.querySelector("#circlein")

let speechToText = "";
recognition.addEventListener("result", e => {
  let interimTranscript = '';
  for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
    let transcript = e.results[i][0].transcript;
    console.log(transcript)

    if (e.results[i].isFinal) {
      speechToText += transcript;
    } else {
      interimTranscript += transcript;
    }
  }


  recognition.addEventListener('soundend', () => {
    mic.style.backgroundColor = null;
  });




  document.querySelector(".para").innerHTML = speechToText + interimTranscript
})




mic.addEventListener("click", () => {
  recognition.start();
  mic.style.backgroundColor = "#6BD6E1"
})
