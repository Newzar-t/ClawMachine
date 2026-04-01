import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* import { animate } from 'animejs'; */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x005d9c)

const viewport = {
    width : window.innerWidth,
    height : window.innerHeight,
}

const camera = new THREE.PerspectiveCamera(75, viewport.width/ viewport.height, 0.1, 500);
camera.position.set(0,5,10)


const ambLight = new THREE.AmbientLight(0xffffff, 5);
ambLight.position.set(0,10,0);
scene.add(ambLight);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(viewport.width, viewport.height)

const controls = new OrbitControls(camera,renderer.domElement);

document.body.appendChild(renderer.domElement);

/*---------*/

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
)
const loader = new GLTFLoader();

let claw;
loader.load("/claw.glb", (gltf) => {

claw = gltf.scene;
scene.add(claw)
})

function movingClaw(){

let speed = 1;
let smooth = 0.1;

window.addEventListener("keydown", (event) => {
    
    if(event.code === "ArrowUp"){

    claw.position.z -= speed;
    }
    if(event.code === "ArrowDown"){
    claw.position.z += speed;
    }
    if(event.code === "ArrowLeft"){
    claw.position.x -= speed;
    }
    if(event.code === "ArrowRight"){
    claw.position.x += speed;
    }
    
})
}


    movingClaw()

window.onresize = () => {
 viewport.height = window.innerHeight;
 viewport.width = window.innerWidth;

 renderer.setSize(viewport.width, viewport.height);

 camera.aspect = viewport.width/viewport.height;
 camera.updateProjectionMatrix();
}

function animate(time){
    time *= 0.001;

    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

animate();
