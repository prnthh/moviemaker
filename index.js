import {
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

var instructions = [];
var Scene = new SceneManager();

document
  .getElementById("console-button-rest")
  .addEventListener("click", function (e) {
    instructions = goToBed(characters);
  });

document
  .getElementById("console-button-chill")
  .addEventListener("click", function (e) {
    window.alert("coming soon!");
  });
document
  .getElementById("console-button-post")
  .addEventListener("click", function (e) {
    window.alert("coming soon!");
  });
