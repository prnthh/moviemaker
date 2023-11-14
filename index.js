import {
  generateSpeechInstructions,
  goToBed,
  printToChat,
  printToLogs,
  printToSubtitles,
} from "./helpers.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
  SampleMeanYoutubeComments,
  initialInstructions,
  sampleUsernames,
} from "./constants.js";

import SceneManager from "./3d/index.js";
import ChatGPT from "./3d/chat.js";

var Scene = new SceneManager();
const chatGPT = new ChatGPT("https://api.perplexity.ai/chat/completions");

var modes = [ "chatMode", "radioMode", "galleryMode",];

function setupGUI() {
  modes.forEach(mode => {
    document
    .getElementById("console-" + mode)
    .addEventListener("click", function (e) {
      showMode(mode);
    });
  }
  );
  // document
  // .getElementById("console-radioMode")
  // .addEventListener("click", function (e) {
  //   var characters = Scene.getCharacters();
  //   Scene.setInstructions(goToBed(characters));
  // });
  
  // document
  // .getElementById("console-galleryMode")
  // .addEventListener("click", function (e) {
  //   showMode("galleryMode");
  //   var xPos = Math.random() * 4 - 2;
  //   var yPos = Math.random() * 4 - 2;
  //   Scene.setInstructions([`move milady1 ${xPos},${yPos} 500`, "sleep 500"]);
  // });
  
  showMode();
}

function showMode(screen = "chatMode") {
  modes.forEach(element => {
    document.getElementById(element).style.display = "none";
  });
  
  document.getElementById(screen).style.display = "flex";
}

function processChat(message) {
  if (message.length == 0) return;
  printToChat("You", message);
  chatGPT
  .callChatGPT(message)
  .then((response) => {
    var instructions = generateSpeechInstructions(response);
    
    Scene.setInstructions(instructions);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
}

document.getElementById("chat-submit").addEventListener("click", function (e) {
  var input = document.getElementById("chat-input").value;
  document.getElementById("chat-input").value = "";
  processChat(input);
});

document.getElementById("chat-input").addEventListener("keydown", function chatInput(e) {
  if (e.keyCode == 13) {
    var input = document.getElementById("chat-input").value;
    document.getElementById("chat-input").value = "";
    processChat(input);
  }
}
);


setupGUI();
