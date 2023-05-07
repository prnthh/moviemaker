// import helpers js
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
console.log(THREE);
const controls = new THREE.OrbitControls(camera, myCanvas);
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// add a 3d grid to the background

const group = drawCubeWalls();
scene.add(group);

var character;
drawCharacter(scene);

camera.position.z = 15;
const light = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  if (character !== undefined) {
    // character.rotation.x += 0.01;
    character.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
animate();