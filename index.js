import {
  drawCharacter,
  drawLight,
  drawObject,
  drawText,
  generateInstructions,
  printToLogs,
  switchAnimation,
} from "./helpers.js";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let camera, scene, renderer, composer, crystalMesh, clock;
let gui, params;

var characters = {};
var objects = {};
var mixers = [];
var instructions = [];
init();
animate();
initInstructions();
processInstruction();
var aspectRatio = window.innerWidth / window.innerHeight;

function init() {
  var sceneWidth = window.innerWidth;
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
  camera.position.y = 2 * Math.tan(Math.PI / 6);
  camera.position.z = 2;
  camera.position.x = -2;
  camera.zoom = 0.1;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f1f1);

  clock = new THREE.Clock();

  var myCanvas = document.getElementById("threeCanvas");
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: myCanvas,
  });
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0);
  document.body.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
  composer.addPass(renderPixelatedPass);

  window.addEventListener("resize", onWindowResize);
  setTimeout(onWindowResize, 1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxZoom = 2;

  addLighting();
  drawObject("room", scene);
  // gui

  gui = new GUI();
  // params = {
  //   pixelSize: 6,
  //   normalEdgeStrength: 0.3,
  //   depthEdgeStrength: 0.4,
  //   pixelAlignedPanning: true,
  // };
  // gui
  //   .add(params, "pixelSize")
  //   .min(1)
  //   .max(16)
  //   .step(1)
  //   .onChange(() => {
  //     renderPixelatedPass.setPixelSize(params.pixelSize);
  //   });
  // gui.add(renderPixelatedPass, "normalEdgeStrength").min(0).max(2).step(0.05);
  // gui.add(renderPixelatedPass, "depthEdgeStrength").min(0).max(1).step(0.05);
  const instructionControls = {
    "Say Hello": () => {
      instructions = [
        "say milady1 2000 stop asking me to say hello",
        "sleep 2000",
      ];
      // instructions.push("say hello");
    },
  };
  gui.add(instructionControls, "Say Hello");
}

function onWindowResize() {
  var sceneWidth = window.innerWidth;
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
    instructions = [...generateInstructions(instructions)];
    setTimeout(function () {
      processInstruction();
    }, 1000);
    return;
  }
  var instruction = instructions.shift();
  printToLogs(instruction);

  var parts = instruction.split(" ");
  var command = parts[0];

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
      var x = parseInt(args[0]);
      var z = parseInt(args[1]);

      var duration = parts[3] || 2000;

      var radians = Math.atan2(
        x - character.group.position.x,
        z - character.group.position.z
      );
      new TWEEN.Tween(character.group.rotation).to({ y: radians }, 600).start();

      new TWEEN.Tween(character.group.position)
        .to({ x: x, z: z }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .start();
      break;
    case "say":
      var name = parts[1];
      var duration = parts[2];
      var character = characters[name];
      if (character === undefined) break;
      switchAnimation(character, "Talk");
      drawText(
        scene,
        parts.slice(3).join(" "),
        character.group.position,
        duration
      );
      break;
    case "sleep":
      var duration = parseInt(parts[1]);
      setTimeout(function () {
        processInstruction();
      }, duration);
      return;
    case "do":
      var name = parts[1];
      var animation = parts[2];
      var character = characters[name];
      if (character === undefined) break;
      switchAnimation(character, animation);
      break;
    default:
      break;
  }
  setTimeout(function () {
    processInstruction();
  }, 0);
}

setTimeout(function () {
  processInstruction();
}, 2000);

function initInstructions() {
  instructions = [
    "character milady1 MiladyShort",
    "sleep 500",
    "go milady1 0,5 1000",
    "sleep 1000",
    "go milady1 0,8 800",
    "sleep 800",
    "say milady1 800 hi there",
    "sleep 1200",
    "say milady1 2000 brg forever <3",
    "do milady1 Yes",
    "sleep 2000",
    // "sleep 800",
  ];
}

function addLighting() {
  const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
  scene.add(light);

  drawLight(
    new THREE.Vector3(7, 2, 9),
    new THREE.Euler(-Math.PI / 10, Math.PI / 2, 0),
    0.5,
    scene
  );
}
