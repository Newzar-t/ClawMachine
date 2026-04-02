import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate, createTimeline, remove } from 'animejs';
import { Vector3 } from 'three';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { BoxGeometry } from 'three';

let physics;

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
)
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader)

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffd9ba)

const viewport = {
    width : window.innerWidth,
    height : window.innerHeight,
}

const camera = new THREE.PerspectiveCamera(75, viewport.width/ viewport.height, 0.1, 500);
camera.position.set(0,-3,12)

/*---- lights ----*/

const ambLight = new THREE.AmbientLight(0xffb578, 3);
ambLight.position.set(0,8,0);
ambLight.castShadow = true;
scene.add(ambLight);

const pointLight = new THREE.PointLight(0xfff000, 1)
pointLight.position.set(0,-0.5,0);
pointLight.castShadow = true;
pointLight.lookAt(new Vector3(0,-5,0))
scene.add(pointLight)

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(viewport.width, viewport.height)

const controls = new OrbitControls(camera,renderer.domElement);

document.body.appendChild(renderer.domElement);

/*----- Machine -----*/

let upperPart;
let bbox;
let sizeX, sizeZ;

loader.load("/clawmachine.glb", (gltf) => {
upperPart = gltf.scene;
upperPart.position.set(0,3.2,0);
scene.add(upperPart)

bbox = new THREE.Box3().setFromObject(upperPart);
const size = new THREE.Vector3();
bbox.getSize(size);

sizeX = size.x;
sizeZ = size.z;
console.log(sizeX, sizeZ)
})
/*--- glass *---*/

function setGlass(posX, posZ, rotate){
const glassGeo = new THREE.BoxGeometry(7, 7,0.1 );
const glassMat = new THREE.MeshPhongMaterial();
glassMat.transparent = true;
glassMat.color = 0xe0f4ff;
glassMat.opacity = 0.2;

const glassMesh = new THREE.Mesh(glassGeo, glassMat);
glassMesh.position.set(posX,0, posZ);
glassMesh.rotation.y= rotate;
physics.addMesh(glassMesh,0,0);
scene.add(glassMesh);
}
/*------ Bac -----*/

    const planeGeo = new THREE.BoxGeometry(7.5, 0.5, 7.5);
    const planeMat = new THREE.MeshPhysicalMaterial({color:0x888888});

    const floor = new THREE.Mesh(planeGeo,planeMat);
    floor.position.set(0,-3.6 ,0);

    scene.add(floor)

/*---- gacha boule *----*/

async function initPhysics(){
    physics = await RapierPhysics();
physics.addMesh(floor, 0,0);
    physics.addScene(scene);

    setGlass(0, 3.5, 0);
    setGlass(0, -3.5, 0);
    setGlass(3.5, 0,Math.PI / 2);
    setGlass(- 3.5, 0,Math.PI / 2);

    for(let i = 0 ; i < 15 ; i++){
        makeSphere(0xfff000);}

        
}

function makeSphere(newColor){
    let sphereGeo = new THREE.SphereGeometry(0.6, 32, 16);
    let sphereMat = new THREE.MeshPhysicalMaterial( {
                    color: newColor
				} );
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(
        Math.random() * 2 - 1,
    Math.random() * 1 + 1,
    Math.random() * 2 - 1,
    )
    
    physics.addMesh(sphere, 1, 0.8);
    scene.add(sphere)
}

initPhysics()



/*---------* Pince $------*/

let claw;
let clawBone;

loader.load("/clawgrapp.glb", (gltf) => {
claw = gltf.scene;
claw.position.set(0,3,0)
clawBone = gltf.scene.getObjectByProperty('isBone', true);
scene.add(claw)

console.log(clawBone)
})

function movingClaw(){

/* let limits = upperPart.position; */
let speed = 0.5;

window.addEventListener("keydown", (event) => {
event.preventDefault()
if(event.code === "ArrowUp"){
    if(claw.position.z <= -2.5){
        console.log(claw.position.z)
console.log("limite")
}
else{
   animate(claw.position, {
z: {
to : claw.position.z - speed,
ease:'linear',
}, duration:100,
})
}

 }
if(event.code === "ArrowDown"){
    if(claw.position.z >= 2.5){
        console.log(claw.position.z)
console.log("limite")
}
else{
   animate(claw.position, {
z: {
to : claw.position.z + speed,
ease:'linear',
}, duration:100,
})
}

 }
if(event.code === "ArrowLeft"){
    if(claw.position.x <= -2.5){
        console.log(claw.position.z)
console.log("limite")
}
else{
   animate(claw.position, {
x: {
to : claw.position.x - speed,
ease:'linear',
}, duration:100,
})
}

 }
if(event.code === "ArrowRight"){
    if(claw.position.x >= 2.5){
        console.log(claw.position.z)
console.log("limite")
}
else{
   animate(claw.position, {
x: {
to : claw.position.x + speed,
ease:'linear',
}, duration:100,
})
}

 }

})
}

movingClaw()

/*----- Grab gift -----*/

function grabObject(){
    window.addEventListener("keydown", (event) => {
event.preventDefault()
 if(event.code === "Space"){
animate(clawBone.position ,{
y:{
    to: -3,
    ease:'inOut',
    duration:2000,
}
})
 }
})
}

grabObject()

window.onresize = () => {
 viewport.height = window.innerHeight;
 viewport.width = window.innerWidth;

 renderer.setSize(viewport.width, viewport.height);
console.log(camera.position)
 camera.aspect = viewport.width/viewport.height;
 camera.updateProjectionMatrix();
}

function animateRender(time){
    time *= 0.001;

    requestAnimationFrame(animateRender)
    controls.update()
    renderer.render(scene, camera)
}

animateRender();
