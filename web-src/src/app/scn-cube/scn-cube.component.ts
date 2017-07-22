import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component'

import * as THREE from 'three';

@Component({
  selector: 'app-scn-cube',
  templateUrl: './scn-cube.component.html',
  styleUrls: ['./scn-cube.component.css']
})
export class ScnCubeComponent implements OnInit {

  scene: THREE.Scene;
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
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera = new CameraComponent(camera);

    var geometry = new THREE.BoxGeometry(20, 20, 20);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 10;

    this.scene.add(mesh);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

    document.getElementById(this.mainTag).focus();

    var gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    this.scene.add(gridHelper);

    document.addEventListener('mousedown', () => this.onMouseOver, false);
    document.addEventListener('mouseMove', this.onMouseMove, false);
    //document.addEventListener('touchmove', onDocumentTouchMove, false);    
  }

  @HostListener('window:mouseover', ['$event'])
  onMouseOver(mouse: MouseEvent): void {
    this.camera.over(mouse);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(mouse: MouseEvent): void {
    this.camera.move(mouse);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(key: KeyboardEvent): void {
    this.camera.keyUp(key);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(key: KeyboardEvent): void {
    this.camera.keyDown(key);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.camera.resize(event.target.innerWidth, event.target.innerHeight);    
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
    return true;
  }

  public render() {
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera.camera);
  }

}
