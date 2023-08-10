import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
  drawCharacter,
  drawLight,
  drawRoom,
  drawText,
  generateInstructions,
  goToBed,
  moveJoint,
  printRandomChat,
  printToChat,
  printToLogs,
  printToSubtitles,
  rotateToFace,
  sayHello,
  switchAnimation,
} from "../helpers.js";

import {
  SampleMeanYoutubeComments,
  initialInstructions,
  sampleUsernames,
} from "../constants.js";

let camera, scene, renderer, composer, clock, controls;
let gui, params;

var characters = {};
var objects = {};
var mixers = [];
var instructions = [];

var aspectRatio;

export default class SceneManager {
  constructor() {
    THREE.ColorManagement.enabled = true;
    THREE.ColorManagement.legacyMode = false;

    this.init();
    animate();
    this.initInstructions();
  }

  init() {
    THREE.ColorManagement.enabled = false;

    const loadingManager = new THREE.LoadingManager(() => {
      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.classList.add("fade-out");

      // optional: remove loader from DOM via event listener
      loadingScreen.addEventListener("transitionend", onTransitionEnd);
    });

    this.initialiseCamera();
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x000000);

    clock = new THREE.Clock();

    // composer = new EffectComposer(renderer);
    // const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
    // composer.addPass(renderPixelatedPass);

    window.addEventListener("resize", this.onWindowResize);
    setTimeout(this.onWindowResize, 1);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.target = new THREE.Vector3(0, -1, 0);
    controls.update();
    // controls.enableZoom = false;

    this.addLighting();
    drawRoom("room", scene);
    // gui

    gui = new GUI();
    params = {
      pixelSize: 2,
      openai_api_key: "",
      tiktok_mode: false,
      // normalEdgeStrength: 0.3,
      // depthEdgeStrength: 0.4,
      // pixelAlignedPanning: true,
    };
    // renderPixelatedPass.setPixelSize(params.pixelSize);

    gui
      .add(params, "pixelSize")
      .min(1)
      .max(16)
      .step(1)
      .onChange(() => {
        renderPixelatedPass.setPixelSize(params.pixelSize);
      });

    gui.add(params, "openai_api_key").onChange(() => {
      window.openai_api_key = params.openai_api_key;
    });

    gui.add(params, "tiktok_mode").onChange(() => {
      window.tiktok_mode = params.tiktok_mode;
      printRandomChat();
    });
  }

  initialiseCamera() {
    var myCanvas = document.getElementById("threeCanvas");
    var sceneWidth = window.innerWidth / 1; // window.innerWidth / 2;
    var sceneHeight = window.innerHeight; // Math.max(sceneWidth / 1, window.innerHeight);
    aspectRatio = sceneWidth / sceneHeight;
    camera = new THREE.OrthographicCamera(
      -aspectRatio,
      aspectRatio,
      1,
      -1,
      -10,
      100
    );
    // camera.position.y = -0.2;
    camera.position.z = 8;
    camera.position.y = 1;
    // camera.rotation.x = Math.PI * 1;
    camera.rotation.y = Math.PI * 0.5;
    camera.zoom = 0.2;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: myCanvas,
    });
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaFactor = 2.2;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0);
  }

  onWindowResize() {
    var sceneWidth = window.innerWidth / 1; // window.innerWidth / 2;
    var sceneHeight = window.innerHeight; // Math.max(sceneWidth / 1, window.innerHeight);
    aspectRatio = sceneWidth / sceneHeight;

    camera.left = -aspectRatio;
    camera.right = aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(sceneWidth, sceneHeight);
    // composer.setSize(sceneWidth, sceneHeight);
  }

  initInstructions() {
    instructions = initialInstructions;
    setTimeout(function () {
      processInstruction();
    }, 1000);
  }

  addLighting() {
    const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
    scene.add(light);
    drawLight(
      new THREE.Vector3(0, 6, 12),
      new THREE.Euler(Math.PI, -Math.PI / 2, Math.PI / 6),
      0.1,
      scene
    );
  }

  addInstructionToQueue(instruction) {}

  // additional methods can be added as needed
}

function animate() {
  // Reset the Camera Frustum if it has been modified
  camera.left = -aspectRatio;
  camera.right = aspectRatio;
  camera.top = 1.0;
  camera.bottom = -1.0;

  // if (character != undefined) {
  //   controls.target = character.group.position;
  //   controls.update();
  // }

  camera.updateProjectionMatrix();

  const delta = clock.getDelta();

  TWEEN.update();
  if (characters !== undefined) {
    Object.values(characters).map((character) => character.mixer.update(delta));
  }

  // composer.render();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function processInstruction() {
  if (instructions.length === 0) {
    if (window.tiktok_mode) {
      instructions = [...generateInstructions(characters)];
    } else {
      instructions = ["do milady1 Idle", "sleep 2000"];
    }
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
      printToSubtitles(parts.slice(3).join(" "), actionDuration);
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

document.addEventListener("mousemove", function (e) {
  var mousecoords = getMousePos(e);

  var character = Object.values(characters)[0];

  if (character && character["neck"] && character["waist"]) {
    moveJoint(mousecoords, character["neck"], 30);
    moveJoint(mousecoords, character["waist"], 20);
  }
});
function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}
