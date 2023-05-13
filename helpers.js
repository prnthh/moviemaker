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

const assetPath = "./assets/models/";
function drawCharacter(name, scene, modelToLoad = "Milady") {
  const group = new THREE.Group();

  const loader = new THREE.FBXLoader();
  loader.setPath(assetPath);
  loader.load(modelToLoad + "/model.fbx", (fbx) => {
    fbx.scale.setScalar(0.05);
    fbx.traverse((c) => {
      c.castShadow = true;
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

function drawText(message = "Milady\nWorld Order", position) {
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
    text.position.y = 3;
    scene.add(text);

    // destroy in two seconds
    setTimeout(() => {
      scene.remove(text);
    }, 2000);

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
