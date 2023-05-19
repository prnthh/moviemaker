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

function drawObject(name, scene) {
  var loader = new THREE.GLTFLoader();

  loader.load(
    "./pocketmilady/room2.glb",
    function (gltf) {
      model = gltf.scene;

      model.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      let fileAnimations = gltf.animations;

      model.scale.set(5, 5, 5);
      model.position.y = -6.2;
      model.receiveShadow = true;
      model.castShadow = true;
      scene.add(model);

      loaderAnim.remove();

      mixer = new THREE.AnimationMixer(model);

      let clips = fileAnimations.filter((val) => val.name !== "idle");
      possibleAnims = clips.map((val) => {
        let clip = THREE.AnimationClip.findByName(clips, val.name);

        clip.tracks.splice(3, 3);
        clip.tracks.splice(9, 3);

        clip = mixer.clipAction(clip);
        return clip;
      });

      let idleAnim = THREE.AnimationClip.findByName(fileAnimations, "idle");

      idleAnim.tracks.splice(3, 3);
      idleAnim.tracks.splice(9, 3);

      idle = mixer.clipAction(idleAnim);
      idle.play();

      objects[name] = {
        model: model,
        mixer: mixer,
        animations: animations,
        currentAnimation: null, // Add this line
      };
    },
    undefined, // We don't need this function
    function (error) {
      console.error(error);
    }
  );
}

const assetPath = "./assets/models/";
function drawCharacter(name, scene, modelToLoad = "Milady") {
  const group = new THREE.Group();

  const loader = new THREE.FBXLoader();
  loader.setPath(assetPath);
  loader.load(modelToLoad + "/model.fbx", (fbx) => {
    fbx.scale.setScalar(0.05);
    fbx.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.material) c.material.shininess = 0;
    });

    const animLoader = new THREE.FBXLoader();
    const animsToLoad = ["Walk", "Talk", "SillyDancing", "Dancing2"]; // Add animation filenames here

    const mixer = new THREE.AnimationMixer(fbx);
    const animations = {};

    animsToLoad.forEach((animFile) => {
      animLoader.setPath(assetPath + modelToLoad + "/anims/");
      try {
        animLoader.load(animFile + ".fbx", (anim) => {
          const action = mixer.clipAction(anim.animations[0]);
          animations[animFile] = action;
        });
      } catch (e) {
        console.log(e);
      }
    });

    fbx.position.y = -6;
    group.add(fbx);
    scene.add(group);
    // characters[name] = group;
    characters[name] = {
      group: group,
      mixer: mixer,
      animations: animations,
      currentAnimation: null, // Add this line
    };
  });
}

function drawText(
  message = "Milady\nWorld Order",
  position,
  maxDuration = 2000
) {
  const loader = new THREE.FontLoader();
  loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
    const color = 0xebff38;

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

    const shapes = font.generateShapes(message, 1);

    const geometry = new THREE.ShapeGeometry(shapes);

    geometry.computeBoundingBox();

    const xMid =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )

    const text = new THREE.Mesh(geometry, matLite);
    text.position.z = position.z;
    text.position.x = position.x;
    text.position.y = 2.2;
    scene.add(text);

    // destroy in two seconds
    setTimeout(() => {
      scene.remove(text);
    }, maxDuration);

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
}

function switchAnimation(characterName, animName, fadeDuration = 0.5) {
  const character = characters[characterName];
  if (!character) {
    console.error(`Character ${characterName} not found.`);
    return;
  }

  const animation = character.animations[animName];
  if (!animation) {
    console.error(`Animation name ${animName} not found for ${characterName}.`);
    return;
  }

  // If the target animation isn't already playing, crossfade to it
  if (character.currentAnimation !== animation) {
    if (character.currentAnimation) {
      const prevAnim = character.currentAnimation;
      animation.play();
      character.currentAnimation.crossFadeTo(animation, fadeDuration, false);
      setTimeout(() => {
        prevAnim.stop();
      }, fadeDuration * 1000);
    } else {
      animation.play();
    }

    characters[characterName].currentAnimation = animation;
  }
}

function drawLight(position, rotation, intensity, scene) {
  const light = new THREE.DirectionalLight("lightyellow", intensity);
  light.castShadow = true;
  light.position.copy(position);
  light.rotation.copy(rotation);
  scene.add(light);

  // add a box at light2
  const geometry = new THREE.BoxGeometry(1, 2, 3);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  cube.rotation.copy(rotation);
  scene.add(cube);
}

function printToLogs(text) {
  const logs = document.getElementById("log");
  logs.innerHTML += `<div> #! ${text}</div>`;
  logs.scrollTop = logs.scrollHeight;
}
function processTextbox(e) {
  if (e.key == "Enter") {
    addToQueue();
  }
}

function generateInstructions() {
  const string =
    "go milady1 1,4 2000; sleep 2000; go milady1 1,0; sleep 2000; go milady1 -3,5 1800; sleep 2000; say milady1 800 Ole!; do milady1 Dancing2; sleep 100";
  instructions = [...string.split(";")];
  instructions = instructions.map((instruction) => {
    return instruction.trim();
  });

  return instructions;
}

const words = ["feds are coming bro", "omg hiii", "i love you", "i hate you"];
