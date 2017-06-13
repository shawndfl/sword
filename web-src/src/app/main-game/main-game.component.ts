import { Component, OnInit } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component'

import * as THREE from 'three';

@Component({
  selector: 'app-main-game',
  templateUrl: './main-game.component.html',
  styleUrls: ['./main-game.component.css']
})
export class MainGameComponent implements OnInit {

  scene: THREE.Scene;
  //camera: THREE.PerspectiveCamera;
  camera: CameraComponent;
  renderer: THREE.WebGLRenderer;
  mainTag: string;

  constructor() {
    this.mainTag = "mainGame";
  }

  ngOnInit() {
    this.init();
    this.render();    
  }

  public init() {

    this.scene = new THREE.Scene();
    this.camera = new CameraComponent();

    //this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    //this.camera.position.z = 1000;

    var geometry = new THREE.BoxGeometry(20, 20, 20);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

    var mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

  
    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

    document.getElementById(this.mainTag).focus();

  }

  over(mouse: MouseEvent): void {  
      this.camera.over(mouse);
  }

  move(mouse: MouseEvent): void {    
    this.camera.move(mouse);
  }

  keyUp(key: KeyboardEvent): void {    
    this.camera.keyUp(key);
  }

  keyDown(key: KeyboardEvent): void {    
    this.camera.keyDown(key);
  }

  public render() {
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera.camera);        
  }  
}
