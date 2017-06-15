import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component'

import * as THREE from 'three';

@Component({
  selector: 'app-scn-loader',
  templateUrl: './scn-loader.component.html',
  styleUrls: ['./scn-loader.component.css']
})
export class ScnLoaderComponent {

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

  private loadMesh(json): THREE.Mesh {

    var geometry = new THREE.BufferGeometry();
    var vertices = new Float32Array([
       0.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      0.0,  1.0,  0.0,
      1.0,  1.0,  0.0,
      1.0,  0.0,  0.0,
      0.0,  0.0,  0.0,
    ]);

     var indices = new Uint16Array([
      0,3,1,  //front
      1,3,2,
      
      1,2,5,  //right
      5,2,6,

      5,6,7, //back
      4,5,7,

      4,7,3, //left
      0,4,3,

      2,3,7, //bottom
      6,2,7,

      4,0,5,  //top
      5,0,1

     ])

    geometry.setIndex( new THREE.BufferAttribute(indices, 1) );
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 20;

    return mesh;
  }

  public init() {

    this.scene = new THREE.Scene();
    this.camera = new CameraComponent();

    var geometry = new THREE.BoxGeometry(20, 20, 20);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: false });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 10;
    //this.scene.add(mesh);
    this.scene.add(this.loadMesh(null));


    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

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
