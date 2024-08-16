import * as THREE from 'three';
import {VRButton} from 'three/addons/webxr/VRButton.js';

let camera, scene, renderer, mesh1, mesh2;

init();

// Initializes the scene, camera, renderer, controls, and XR button.
function init() {
  const container = document.getElementById('container');
  container.addEventListener('click', function() {
    video.play();
  });

  camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 1, 2000);

  // Renders left view when no stereo available.
  camera.layers.enable(1);

  const video = document.getElementById('video');
  video.play();

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101010);

  // Left eye.
  const geometry1 = new THREE.PlaneGeometry(
      1.8, 1, 1, 1);  // Width is 1.8 times the height to match aspect ratio

  // Adjust UVs for the left half of the video.
  const uvs1 = geometry1.attributes.uv.array;
  for (let i = 0; i < uvs1.length; i += 2) {
    uvs1[i] *= 0.5;
  }

  const material1 =
      new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

  mesh1 = new THREE.Mesh(geometry1, material1);
  mesh1.layers.set(1);  // Display in left eye only
  scene.add(mesh1);

  // Right eye.
  const geometry2 = new THREE.PlaneGeometry(
      1.8, 1, 1, 1);  // Width is 1.8 times the height to match aspect ratio

  // Adjust UVs for the right half of the video.
  const uvs2 = geometry2.attributes.uv.array;
  for (let i = 0; i < uvs2.length; i += 2) {
    uvs2[i] *= 0.5;
    uvs2[i] += 0.5;
  }

  const material2 =
      new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

  mesh2 = new THREE.Mesh(geometry2, material2);
  mesh2.layers.set(2);  // Display in right eye only
  scene.add(mesh2);

  // Sets up renderer.
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  container.appendChild(renderer.domElement);

  document.body.appendChild(VRButton.createButton(renderer));
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  // Update the positions of the quads to be 3 meters in front of the camera
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const frontPosition =
      camera.position.clone().add(cameraDirection.clone().multiplyScalar(3));

  mesh1.position.copy(frontPosition);
  // mesh1.position.x -= 0.9;  // Slight offset to the left for the left eye
  mesh1.quaternion.copy(camera.quaternion);  // Make the quad face the camera

  mesh2.position.copy(frontPosition);
  mesh2.quaternion.copy(camera.quaternion);  // Make the quad face the camera

  // mesh2.position.x += 0.9;  // Slight offset to the right for the right eye

  renderer.render(scene, camera);
}
