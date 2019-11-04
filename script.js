import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.shadowMap.enabled = true;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 20, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#DEFEFF');

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1.2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(-400, 300, 250);
    light.target.position.set(0, -200, 0);

    light.shadow.bias = -0.004;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);
    scene.add(light.target);
    const cam = light.shadow.camera;
    cam.near = 1;
    cam.far = 2000;
    cam.left = -1500;
    cam.right = 1500;
    cam.top = 1500;
    cam.bottom = -1500;

    const cameraHelper = new THREE.CameraHelper(cam);
    scene.add(cameraHelper);
    cameraHelper.visible = false;
    const helper = new THREE.DirectionalLightHelper(light, 100);
    scene.add(helper);
    helper.visible = false;

    function makeXYZGUI(gui, vector3, name, onChangeFn) {
      const folder = gui.addFolder(name);
      folder.add(vector3, 'x', vector3.x - 500, vector3.x + 500).onChange(onChangeFn);
      folder.add(vector3, 'y', vector3.y - 500, vector3.y + 500).onChange(onChangeFn);
      folder.add(vector3, 'z', vector3.z - 500, vector3.z + 500).onChange(onChangeFn);
      folder.open();
    }

    function updateCamera() {
      // update the light target's matrixWorld because it's needed by the helper
      light.updateMatrixWorld();
      light.target.updateMatrixWorld();
      helper.update();
      // update the light's shadow camera's projection matrix
      light.shadow.camera.updateProjectionMatrix();
      // and now update the camera helper we're using to show the light's shadow camera
      cameraHelper.update();
    }
    updateCamera();

    class DimensionGUIHelper {
      constructor(obj, minProp, maxProp) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
      }
      get value() {
        return this.obj[this.maxProp] * 2;
      }
      set value(v) {
        this.obj[this.maxProp] = v /  2;
        this.obj[this.minProp] = v / -2;
      }
    }

    class MinMaxGUIHelper {
      constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
      }
      get min() {
        return this.obj[this.minProp];
      }
      set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
      }
      get max() {
        return this.obj[this.maxProp];
      }
      set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;  // this will call the min setter
      }
    }

    class VisibleGUIHelper {
      constructor(...objects) {
        this.objects = [...objects];
      }
      get value() {
        return this.objects[0].visible;
      }
      set value(v) {
        this.objects.forEach((obj) => {
          obj.visible = v;
        });
      }
    }

    const gui = new GUI();
    gui.close();
    gui.add(new VisibleGUIHelper(helper, cameraHelper), 'value').name('show helpers');
    gui.add(light.shadow, 'bias', -0.1, 0.1, 0.001);
    {
      const folder = gui.addFolder('Shadow Camera');
      folder.open();
      folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 4000)
        .name('width')
        .onChange(updateCamera);
      folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 4000 )
        .name('height')
        .onChange(updateCamera);
      const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
      folder.add(minMaxGUIHelper, 'min', 1, 1000, 1).name('near').onChange(updateCamera);
      folder.add(minMaxGUIHelper, 'max', 1, 4000, 1).name('far').onChange(updateCamera);
      folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
    }

    makeXYZGUI(gui, light.position, 'position', updateCamera);
    makeXYZGUI(gui, light.target.position, 'target', updateCamera);
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }


  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('https://raw.githubusercontent.com/whimsicaltw/Line_3Dtest/master/model/test1.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);

      root.traverse((obj) => {
        if (obj.castShadow !== undefined) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
