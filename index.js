import {
  drawCharacter,
  drawLight,
  drawRoom,
  drawText,
  generateInstructions,
  goToBed,
  printToLogs,
  rotateToFace,
  sayHello,
  switchAnimation,
} from "./helpers.js";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initialInstructions } from "./constants.js";

let camera, scene, renderer, composer, crystalMesh, clock;
let gui, params;

var characters = {};
var objects = {};
var mixers = [];
var instructions = [];
init();
animate();
initInstructions();
var aspectRatio;

function init() {
  THREE.ColorManagement.enabled = false;

  var myCanvas = document.getElementById("threeCanvas");
  var sceneWidth = myCanvas.offsetWidth; // window.innerWidth;
  var sceneHeight = Math.min(sceneWidth / 1.15, window.innerHeight);
  aspectRatio = sceneWidth / sceneHeight;
  camera = new THREE.OrthographicCamera(
    -aspectRatio,
    aspectRatio,
    1,
    -1,
    -10,
    100
  );
  camera.position.y = 1 * Math.tan(Math.PI / 6);
  camera.position.z = 1;
  camera.zoom = 0.1;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: myCanvas,
  });
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0);

  composer = new EffectComposer(renderer);
  const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
  composer.addPass(renderPixelatedPass);

  window.addEventListener("resize", onWindowResize);
  setTimeout(onWindowResize, 1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxZoom = 2;

  addLighting();
  drawRoom("room", scene);
  // gui

  gui = new GUI();
  params = {
    pixelSize: 4,
    // normalEdgeStrength: 0.3,
    // depthEdgeStrength: 0.4,
    // pixelAlignedPanning: true,
  };
  renderPixelatedPass.setPixelSize(params.pixelSize);

  gui
    .add(params, "pixelSize")
    .min(1)
    .max(16)
    .step(1)
    .onChange(() => {
      renderPixelatedPass.setPixelSize(params.pixelSize);
    });
}

function onWindowResize() {
  var myCanvas = document.getElementById("threeCanvas");
  var sceneWidth = myCanvas.offsetWidth;
  var sceneHeight = Math.min(sceneWidth / 1.15, window.innerHeight);
  aspectRatio = sceneWidth / sceneHeight;

  camera.left = -aspectRatio;
  camera.right = aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(sceneWidth, sceneHeight);
  composer.setSize(sceneWidth, sceneHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Reset the Camera Frustum if it has been modified
  camera.left = -aspectRatio;
  camera.right = aspectRatio;
  camera.top = 1.0;
  camera.bottom = -1.0;
  camera.updateProjectionMatrix();

  const delta = clock.getDelta();

  TWEEN.update();
  if (characters !== undefined) {
    Object.values(characters).map((character) => character.mixer.update(delta));
  }

  composer.render();
}

function addToQueue() {
  var instruction = document.getElementById("instruction").value;
  // split by ;
  var parts = instruction.split(";");
  parts.forEach((part) => {
    instructions.push(part.trim());
  });
  document.getElementById("instruction").value = "";
}

function processInstruction() {
  if (instructions.length === 0) {
    instructions = [...generateInstructions(characters)];
    setTimeout(function () {
      processInstruction();
    }, 1000);
    return;
  }
  var instruction = instructions.shift();
  printToLogs(instruction);

  var parts = instruction.split(" ");
  var command = parts[0];
  var duration = 0;

  switch (command) {
    case "character":
      var name = parts[1];
      var model = parts[2];
      drawCharacter(characters, name, scene, model);
      break;
    case "go":
      var name = parts[1];
      var character = characters[name];
      if (character === undefined) break;
      switchAnimation(character, "Walk");

      var args = parts[2].split(",");
      var x = parseFloat(args[0]);
      var z = parseFloat(args[1]);

      var actionDuration = parts[3] || 2000;

      rotateToFace(character.group, x, z, actionDuration);
      new TWEEN.Tween(character.group.position)
        .to({ x: x, z: z }, actionDuration)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      break;
    case "say":
      var name = parts[1];
      var actionDuration = parts[2];
      var character = characters[name];
      if (character === undefined) break;
      drawText(
        scene,
        parts.slice(3).join(" "),
        character.group.position,
        actionDuration
      );
      break;
    case "move":
      var name = parts[1];
      var character = characters[name];
      if (character === undefined) break;
      var args = parts[2].split(",");
      var x = parseFloat(args[0]);
      var z = parseFloat(args[1]);

      var actionDuration = parts[3] || 2000;

      new TWEEN.Tween(character.group.position)
        .to({ x: x, z: z }, actionDuration)
        .easing(TWEEN.Easing.Linear.None)
        .start();
      break;
    case "lookat":
      var name = parts[1];
      var character = characters[name];
      if (character === undefined) break;

      var args = parts[2].split(",");
      var x = parseFloat(args[0]);
      var z = parseFloat(args[1]);

      var actionDuration = parts[3] || 2000;
      rotateToFace(character.group, x, z, actionDuration);
      break;
    case "do":
      var name = parts[1];
      var animation = parts[2];
      var once = parts[3];
      var character = characters[name];
      if (character === undefined) break;
      switchAnimation(character, animation, undefined, once === "once");
      break;
    case "sleep":
      duration = parseInt(parts[1]);
      console.log("sleeping for ", duration);
      break;
    default:
      break;
  }
  setTimeout(function () {
    processInstruction();
  }, duration);
}

setTimeout(function () {
  processInstruction();
}, 2000);

function initInstructions() {
  instructions = initialInstructions;
}

function addLighting() {
  const light = new THREE.AmbientLight(0xffffff, 0.8); // soft white light
  scene.add(light);

  drawLight(
    new THREE.Vector3(7, 2, 9),
    new THREE.Euler(-Math.PI / 10, Math.PI / 2, 0),
    0.1,
    scene
  );
}

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
