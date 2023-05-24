import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export function drawObject(name, scene) {
  var loader = new GLTFLoader();

  loader.load(
    "./pocketmilady/room3.glb",
    function (gltf) {
      var model = gltf.scene;

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
      model.rotation.y = Math.PI / 4;
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
export function drawCharacter(characters, name, scene, modelToLoad = "Milady") {
  const group = new THREE.Group();

  const loader = new FBXLoader();
  loader.setPath(assetPath);
  loader.load(modelToLoad + "/model.fbx", (fbx) => {
    fbx.scale.setScalar(0.01);
    fbx.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.material) c.material.shininess = 0;
    });

    const animLoader = new FBXLoader();
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

export function drawText(
  scene,
  message = "Milady\nWorld Order",
  position,
  maxDuration = 2000
) {
  const loader = new FontLoader();
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

export function drawLight(position, rotation, intensity, scene) {
  // const light = new THREE.DirectionalLight("lightyellow", intensity);
  const light = new THREE.PointLight("lightyellow", intensity);
  light.castShadow = true;
  light.position.copy(position);
  light.rotation.copy(rotation);
  scene.add(light);

  return;
  // add a box at light2
  const geometry = new THREE.BoxGeometry(1, 2, 3);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  cube.rotation.copy(rotation);
  scene.add(cube);
}

export function printToLogs(text) {
  console.log(text);
  // const logs = document.getElementById("log");
  // logs.innerHTML += `<div> #! ${text}</div>`;
  // logs.scrollTop = logs.scrollHeight;
}
export function processTextbox(e) {
  if (e.key == "Enter") {
    addToQueue();
  }
}

export function generateInstructions(characters) {
  // generate random xy coordinate
  const x = Math.floor((-0.5 + Math.random()) * 10);
  const y = Math.floor(-0.5 + Math.random() * 10);

  const currentPos = characters["milady1"].group.position;
  const distance = Math.sqrt((currentPos.x - x) ** 2 + (currentPos.z - y) ** 2);
  const duration = distance * 250;

  const instructions = [
    `go milady1 ${x + "," + y} ${duration}`,
    `sleep ${duration}`,
    `say milady1 2000 ${words[Math.floor(Math.random() * words.length)]}`,
    "do milady1 Talk",
    `sleep 3000`,
    `do milady1 Idle`,
    `sleep 2000`,
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
    "sleep 3000",
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

const words = ["feds are coming bro", "omg hiii", "i love you", "i hate you"];

const animsToLoad = [
  "Walk",
  "Talk",
  "SillyDancing",
  "Dancing2",
  "Idle",
  "DJ",
  "HeadNod",
  "LookAround",
  "Opening",
  "Taunt",
  "Waving",
  "HipDance",
  "HipDance2",
  "Sad",
  "Happy",
  "Yes",
  "No",
  "Sleep",
]; // Add animation filenames here
