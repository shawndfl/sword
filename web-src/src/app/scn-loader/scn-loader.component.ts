import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component';
import * as GAME from '../game-engine/environment';
import * as DATA from '../game-engine/data';
import * as G from "../game-engine/graphics"
import * as THREE from 'three';

@Component({
  selector: 'app-scn-loader',
  templateUrl: './scn-loader.component.html',
  styleUrls: ['./scn-loader.component.css']
})
export class ScnLoaderComponent {

  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  mainTag: string;

  clock: THREE.Clock;
  
  environment: GAME.Environment;

  constructor() {
    this.mainTag = "mainGame";
  }

  ngOnInit() {
    this.init();
    this.render();
  }

  public init() {

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();    

    this.environment = new GAME.Environment();
    this.environment.initialize(this.scene);

    var ambient = new THREE.AmbientLight(0x909090); // soft white light
    this.scene.add(ambient);
    this.scene.background

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

    //Test
    // Set material
    var textue = "assets/environment.png";
    var diffused = new THREE.TextureLoader().load(textue);
    diffused.wrapS = THREE.ClampToEdgeWrapping;
    diffused.wrapT = THREE.ClampToEdgeWrapping;
    diffused.magFilter = THREE.NearestFilter;
    diffused.minFilter = THREE.NearestMipMapNearestFilter;

    var material = new THREE.MeshPhongMaterial();
    material.color = new THREE.Color(1.0, 1.0, 1.0);

    material.shininess = 100.0;
    material.specular = new THREE.Color(1.0, 1.0, 1.0);
    material.transparent = true;
    material.map = diffused;
    material.wireframe = false;
    var geo = new G.GeoBuilder();
    geo.offset(5,2,0).faceOut().nx(1,0).px(1,0).ny(3,0).py(4,0).nz(1,0).pz(1,0);

    var meshTest = new THREE.Mesh(geo.build(),material);
    meshTest.scale.set(40, 40, 40);
    meshTest.position.set(0, 0, 20);

    this.scene.add(meshTest);

//End test
    document.addEventListener('mousedown', () => this.onMouseOver, false);
    document.addEventListener('mouseMove', this.onMouseMove, false);
    //document.addEventListener('touchmove', onDocumentTouchMove, false);    
  }

  @HostListener('window:mouseover', ['$event'])
  onMouseOver(mouse: MouseEvent): void {
    this.environment.onMouseOver(mouse);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(mouse: MouseEvent): void {
    this.environment.onMouseMove(mouse);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(key: KeyboardEvent): void {
    this.environment.onKeyUp(key);    
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(key: KeyboardEvent): void {
    this.environment.onKeyDown(key);    
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.environment.onWindowResize(event.target.innerWidth, event.target.innerHeight);
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
    return true;
  }

  public render() {
    requestAnimationFrame(() => this.render());
    var delta = this.clock.getDelta();
    this.environment.onUpdate(delta);    

    this.renderer.render(this.scene, this.environment.camera);

  }

}
