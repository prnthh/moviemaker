import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import {
  SampleMeanYoutubeComments,
  animsToLoad,
  sampleUsernames,
  words,
  charactersToLoad,
} from "./constants.js";

export function drawRoom(
  name,
  scene,
  wallColor = "0xfff59e",
  floor = "0x662c07"
) {
  var loader = new GLTFLoader();

  loader.load(
    "./pocketmilady/room3.glb",
    function (gltf) {
      var model = gltf.scene;

      model.traverse(function (node) {
        // reduce the brightness of the lights
        if (node.isPlane) {
          node.receiveShadow = true;
          node.castShadow = true;
          node.material.color.setHex(floor);
        }

        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;

          console.log(node.name);

          var primaryColor = wallColor;
          if (node.name == "Node-Mesh_2")
            node.material.color.setHex(primaryColor);
          var secondaryColor = (primaryColor & 0xfefefe) >> 1;

          if (node.name == "Node-Mesh_1")
            node.material.color.setHex(secondaryColor);

          if (node.name == "Plane")
            assignImageTextureToNode(
              node,
              "https://pbs.twimg.com/media/F1pXvFsWIAE6yc9?format=png&name=900x900"
            );

          if (node.name == "Plane001")
            assignImageTextureToNode(
              node,
              "https://pbs.twimg.com/media/Fwma3LvXoAE1IKo?format=png&name=small"
            );

          if (node.name == "Node-Mesh_6") node.material.color.setHex(floor);
        }
      });

      let fileAnimations = gltf.animations;

      model.scale.set(5, 5, 5);
      model.position.y = -6.2;
      model.receiveShadow = true;
      model.castShadow = true;
      model.rotation.y = Math.PI / 2;
      scene.add(model);

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

function assignImageTextureToNode(node, image) {
  // node.material.color.setHex(secondaryColor);
  const texture = new THREE.TextureLoader().load(image);
  texture.rotation = Math.PI;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const material = new THREE.MeshBasicMaterial({ map: texture });

  node.material = material;
}

const assetPath = "./assets/models/";
export function drawCharacter(characters, name, scene, modelToLoad = "Milady") {
  let neck, waist;
  const group = new THREE.Group();

  const loader = new FBXLoader();
  loader.setPath(assetPath);
  loader.load(modelToLoad + "/model.fbx", (fbx) => {
    fbx.scale.setScalar(0.01);
    fbx.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.material) {
        c.material.shininess = 0.1;
      }
      console.log(c.name);

      if (c.isMesh) {
        // Assuming the texture is a map, you might also have to replace other types of maps
        // (e.g., bumpMap, normalMap, specularMap) depending on your specific needs
        if (c.material.map) {
          // Step 3: Load the New Texture
          const textureLoader = new THREE.TextureLoader();
          const newTexture = textureLoader.load("assets/images/skin1.png");

          // Step 4: Replace the Texture
          c.material.map = newTexture;
          c.material.needsUpdate = true; // Notify Three.js that material properties have changed
        }
      }

      // Reference the neck and waist bones
      if (c.isBone && c.name === "mixamorigNeck") {
        neck = c;
      }
      if (c.isBone && c.name === "mixamorigSpine") {
        waist = c;
      }
    });

    const animLoader = new FBXLoader();
    const mixer = new THREE.AnimationMixer(fbx);
    const animations = {};

    charactersToLoad[modelToLoad]?.anims.forEach((animFile) => {
      console.log("playing anim ", animFile);
      animLoader.setPath(assetPath + modelToLoad + "/anims/");
      try {
        animLoader.load(animFile + ".fbx", (anim) => {
          var thisAnim = anim.animations[0];
          thisAnim.tracks.splice(3, 3);
          thisAnim.tracks.splice(9, 3);
          const action = mixer.clipAction(thisAnim);
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
      neck: neck,
      waist: waist,
      group: group,
      mixer: mixer,
      animations: animations,
      currentAnimation: null, // Add this line
    };
  });
}

export function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);

  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y) + 50;
}

export function drawText(
  scene,
  message = "Milady\nWorld Order",
  position,
  maxDuration = 2000
) {
  const loader = new FontLoader();
  loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
    const color = 0xf4ff1c;

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

    const shapes = font.generateShapes(message, 1.2);

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
    text.scale.set(0.25, 0.25, 0.25);
    scene.add(text);

    // destroy in two seconds
    setTimeout(() => {
      scene.remove(text);
    }, maxDuration);
  }); //end load function
}

export function switchAnimation(
  character,
  animName,
  fadeDuration = 0.5,
  once = false,
  reverse = false
) {
  const animation = character.animations[animName];
  if (!animation) {
    console.error(`Animation name ${animName} not found for ${character}.`);
    return;
  }

  // If the target animation isn't already playing, crossfade to it
  if (character.currentAnimation !== animation) {
    if (character.currentAnimation) {
      const prevAnim = character.currentAnimation;
      animation.play();
      if (once) {
        animation.clampWhenFinished = true;
        animation.setLoop(THREE.LoopOnce);
      }
      if (reverse) {
        animation.timeScale = -1;
      }
      character.currentAnimation.crossFadeTo(animation, fadeDuration, false);
      setTimeout(() => {
        prevAnim.stop();
      }, fadeDuration * 1000);
    } else {
      animation.play();
    }

    character.currentAnimation = animation;
  }
}

export function rotateToFace(objectToRotate, x, z, duration = 600) {
  var radians = Math.atan2(
    x - objectToRotate.position.x,
    z - objectToRotate.position.z
  );

  // normalize current rotation to the range -PI to PI
  while (objectToRotate.rotation.y > Math.PI)
    objectToRotate.rotation.y -= 2 * Math.PI;
  while (objectToRotate.rotation.y <= -Math.PI)
    objectToRotate.rotation.y += 2 * Math.PI;

  // determine the shortest direction to the target angle
  var delta = radians - objectToRotate.rotation.y;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;

  new TWEEN.Tween(objectToRotate.rotation)
    .to({ y: objectToRotate.rotation.y + delta }, Math.min(600, duration))
    .start();
}

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}

export function drawLight(position, rotation, intensity, scene) {
  // const light = new THREE.DirectionalLight("lightyellow", intensity);
  const light = new THREE.SpotLight("white", intensity);
  light.castShadow = true;
  light.position.copy(position);
  light.rotation.copy(rotation);
  scene.add(light);

  return;
  // add a box at light2
  const geometry = new THREE.CylinderGeometry(1, 2, 3);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  cube.rotation.copy(rotation);
  scene.add(cube);
}

export function printToLogs(text) {
  console.log(text);
  // const logs = document.getElementById("terminal");
  // logs.innerHTML += `<div> #! ${text}</div>`;
  // logs.scrollTop = logs.scrollHeight;
}

export function printToChat(username, text) {
  const logs = document.getElementById("chat");
  logs.innerHTML += `<div><b>${username}</b>:${text}</div>`;
  logs.scrollTop = logs.scrollHeight;
}

export function printToSubtitles(text, duration = 2000) {
  const subtitles = document.getElementById("subtitles");
  subtitles.innerHTML = "";
  // print word by word for the duration
  const words = text.split(" ");
  let wordIndex = 0,
    word;
  let wordDuration = duration / words.length;
  const interval = setInterval(() => {
    if (wordIndex >= words.length) {
      clearInterval(interval);
      subtitles.innerHTML = "";
    } else {
      word = words[wordIndex];
      subtitles.innerHTML += word + " ";
      subtitles.scrollTop = subtitles.scrollHeight;
    }
    wordIndex++;

    // subtitles.innerHTML = text;
  }, wordDuration);
}
export function processTextbox(e) {
  if (e.key == "Enter") {
    addToQueue();
  }
}

export function printRandomChat() {
  printToChat(
    sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)],
    SampleMeanYoutubeComments[
      Math.floor(Math.random() * SampleMeanYoutubeComments.length)
    ]
  );

  if (window.tiktok_mode)
    setTimeout(printRandomChat, Math.random() * 1000 + 400);
}

// export function generateInstructions(characters) {
//   // generate random xy coordinate
//   const x = Math.floor((-0.5 + Math.random()) * 10);
//   const y = Math.floor(-0.5 + Math.random() * 10);

//   const currentPos = characters["milady1"].group.position;
//   const distance = Math.sqrt((currentPos.x - x) ** 2 + (currentPos.z - y) ** 2);
//   const duration = distance * 250;
// }

export function generateInstructions(characters) {
  const phrase = words[Math.floor(Math.random() * words.length)];
  const length_per_word = 300;

  const instructions = [
    // `go milady1 ${x + "," + y} ${duration}`,
    // `sleep ${duration}`,
    `say milady1 ${phrase.split(" ").length * length_per_word} ${phrase}`,
    `do milady1 ${animsToLoad[Math.floor(Math.random() * animsToLoad.length)]}`,
    `sleep 3000`,
  ];

  return instructions;
}

export function sayHello() {
  return [
    "go milady1 0,5 2000",
    "sleep 2000",
    "go milady1 0,8 1000",
    "sleep 1000",
    "say milady1 2000 go away",
    "do milady1 No once",
    "sleep 1000",
  ];
}

export function goToBed(characters) {
  const bedX = 0;
  const bedZ = -4;
  const currentPos = characters["milady1"].group.position;
  const distance = Math.sqrt(
    (currentPos.x - bedX) ** 2 + (currentPos.z - bedZ) ** 2
  );
  const duration = distance * 250;

  return [
    `go milady1 ${bedX + "," + bedZ} ${duration}`,
    `sleep ${duration}`,
    "lookat milady1 3,0 500",
    "sleep 500",
    "do milady1 Sleep once",
    "sleep 3000",
    "lookat milady1 -6,3 500",
    "move milady1 -2,-6 500",
    "sleep 2000",
    "say milady1 2000 zzzz",
    "sleep 2000",
    // "go milady1 0,-4 500",
    "move milady1 0,-4 500",
    "lookat milady1 3,0 500",
    "sleep 200",
    "do milady1 Idle",
    "sleep 500",
  ];
}

export function usePC(instructions) {
  return [
    "go milady1 2,2 2000",
    "sleep 2000",
    "say milady1 2000 dude23",
    "sleep 3000",
  ];
}
