import * as THREE from 'three';
import {VRButton} from 'three/addons/webxr/VRButton.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const videoPlayer = document.getElementById('video-player');
const openButton = document.getElementById('open-button');
let camera, scene, renderer, mesh1, mesh2, texture;

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.style.borderColor = 'blue';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#ccc';
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.style.borderColor = '#ccc';
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'video/mp4') {
      const url = URL.createObjectURL(file);
      videoPlayer.src = url;
      videoPlayer.play();
      updateVideoTexture();
    } else {
      alert('Please drop an MP4 video file.');
    }
  }
});

openButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file && file.type === 'video/mp4') {
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoPlayer.play();
    updateVideoTexture();
  } else {
    alert('Please select an MP4 video file.');
  }
});

function updateVideoTexture() {
  if (texture) {
    texture.dispose();
  }
  texture = new THREE.VideoTexture(videoPlayer);
  texture.colorSpace = THREE.SRGBColorSpace;
  mesh1.material.map = texture;
  mesh2.material.map = texture;
}

init();

function init() {
  const container = document.getElementById('container');
  container.addEventListener('click', function() {
    videoPlayer.play();
  });

  camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 1, 2000);

  camera.layers.enable(1);

  texture = new THREE.VideoTexture(videoPlayer);
  texture.colorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101010);

  const geometry1 = new THREE.PlaneGeometry(1.8, 1, 1, 1);

  const uvs1 = geometry1.attributes.uv.array;
  for (let i = 0; i < uvs1.length; i += 2) {
    uvs1[i] *= 0.5;
  }

  const material1 =
      new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

  mesh1 = new THREE.Mesh(geometry1, material1);
  mesh1.layers.set(1);
  scene.add(mesh1);

  const geometry2 = new THREE.PlaneGeometry(1.8, 1, 1, 1);

  const uvs2 = geometry2.attributes.uv.array;
  for (let i = 0; i < uvs2.length; i += 2) {
    uvs2[i] *= 0.5;
    uvs2[i] += 0.5;
  }

  const material2 =
      new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

  mesh2 = new THREE.Mesh(geometry2, material2);
  mesh2.layers.set(2);
  scene.add(mesh2);

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
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const frontPosition =
      camera.position.clone().add(cameraDirection.clone().multiplyScalar(3));

  mesh1.position.copy(frontPosition);
  mesh1.quaternion.copy(camera.quaternion);

  mesh2.position.copy(frontPosition);
  mesh2.quaternion.copy(camera.quaternion);

  renderer.render(scene, camera);
}
