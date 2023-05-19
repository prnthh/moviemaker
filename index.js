var sceneWidth = window.innerWidth;
var sceneHeight = sceneWidth / 1.15; // window.innerHeight;

var infinite = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sceneWidth / sceneHeight,
  0.25,
  100
);
camera.position.set(0, 0, 19);

var myCanvas = document.getElementById("threeCanvas");
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvas,
});
renderer.setSize(sceneWidth, sceneHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setClearColor(0xffffff, 0);

const controls = new THREE.OrbitControls(camera, myCanvas);

// add a 3d grid to the background
// const group = drawCubeWalls();
// scene.add(group);

var characters = {};
var objects = {};
var mixers = [];
var clock = new THREE.Clock();

// camera.rotation.x = -0.5;

addLighting();

function animate() {
  requestAnimationFrame(animate);

  // const delta = THREE.clock.getDelta();
  const delta = clock.getDelta();

  TWEEN.update();
  if (characters !== undefined) {
    Object.values(characters).map((character) => character.mixer.update(delta));
  }
  renderer.render(scene, camera);
}
animate();

drawObject("room", scene);

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
    instructions = [...generateInstructions()];
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
      drawCharacter(name, scene, model);

      break;
    case "go":
      var name = parts[1];
      var character = characters[name].group;
      switchAnimation(name, "Walk");

      var args = parts[2].split(",");
      var x = parseInt(args[0]);
      var z = parseInt(args[1]);

      var duration = parts[3] || 2000;

      radians = Math.atan2(x - character.position.x, z - character.position.z);
      new TWEEN.Tween(character.rotation).to({ y: radians }, 600).start();

      new TWEEN.Tween(character.position)
        .to({ x: x, z: z }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .start();
      break;
    case "say":
      var name = parts[1];
      var duration = parts[2];
      var character = characters[name].group;
      switchAnimation(name, "Talk");
      drawText(parts.slice(3).join(" "), character.position, duration);
      break;
    case "sleep":
      var duration = parseInt(parts[1]);
      setTimeout(function () {
        processInstruction();
      }, duration);
      return;
      break;
    case "do":
      var name = parts[1];
      var animation = parts[2];
      switchAnimation(name, animation);
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

var instructions = [
  "character milady1 Milady",
  "sleep 500",
  "go milady1 0,15 2200",
  "sleep 2200",
  "say milady1 800 hi there",
  "sleep 800",
  "say milady1 2000 my name is milady",
  // "sleep 800",
];

function addLighting() {
  const light = new THREE.AmbientLight(0x404040, 2); // soft white light
  scene.add(light);

  drawLight(
    new THREE.Vector3(10, 5, 15),
    new THREE.Euler(-Math.PI / 10, Math.PI / 6, 0),
    0.3,
    scene
  );
}
