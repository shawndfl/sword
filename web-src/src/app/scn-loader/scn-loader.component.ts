import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component';
import { CharacterLogic } from '../game-engine/character';
import { Environment } from '../game-engine/environment';
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
  flyCamera: CameraComponent;
  renderer: THREE.WebGLRenderer;
  mainTag: string;

  clock: THREE.Clock;

  character: CharacterLogic;
  environment: Environment;

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
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    this.flyCamera = new CameraComponent(camera);

    this.character = new CharacterLogic();
    this.character.initialize(this.scene);

    this.environment = new Environment();
    this.environment.initialize(this.scene);

    var ambient = new THREE.AmbientLight(0x909090); // soft white light
    this.scene.add(ambient);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

//Test
    // Set material
    var textue = "assets/face.png";
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
    geo.offset(5,2,0).faceIn().nx(4,0).px(1,0).ny(5,0).py(3,0).nz(2,0).pz(6,0);

    var meshTest = new THREE.Mesh(geo.build(),material);
    meshTest.scale.set(40, 40, 40);
    meshTest.position.set(0, 0, 0);

    this.scene.add(meshTest);

//End test
    document.addEventListener('mousedown', () => this.onMouseOver, false);
    document.addEventListener('mouseMove', this.onMouseMove, false);
    //document.addEventListener('touchmove', onDocumentTouchMove, false);    
  }

  @HostListener('window:mouseover', ['$event'])
  onMouseOver(mouse: MouseEvent): void {
    this.flyCamera.over(mouse);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(mouse: MouseEvent): void {
    this.flyCamera.move(mouse);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(key: KeyboardEvent): void {
    this.flyCamera.keyUp(key);
    this.character.keyUp(key);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(key: KeyboardEvent): void {
    this.flyCamera.keyDown(key);
    this.character.keyDown(key);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.flyCamera.resize(event.target.innerWidth, event.target.innerHeight);
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
    return true;
  }

  public render() {
    requestAnimationFrame(() => this.render());

    this.flyCamera.FollowTarget(this.character.graphics)
    this.character.update(this.clock.getDelta());

    this.renderer.render(this.scene, this.flyCamera.camera);

  }

}
