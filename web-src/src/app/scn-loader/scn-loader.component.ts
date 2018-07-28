import { Component, OnInit, HostListener } from '@angular/core';
import * as GAME from '../game-engine/system';
import * as THREE from 'three';

@Component({
  selector: 'app-scn-loader',
  templateUrl: './scn-loader.component.html',
  styleUrls: ['./scn-loader.component.css']
})
export class ScnLoaderComponent {
  
  sceneHUD: THREE.Scene;
  cameraHUD: THREE.Camera;

  renderer: THREE.WebGLRenderer;
  mainTag: string;

  clock: THREE.Clock;
  
  environment: GAME.Environment;

  constructor() {
    this.mainTag = "mainGame";
  }

  /*
   *  The entry point for the game.
   */
  ngOnInit() {
    this.init();
    this.render();
  }
  public init() {

    this.clock = new THREE.Clock();   

    this.environment = new GAME.Environment();
    this.environment.initialize();

    document.getElementById(this.mainTag).appendChild(this.environment.domElement);  
    document.addEventListener('mousedown', () => this.onMouseOver, false);
    document.addEventListener('mouseMove', this.onMouseMove, false);
  }
/*
  public init() {

    this.clock = new THREE.Clock();   

    this.environment = new GAME.Environment();
    this.environment.initialize();
        

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);  
    document.addEventListener('mousedown', () => this.onMouseOver, false);
    document.addEventListener('mouseMove', this.onMouseMove, false);

    //HUD
    var hudCanvas = document.createElement('canvas');
    hudCanvas.width = window.innerWidth;
    hudCanvas.height = window.innerHeight;

    var hudBitmap = hudCanvas.getContext('2d');
    hudBitmap.font = "Normal 40px Arial";
    hudBitmap.textAlign = 'center';
    hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
    hudBitmap.fillText('Initializing...', window.innerWidth / 2, window.innerHeight / 2);

    this.cameraHUD = new THREE.OrthographicCamera(
      -window.innerWidth/2, window.innerWidth/2,
      window.innerHeight/2, -window.innerHeight/2,
      0, 30
      );
    this.sceneHUD = new THREE.Scene();
    var hudTexture = new THREE.Texture(hudCanvas)
    hudTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( {map: hudTexture } );
    material.transparent = true;

    var planeGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
    var plane = new THREE.Mesh( planeGeometry, material );
    this.sceneHUD.add( plane );
    //document.addEventListener('touchmove', onDocumentTouchMove, false);    
  }
*/
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
    var w = document.activeElement.clientWidth; //event.target.innerWidth
    var h = document.activeElement.clientHeight; //event.target.innerHeight

    this.environment.onWindowResize(w, h);   
    return true;
  }

  public render() {
    requestAnimationFrame(() => this.render());
    var delta = this.clock.getDelta();
    this.environment.onUpdate(delta);           
    
  }

}
