if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, controls;
var camera, scene, renderer;

init();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(5, 5, 10);

  controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0, 0);
  controls.update();

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapType = THREE.PCFShadowMap;
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.gammaOutput = true;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Lights

//Fixed Spotlight Right
var Light_R = new THREE.SpotLight(0xffaa00, 1, 50);
Light_R.position.set(2, 2, 2);
Light_R.castShadow = true;
Light_R.shadowCameraVisible = true;
Light_R.shadowMapWidth = 2048;
Light_R.shadowMapHeight = 2048;

var lightHolder_R = new THREE.Group();
lightHolder_R.add(Light_R);
scene.add(lightHolder_R);

//Ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.4));




// Objects

var model = new THREE.GLTFLoader();
model.load('https://raw.githubusercontent.com/whimsicaltw/Line_3Dtest/master/model/test1.gltf', function(gltf) {scene.add(gltf.scene);});
model.castShadow = true;

var boxgeometry = new THREE.CubeGeometry(2, 2, 2);
var boxmaterial = new THREE.MeshLambertMaterial({
  color: 0x0aeedf
});
var cube = new THREE.Mesh(boxgeometry, boxmaterial);
cube.castShadow = true;
cube.position.x = -2;
cube.position.y = 1;
cube.position.z = -2;

scene.add(cube);

var groundMaterial = new THREE.MeshPhongMaterial({color: 0x6C6C6C});
plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;

scene.add(plane);


render();
//Render Loop
function render() {
  requestAnimationFrame(render);
  lightHolder_R.quaternion.copy(camera.quaternion);
  renderer.render(scene, camera);
}
