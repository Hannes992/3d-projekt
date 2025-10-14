"use strict";
import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/GLTFLoader";

window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  document.querySelector('.hero-section').style.backgroundPosition = 'center ' + (scrolled * 0.1) + 'px';
});


let object1 = document.querySelector("#model1");
let object2 = document.querySelector("#model2");



// 3D Funktionen

function centerOrbitOnObject(object3D, camera, controls) {
  // Bounding-Box/-Zentrum
  const box = new THREE.Box3().setFromObject(object3D);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Wenn das Objekt noch keine gültigen Bounds hat, abbrechen
  if (!isFinite(center.x) || !isFinite(center.y) || !isFinite(center.z)) return;

  // Kamera-Distanz und Blickrichtung beibehalten:
  const oldTarget = controls.target.clone();
  const dir = new THREE.Vector3().subVectors(camera.position, oldTarget).normalize();
  const dist = camera.position.distanceTo(oldTarget);

  // Neuen Pivot setzen und Kamera entsprechend versetzen
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(dir, dist);
  camera.updateProjectionMatrix();
  controls.update();
};

function WindowResizer(object3D, camera, rendererInstance) {
window.addEventListener('resize', () => {
  const width = object3D.clientWidth;
  const height = object3D.clientHeight;
  rendererInstance.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
})};

function setFrontalView(camera, controls, targetVec3, distance) {
  const target = targetVec3.clone();
  const dist = (typeof distance === "number")
    ? distance
    : camera.position.distanceTo(controls.target); // aktuelle Distanz beibehalten

  controls.target.copy(target);
  // frontal auf +Z, Distanz beibehalten
  camera.position.set(target.x, target.y, target.z + dist);
  camera.lookAt(target); // optional
  camera.near = Math.max(0.01, dist / 100);
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  controls.update();
}


// Scene1

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(object1.clientWidth, object1.clientHeight);
object1.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2;

const color = 0x223355;
const intensity = 0.8;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-3, 2, 4);
scene.add(light);
const ambient = new THREE.AmbientLight(0xffffff, 0.10);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0x2a3b5f, 0x1e1e1e, 0.2);
hemi.position.set(0, 10, 0);
scene.add(hemi);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
light.shadow.bias = -0.0001; // gegen Shadow-Akne
 

const loader = new GLTFLoader();
let model1; // Referenz für Animation
let pivot1 = null;

loader.load("./3dmodels/alte_synagoge/scene.gltf",         // oder "./models/model.glb"
  (gltf) => {
    model1 = gltf.scene;

   // Optional: Materialien/Lichter vorbereiten
    model1.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Optional: Modell in die Szene einpassen (skalieren & zentrieren)
    const box = new THREE.Box3().setFromObject(model1);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // 1) Pivot-Gruppe anlegen (einmalig; oben anlegen oder hier vor dem Add)
    const pivot1 = new THREE.Group();
    scene.add(pivot1);

    model1.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // const fov = camera.fov * (Math.PI / 180);
    // const offset = 0.7; // kleiner = näher, größer = weiter weg
    // let cameraZ = (maxDim / 1) / Math.tan(fov / 1) * offset;
    // cameraZ *= 1.5;
    
    const targetSize = 1.5; // gewünschte Kantenlänge im Sichtfeld
    const scale = targetSize / maxDim;
    model1.scale.setScalar(scale);
 
    pivot1.add(model1);

    const dist = camera.position.distanceTo(controls.target);
    camera.position.set(0, 0, dist + 1);
    camera.near = Math.max(0.01, dist / 100);
    camera.far = dist * 100;
    camera.updateProjectionMatrix();

    scene.add(model1);
    controls.target.set(0, 0, 0);
    controls.update();
    centerOrbitOnObject(model1, camera, controls);
    const center1 = new THREE.Vector3();
    new THREE.Box3().setFromObject(model1).getCenter(center1);
    setFrontalView(camera, controls, center1);
   
  },
  undefined,
    (error) => {
    console.error("GLTF load error:", error);
  }

);

// Szene 2

const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false});
renderer2.outputEncoding = THREE.sRGBEncoding;
renderer2.toneMapping = THREE.ACESFilmicToneMapping;
renderer2.toneMappingExposure = 0.75;
renderer2.physicallyCorrectLights = true;
renderer2.shadowMap.enabled = true;
renderer2.shadowMap.type = THREE.PCFSoftShadowMap;
renderer2.setSize(object2.clientWidth, object2.clientHeight);
object2.appendChild( renderer2.domElement );

const controls2 = new OrbitControls(camera2, renderer2.domElement);
controls2.enableDamping = true;
controls2.dampingFactor = 0.05;
controls2.minDistance = 0.5;
controls2.maxDistance = 10;
controls2.maxPolarAngle = Math.PI / 2;

const color2 = 0x223355;
const intensity2 = 0.8;
const light2 = new THREE.DirectionalLight(color2, intensity2);
light2.position.set(-3, 2, 4);
scene2.add(light2);
const ambient2 = new THREE.AmbientLight(0xffffff, 0.10);
scene2.add(ambient2);
const hemi2 = new THREE.HemisphereLight(0x2a3b5f, 0x1e1e1e, 0.2);
hemi2.position.set(0, 10, 0);
scene2.add(hemi2);
light2.castShadow = true;
light2.shadow.mapSize.set(2048, 2048);
light2.shadow.bias = -0.0001; // gegen Shadow-Akne

const loader2 = new GLTFLoader();
let model2; // Referenz für Animation

loader2.load("./3dmodels/der_gefesselte/scene.gltf",         // oder "./models/model.glb"
  (gltf) => {
    model2 = gltf.scene;

   // Optional: Materialien/Lichter vorbereiten
    model2.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Optional: Modell in die Szene einpassen (skalieren & zentrieren)
    const box2 = new THREE.Box3().setFromObject(model2);
    const size2 = new THREE.Vector3();
    const center2 = new THREE.Vector3();
    box2.getCenter(center2);
    box2.getSize(size2);

    // 1) Pivot-Gruppe anlegen (einmalig; oben anlegen oder hier vor dem Add)
    const pivot2 = new THREE.Group();
    scene2.add(pivot2);

    model2.position.sub(center2); // zum Ursprung zentrieren

    const maxDim2 = Math.max(size2.x, size2.y, size2.z) || 1;
    // const fov2 = camera2.fov * (Math.PI / 180);
    // const offset2 = 0.7; // kleiner = näher, größer = weiter weg
    // let cameraZ2 = (maxDim2 / 1) / Math.tan(fov2 / 1) * offset2;
    // cameraZ2 *= 1.5;
    
    const targetSize2 = 1.5; // gewünschte Kantenlänge im Sichtfeld
    const scale2 = targetSize2 / maxDim2;
    model2.scale.setScalar(scale2);

    pivot2.add(model2);
    
    const dist2 = camera2.position.distanceTo(controls2.target);
    camera2.position.set(0, 0, dist2 + 1);
    camera2.near = Math.max(0.01, dist2 / 100);
    camera2.far = dist2 * 100;
    camera2.updateProjectionMatrix();

    scene2.add(model2);
    centerOrbitOnObject(model2, camera2, controls2);
    new THREE.Box3().setFromObject(model2).getCenter(center2);
    setFrontalView(camera2, controls2, center2);
  },
  undefined,
    (error) => {
    console.error("GLTF load error:", error);
  }

);

WindowResizer(object1, camera, renderer);
WindowResizer(object2, camera2, renderer2);

// Animationsschleife für beide Szenen
function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  if (model1) {
    model1.rotation.y += -0.001;
  }
  controls2.update();
  if (model2) {
    model2.rotation.y += -0.001;
  }

  renderer.render(scene, camera);
  renderer2.render(scene2, camera2);
}


animate();