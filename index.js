var infinite = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

var myCanvas = document.getElementById("threeCanvas");
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvas,
});
renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);

const controls = new THREE.OrbitControls(camera, myCanvas);
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// add a 3d grid to the background

const group = drawCubeWalls();
scene.add(group);

var characters = {};
var mixers = [];
var clock = new THREE.Clock();

camera.position.z = 15;
const light = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add(light);

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

var instructions = [
  "character milady1",
  "sleep 2000",
  "go milady1 0,3",
  "sleep 2000",
  "say milady1 hello",
];

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
    // sleep the REPL for 1 second
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
      drawCharacter(name, scene);

      break;
    case "go":
      var name = parts[1];
      var character = characters[name].group;
      switchAnimation(name, 0);

      var args = parts[2].split(",");
      var x = parseInt(args[0]);
      var z = parseInt(args[1]);

      var duration = 2000;

      radians = Math.atan2(x - character.position.x, z - character.position.z);
      new TWEEN.Tween(character.rotation).to({ y: radians }, 600).start();

      new TWEEN.Tween(character.position)
        .to({ x: x, z: z }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .start();
      break;
    case "say":
      var name = parts[1];
      var character = characters[name].group;
      switchAnimation(name, 1);
      break;
    case "sleep":
      var duration = parseInt(parts[1]);
      setTimeout(function () {
        processInstruction();
      }, duration);
      return;
      break;
    default:
      processInstruction();
  }
  setTimeout(function () {
    processInstruction();
  }, 0);
}

setTimeout(function () {
  processInstruction();
}, 2000);

const loader = new THREE.FontLoader();
loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
  const color = 0x006699;

  const matDark = new THREE.LineBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });

  const matLite = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });

  const message = "Milady\nWorld Order";

  const shapes = font.generateShapes(message, 1);

  const geometry = new THREE.ShapeGeometry(shapes);

  geometry.computeBoundingBox();

  const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

  geometry.translate(xMid, 0, 0);

  // make shape ( N.B. edge view not visible )

  const text = new THREE.Mesh(geometry, matLite);
  text.position.z = -1;
  scene.add(text);

  // make line shape ( N.B. edge view remains visible )

  // const holeShapes = [];

  // for (let i = 0; i < shapes.length; i++) {
  //   const shape = shapes[i];

  //   if (shape.holes && shape.holes.length > 0) {
  //     for (let j = 0; j < shape.holes.length; j++) {
  //       const hole = shape.holes[j];
  //       holeShapes.push(hole);
  //     }
  //   }
  // }

  // shapes.push.apply(shapes, holeShapes);

  // const lineText = new THREE.Object3D();

  // for (let i = 0; i < shapes.length; i++) {
  //   const shape = shapes[i];

  //   const points = shape.getPoints();
  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);

  //   geometry.translate(xMid, 0, 0);

  //   const lineMesh = new THREE.Line(geometry, matDark);
  //   lineText.add(lineMesh);
  // }

  // scene.add(lineText);

  // render();
}); //end load function
