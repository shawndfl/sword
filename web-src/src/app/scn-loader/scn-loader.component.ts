import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component';
import { CharacterLogic } from '../game-engine/character';
import { Environment } from '../game-engine/environment';
import * as DATA from '../game-engine/data';
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

    var ambient = new THREE.AmbientLight( 0x909090 ); // soft white light
    this.scene.add( ambient );    

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

    //var gridHelper = new THREE.GridHelper(1000, 100, 0x0000ff, 0x808080);
    //gridHelper.position.y = 0;
    //gridHelper.position.x = 0;
    //this.scene.add(gridHelper);

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

    this.character.update(this.clock.getDelta());

    this.renderer.render(this.scene, this.flyCamera.camera);    

  }

}
