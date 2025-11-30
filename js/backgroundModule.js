import * as three from "three";

let PI = 3.14159;

let bgSceneDiv = document.querySelector(`#bgGL`);

let scene = new three.Scene();
scene.fog = new three.Fog('black', 0.2, 2.45);
scene.background = new three.Color('black');

let camera = new three.PerspectiveCamera(75, bgSceneDiv.offsetWidth / bgSceneDiv.offsetHeight, 0.1, 1000);
camera.position.z = 0.65;
camera.position.x = 0.12;

let renderer = new three.WebGLRenderer();
renderer.setSize(bgSceneDiv.offsetWidth, bgSceneDiv.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
bgSceneDiv.appendChild(renderer.domElement);

const texture = new three.TextureLoader().load(`./images/mesh_pattern.svg`);
texture.colorSpace = three.SRGBColorSpace;
texture.wrapS = three.RepeatWrapping;
texture.wrapT = three.RepeatWrapping;
texture.repeat.set(50, 25);

const sphereGeo = new three.SphereGeometry(1, 50, 25);
let material = new three.MeshBasicMaterial({ map: texture, side: three.BackSide });
let sphere = new three.Mesh(sphereGeo, material);
scene.add(sphere);

let threeClock = new three.Clock();
let rotateSphere = (() => {
    let elapsed = threeClock.getElapsedTime();
    let mult = Math.sin(elapsed * PI / 50);
    sphere.rotation.y = (PI / 10) * mult;
    renderer.render(scene, camera)
});

let update = (() => {
    requestAnimationFrame(update);
    rotateSphere();
});
update();

window.addEventListener('resize', () => {
    camera.aspect = bgSceneDiv.offsetWidth / bgSceneDiv.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(bgSceneDiv.offsetWidth, bgSceneDiv.offsetHeight);

    vars.resizeTable();
}, false);