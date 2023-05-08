var infinite = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

var myCanvas = document.getElementById("threeCanvas");
var log = document.getElementById("log");
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvas,
});
renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);
console.log(THREE);
const controls = new THREE.OrbitControls(camera, myCanvas);
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// add a 3d grid to the background

const group = drawCubeWalls();
scene.add(group);

var characters = {};
drawCharacter(scene);

camera.position.z = 15;
const light = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  if (characters !== undefined) {
    // character.rotation.x += 0.01;
    // character.rotation.y += 0.01;
    // character.translateZ(0.1);
  }
  TWEEN.update();

  renderer.render(scene, camera);
}
animate();

var instructions = [];

function generateInstruction() {
  var x = Math.random() * 8 - 4;
  var z = Math.random() * 8 - 4;
  instructions.push("go " + x + "," + z);
}

function processInstruction() {
  if (instructions.length === 0) {
    if (infinite) generateInstruction();
    else return;
  }
  var instruction = instructions.shift();
  console.log("doing instruction ", instruction);
  log.innerHTML += instruction + "\n";
  var parts = instruction.split(" ");
  var command = parts[0];

  switch (command) {
    case "go":
      var character = characters["milady"];
      var args = parts[1].split(",");
      var x = parseInt(args[0]);
      var z = parseInt(args[1]);

      var duration = 2000;

      radians = Math.atan2(x - character.position.x, z - character.position.z);
      new TWEEN.Tween(character.rotation).to({ y: radians }, 600).start();

      new TWEEN.Tween(character.position)
        .to({ x: x, z: z }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      setTimeout(function () {
        processInstruction();
      }, duration);
      break;
  }
}

setTimeout(function () {
  processInstruction();
}, 2000);
