import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate, createTimeline, remove } from 'animejs';
import { Vector3 } from 'three';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import gsap from 'gsap';


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

upperPart.traverse((child) => {
    if(child.isMesh){
        physics.addMesh(child,0,0)
    }
})

bbox = new THREE.Box3().setFromObject(upperPart);
const size = new THREE.Vector3();
bbox.getSize(size);

sizeX = size.x;
sizeZ = size.z;
})
/*--- glass *---*/

function setGlass(posX, posZ, rotate){
const glassGeo = new THREE.BoxGeometry(7.55, 7,0.1 );
const glassMat = new THREE.MeshPhongMaterial();
glassMat.transparent = true;
glassMat.color = 0xE8F1F2;
glassMat.opacity = 0.2;

const glassMesh = new THREE.Mesh(glassGeo, glassMat);
glassMesh.position.set(posX,0, posZ);
glassMesh.rotation.y= rotate;
physics.addMesh(glassMesh,0,0);
scene.add(glassMesh);
}
/*------ Bac -----*/

    const planeGeo = new THREE.BoxGeometry(8, 0.5, 8);
    const planeMat = new THREE.MeshPhysicalMaterial({color:0x888888});

    const floor = new THREE.Mesh(planeGeo,planeMat);
    floor.position.set(0,-3.6 ,0);

    scene.add(floor)

/*---- gacha boule *----*/

async function initPhysics(){
physics = await RapierPhysics();
physics.addMesh(floor, 0,0);
    physics.addScene(scene);

    setGlass(0, 3.8, 0);
    setGlass(0, -3.8, 0);
    setGlass(3.8, 0,Math.PI / 2);
    setGlass(- 3.8, 0,Math.PI / 2);

    for(let i = 0 ; i < colorsSpheres.length ; i++){
        makeSphere(colorsSpheres[i]);}      
}

/* function getRandomInt(max){
    return Math.floor(Math.random() * max);
} */

    /*---------* Pince $------*/

let claw;
let clawMesh;
let clawBone;

let grabHelp;


let clawGrab;

loader.load("/clawgrapp.glb", (gltf) => {
claw = gltf.scene;
claw.position.set(0,3,0)
clawBone = gltf.scene.getObjectByProperty('isBone', true);
scene.add(claw)

claw.traverse((child) => {
    if(child.isMesh){

let clawGrabGeo = new THREE.BoxGeometry(1,1,1);
let clawGrabMat = new THREE.MeshPhongMaterial({transparent:true, opacity:0})

        clawMesh = child;
        clawMesh.position.copy(claw.position);
        physics.addMesh(clawMesh,0,0);

        clawGrab = new THREE.Mesh(clawGrabGeo, clawGrabMat);
        clawGrab.position.set(clawMesh.position.x, clawMesh.position.y + (-2), clawMesh.position.z)
        physics.addMesh(clawGrab,0,0)
        scene.add(clawGrab)

         grabHelp = new THREE.BoxHelper().setFromObject(clawGrab);
        scene.add(grabHelp)

        
    }
})

})

/*---- sphere---*/

const colorsSpheres = [
    0x4C2C69, 0xBEA7E5, 0x93A29B, 0x7D83FF, 0x3F6C51, 0x222E50, 0x8BB174, 0xEE7B30
]

const allSpheres = [];

function makeSphere(newColor){
    let sphereGeo = new THREE.SphereGeometry(0.6, 32, 16);
    let sphereMat = new THREE.MeshPhysicalMaterial( {
                    color: newColor
				} );
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(
       Math.random() * 2 - 1,
    Math.random() * 1 - 2,
    Math.random() * 2 - 1,
    )
    
    physics.addMesh(sphere, 1, 0.8);
    allSpheres.push(sphere);
    scene.add(sphere)
}

initPhysics()

function movingClaw(){

/* let limits = upperPart.position; */
let speed = 0.5;

window.addEventListener("keydown", (event) => {
event.preventDefault()
if(event.code === "ArrowUp"){
    if(claw.position.z <= -2.5){
return
}
else{
animate(claw.position, {
z: {
to : claw.position.z - speed,
ease:'linear',
},duration:100
})
clawMesh.position.copy(claw.position);
if(clawGrab.position.z <= -2.5){
clawGrab.position.z == clawMesh.position.z;
grabHelp.update();
}
else{
clawGrab.position.z = clawMesh.position.z - 0.5;
grabHelp.update();
}

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

clawMesh.position.copy(claw.position);
if(clawGrab.position.z >= 2.5){
clawGrab.position.z == clawMesh.position.z;
grabHelp.update();
}
else{
clawGrab.position.z = clawMesh.position.z + 0.5;
grabHelp.update();
}
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
clawMesh.position.copy(claw.position);
if(clawGrab.position.x <= -2.5){
clawGrab.position.x == clawMesh.position.x;
grabHelp.update();
}
else{
clawGrab.position.x = clawMesh.position.x - 0.5;
grabHelp.update();
}
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

clawMesh.position.copy(claw.position);
clawMesh.updateMatrixWorld();
if(clawGrab.position.x >= 2.5){
clawGrab.position.x == clawMesh.position.x;
clawGrab.updateMatrixWorld()
grabHelp.update();
}
else{
clawGrab.position.x = clawMesh.position.x + 0.5;
clawGrab.updateMatrixWorld()
grabHelp.update();
}
}

 }

})
}

movingClaw()

/*----- Grab gift -----*/


const tl = createTimeline();

let intersects;
let raycaster = new THREE.Raycaster();
const downDir = new THREE.Vector3(0, -1, 0);

let isGrabbed = false;

function makeRaycast(upOrigin){
upOrigin = new THREE.Vector3(upOrigin.x,0, upOrigin.z)
raycaster.set(upOrigin, downDir);

let raycastHelp = new THREE.ArrowHelper(downDir, upOrigin, 500, 0xffff00);
scene.add(raycastHelp);
intersects = raycaster.intersectObjects((allSpheres));
if(intersects.length > 0){
    isGrabbed = true;
    let gift = intersects[0].object
    physics.removeMesh(gift);
    setTimeout(() => {
        gsap.fromTo(gift.position, {y:0}, {y:clawGrab.position.y, duration: 2000});

    },2000)
}
else{
    isGrabbed = false;
    return
}
}

window.addEventListener("keydown", (event) => {
event.preventDefault()
if (event.code === "Space") {
let posXY = new THREE.Vector3();
clawGrab.getWorldPosition(posXY);
makeRaycast(posXY)
  tl.add(animate(clawBone.position, {
    y:[
      { to: -3, ease: 'inOut', duration: 2000 },
      { to: 0,  ease: 'inOut', duration: 2000 },
    ]
  }))
  if(isGrabbed == false)
{

} else if(isGrabbed == true){

}
}})


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
