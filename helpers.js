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

  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z = -5;
  plane.scale.setScalar(5);
  return plane;
}

function drawCharacter(name, scene) {
  const group = new THREE.Group();

  const loader = new THREE.FBXLoader();
  loader.setPath("./assets/");
  loader.load("MiladySkinned.fbx", (fbx) => {
    fbx.scale.setScalar(0.05);
    fbx.traverse((c) => {
      c.castShadow = true;
    });

    const animLoader = new THREE.FBXLoader();
    const animsToLoad = ["Walk.fbx", "Talk.fbx"]; // Add animation filenames here

    const mixer = new THREE.AnimationMixer(fbx);
    const animations = [];

    animsToLoad.forEach((animFile) => {
      animLoader.setPath("./assets/anim/");
      animLoader.load(animFile, (anim) => {
        const action = mixer.clipAction(anim.animations[0]);
        animations.push(action);
      });
    });

    fbx.position.y = -6;
    group.add(fbx);
    scene.add(group);
    // characters[name] = group;
    characters[name] = {
      group: group,
      mixer: mixer,
      animations: animations,
    };
  });
}

function switchAnimation(characterName, animIndex) {
  const character = characters[characterName];
  if (!character) {
    console.error(`Character ${characterName} not found.`);
    return;
  }

  character.animations.forEach((anim) => {
    anim.stop();
  });

  const animation = character.animations[animIndex];
  if (!animation) {
    console.error(`Animation index ${animIndex} not found.`);
    return;
  }

  animation.play();
}

function generateInstruction() {
  // var randomChoice = Math.floor(Math.random() * 2);
  // switch (randomChoice) {
  //   case 0:
  //     var x = Math.random() * 8 - 4;
  //     var z = Math.random() * 8 - 4;
  //     instructions.push("go " + x + "," + z);
  //     break;
  //   case 1:
  //     instructions.push(
  //       "say " + words[Math.floor(Math.random() * words.length)]
  //     );
  //     break;
  // }
}

const words = ["feds are coming bro", "omg hiii", "i love you", "i hate you"];
