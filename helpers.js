function drawCubeWalls() {
  const width = 12;

  const group = new THREE.Group();
  group.position.z = -5;

  const helper = new THREE.GridHelper(width, 16);
  helper.rotation.x = Math.PI / 2;
  group.add(helper);

  const helper2 = new THREE.GridHelper(width, 16);
  helper2.rotation.z = Math.PI / 2;
  helper2.position.x = -width / 2;
  helper2.position.z = width / 2;
  group.add(helper2);

  const helper3 = new THREE.GridHelper(12, 16);
  helper3.rotation.z = Math.PI / 2;
  helper3.position.x = width / 2;
  helper3.position.z = width / 2;
  group.add(helper3);

  const helper4 = new THREE.GridHelper(12, 16);
  helper4.position.y = width / 2;
  helper4.position.z = width / 2;
  group.add(helper4);

  const helper5 = new THREE.GridHelper(12, 16);
  helper5.position.y = -width / 2;
  helper5.position.z = width / 2;
  group.add(helper5);

  return group;
}

function drawCharacter(name = "Milady", scene) {
  const group = new THREE.Group();

  const loader = new THREE.GLTFLoader().setPath("assets/");
  loader.load("Milady.gltf", function (gltf) {
    model = gltf.scene;

    let textureLoader = new THREE.TextureLoader();
    model.traverse(function (object) {
      if (object.isMesh) {
        // object.material.map = texture;
        object.castShadow = true;
      }
    });
    model.position.y = -1;
    group.add(model);

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = true;
    group.add(skeleton);

    scene.add(group);

    group.scale.set(5, 5, 5);
    characters[name] = group;
    // const animations = gltf.animations;

    // mixer = new THREE.AnimationMixer(model);
  });
}

function generateInstruction() {
  var randomChoice = Math.floor(Math.random() * 2);
  switch (randomChoice) {
    case 0:
      var x = Math.random() * 8 - 4;
      var z = Math.random() * 8 - 4;
      instructions.push("go " + x + "," + z);
      break;
    case 1:
      instructions.push("say hello");
      break;
  }
}
