const cameraHeight = 2;
const cameraDistance = 3;
const offsetRange = 7;
const targetHeight = 1.5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

let mouseX = 0,
  mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

var myCanvas = document.getElementById("threeCanvas");
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvas,
});
renderer.setSize(window.innerWidth - 4, window.innerHeight - 4);

const loader = new THREE.FBXLoader();
loader.load(
  "./nftmodel.fbx",
  (fbx) => {
    fbx.scale.setScalar(0.01);
    scene.add(fbx);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

camera.position.z = cameraDistance;
camera.position.y = cameraHeight;

const light = new THREE.AmbientLight(0x404040, 4); // soft white light
scene.add(light);

document.addEventListener("mousemove", onDocumentMouseMove, false);
window.addEventListener("resize", onWindowResize, false);

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / (100 * offsetRange);
  mouseY = (event.clientY - windowHalfY) / (100 * offsetRange);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  camera.position.x -= (mouseX + camera.position.x) * 0.1;
  camera.position.y -= (-mouseY + camera.position.y - cameraHeight) * 0.1;

  var target = new THREE.Vector3(0, targetHeight, 0);
  camera.lookAt(target);

  renderer.render(scene, camera);
}
animate();
