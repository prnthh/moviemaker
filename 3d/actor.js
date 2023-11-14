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
} from "../constants.js";
const assetPath = "./assets/models/";

export function drawCharacter(characters, name, scene, modelToLoad = "Milady") {
  let neck, waist, mouth, skin;
  const group = new THREE.Group();

  const loader = new FBXLoader();
  loader.setPath(assetPath);
  loader.load(modelToLoad + "/model.fbx", (fbx) => {
    fbx.scale.setScalar(charactersToLoad[modelToLoad]?.scale || 0.01);
    fbx.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;

      if (c.isMesh) {
        // Assuming the texture is a map, you might also have to replace other types of maps
        // (e.g., bumpMap, normalMap, specularMap) depending on your specific needs
        // if its an array
        c.material.length &&
          c.material.forEach((mat) => {
            console.log("MAT");
            console.log(mat);
            // mat.glossiness = 0;

            mat.shininess = 0.3;
            if (mat.name == "Skin" && mat.map) {
              // Step 3: Load the New Texture
              skin = mat;
              const textureLoader = new THREE.TextureLoader();
              const newTexture = textureLoader.load("assets/images/skin7.png");
              // Step 4: Replace the Texture
              mat.map = newTexture;
              mat.needsUpdate = true; // Notify Three.js that material properties have changed
            } else if (mat.name == "Mouth" && mat.map) {
              mouth = mat;
            }
          });
      }

      // Reference the neck and waist bones
      if (c.isBone && c.name === "mixamorigNeck") {
        neck = c;
      }
      if (c.isBone && c.name === "mixamorigHead") {
        var loader = new GLTFLoader();

        loader.load("./assets/props/truckercap.glb", function (gltf) {
          var model = gltf.scene;
          model.scale.setScalar(9);
          model.position.y = 20;
          model.position.z = 22;
          c.add(model);
        });
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
      mouth: mouth,
      skin: skin,
      group: group,
      mixer: mixer,
      animations: animations,
      currentAnimation: null, // Add this line
    };

    // setCharacterMouth(characters, name);
  });
}

export function setCharacterMouth(character, mouth = "mouth1") {
  const mat = character.mouth;
  if (!mat || mat.currentMouth == mouth) return;
  mat.currentMouth = mouth;

  // Step 3: Load the New Texture
  const textureLoader = new THREE.TextureLoader();
  const newTexture = textureLoader.load(`assets/images/${mouth}.png`);
  mat.alphaMap = newTexture.alphaMap;
  // Step 4: Replace the Texture
  mat.map = newTexture;
  mat.needsUpdate = true;
}

export function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);

  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
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
