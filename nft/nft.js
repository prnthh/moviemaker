const cameraHeight = 2;
const cameraDistance = 3;
const offsetRange = 7;
const targetHeight = 1.5;

var mixer;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

var clock = new THREE.Clock();

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

const loader = new THREE.GLTFLoader();
loader.load(
  "./nftmodel.gltf",
  // "https://prnth.com/moviemaker/nft/nftmodel.gltf",

  (gltf) => {
    model = gltf.scene;
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    scene.add(model);

    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

camera.position.z = cameraDistance;
camera.position.y = cameraHeight;

const light = new THREE.AmbientLight(0x404040, 1); // soft white light
scene.add(light);

// const spotLight = new THREE.SpotLight(0xcf5eff);
// spotLight.intensity = 0.5;
// spotLight.position.set(0, 5, 4);
// // spotLight.angle = Math.PI / 6;

// // spotLight.map = new THREE.TextureLoader().load(url);
// spotLight.castShadow = true;
// scene.add(spotLight);

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

  var delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

animate();
