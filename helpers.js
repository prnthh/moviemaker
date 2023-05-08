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

  const loader = new THREE.FBXLoader();
  loader.setPath("./assets/");
  loader.load("MiladySkinned.fbx", (fbx) => {
    fbx.scale.setScalar(0.05);
    fbx.traverse((c) => {
      c.castShadow = true;
    });

    const anim = new THREE.FBXLoader();
    anim.setPath("./assets/anim/");
    anim.load("Walk.fbx", (anim) => {
      const m = new THREE.AnimationMixer(fbx);
      mixers.push(m);
      const idle = m.clipAction(anim.animations[0]);
      idle.play();
    });

    fbx.position.y = -6;
    group.add(fbx);
    scene.add(group);
    characters[name] = group;
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
