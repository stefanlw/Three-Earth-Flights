import * as THREE from 'three';

export function render (renderer, scene, camera) {
  renderer.render(scene, camera);
}

export function onWindowResize (camera, scene, renderer) {
  return () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render(renderer, scene, camera);
  }
}
