import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-main-game',
  templateUrl: './main-game.component.html',
  styleUrls: ['./main-game.component.css']
})
export class MainGameComponent implements OnInit {

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor() { }

  ngOnInit() {
    this.init();
    this.render();
  }

  public init() {

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;

    var geometry = new THREE.BoxGeometry(200, 200, 200);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

    var mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

}
