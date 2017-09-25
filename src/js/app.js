import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);
import { onWindowResize } from './three-utils';

let scene, camera, renderer, controls;

const SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
VIEW_ANGLE = 45,
ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
NEAR = 0.1,
FAR = 20000;
const LHR = {
  lat: 51.47,
  lon: 0.45
}

const LAX = {
  lat: 33.94280,
  lon: -118.40
}

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
  camera.lookAt(scene.position);

  OrbitSettings(camera);

  const earth = new THREE.SphereGeometry(100, 64, 32);
  const earthMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/nasaearth.jpg')});

  const mesh = new THREE.Mesh(earth, earthMaterial);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // const axisHelper = new THREE.AxisHelper(200);
  // scene.add(axisHelper);

  const light = new THREE.HemisphereLight('#fff', '#fff', 1);
  light.position.set(0, 500, 0);
  scene.add(light);

	var curve = new THREE.EllipseCurve(
    0, 0,             // ax, aY
    7, 5,            // xRadius, yRadius
    1, 3/2 * Math.PI, // aStartAngle, aEndAngle
);

var points = curve.getSpacedPoints( 100 );

var path = new THREE.Path();
var geometry = path.createGeometry( points );

var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

var line = new THREE.Line( geometry, material );

// scene.add( line );

  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize(camera, scene, renderer), false);
  document.addEventListener('click', initialMouseInteraction(controls), false);
  renderer.autoClear = false;

  plotRoute(LHR, LAX);

  addAirportMarker(40.7, -73.6, 0x0000FF); // Garden City, NY
  const GCNY = convertLatLonToVec3(40.7, -73.6).multiplyScalar(100.5);
  addAirportMarker(30, -90, 0x00FF00); // New Orleans, LA
  const NOLA = convertLatLonToVec3(51.886, 0.2389).multiplyScalar(100.5);
  drawCurve(createSphereArc(GCNY, NOLA), 0xFF0000);
}

function plotRoute(pointA, pointB) {
  const dep = convertLatLonToVec3(pointA.lat, pointA.lon).multiplyScalar(100.5);
  const arr = convertLatLonToVec3(pointB.lat, pointB.lon).multiplyScalar(100.5);
  drawCurve(createSphereArc(dep, arr), 0xFF0000)
}

function initialMouseInteraction(controls) {
  return () => {
    controls.autoRotate = false;
    document.removeEventListener('click', initialMouseInteraction);
  }
}

function OrbitSettings(camera) {
  controls = new OrbitControls(camera)
  controls.minDistance = 175;
  controls.maxDistance = 650;
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.enablePan = false;
  controls.rotateSpeed = 0.5;
  controls.autoRotateSpeed = 0.3;
  controls.autoRotate = true;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function addAirportMarker(lat, lon, color) { // TODO Correct position
  const radius = 201;
  const airport = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 4), new THREE.MeshBasicMaterial({color: color}));
  airport.position.set = convertLatLonToVec3(lat, lon).multiplyScalar(radius);
  scene.add(airport)
}

function createSphereArc(P, Q) {
  const sphereArc = new THREE.Curve();
  sphereArc.getPoint = greatCircleFunction(P, Q);
  return sphereArc;
}

function greatCircleFunction(P, Q) {
  const angle = P.angleTo(Q);
  return t => {
    const X = new THREE.Vector3().addVectors(P.clone().multiplyScalar(Math.sin((1 - t) * angle)), Q.clone().multiplyScalar(Math.sin(t * angle))).divideScalar(Math.sin(angle));
    return X;
  };
}

function convertLatLonToVec3(lat, lon) {
  lat = lat * Math.PI / 180.0;
  lon = -lon * Math.PI / 180.0;
  return new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
}

function drawCurve(curve, color) {
  const lineGeometry = new THREE.Geometry();
  lineGeometry.vertices = curve.getPoints(40);
  // lineGeometry.computeLineDistances();
  const lineMaterial = new THREE.LineBasicMaterial();
  lineMaterial.color = new THREE.Color(color)
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
}
