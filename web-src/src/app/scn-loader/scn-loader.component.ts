import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component';
import { CharacterGraphics } from '../game-engine/character';
import * as DATA from '../game-engine/data';
import * as LOADER from '../game-engine/model.loader';
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

  mixer: THREE.AnimationMixer;
  clock: THREE.Clock;

  model: LOADER.ModelLoader

  ready: boolean = false;

  light1 : THREE.PointLight;
  light2 : THREE.PointLight;

  character: CharacterGraphics;

  constructor() {
    this.mainTag = "mainGame";
  }

  ngOnInit() {
    this.init();
    this.render();
  }

  private BuildSampleModel(scene: THREE.Scene): void {   

    // Create the mesh
    this.model = new LOADER.ModelLoader();    

    var mesh = this.model.loadModelJson("assets/Character.json", function (mesh: THREE.Mesh) {
      //mesh.rotation.y = Math.PI/2.0;
      // Add the mesh to the scene
      scene.add(mesh);
    });
  }

  public init() {

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new CameraComponent();
        
    this.character = new CharacterGraphics();
    this.character.buildCharacter(this.scene);    

    var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.scene.add( ambient );

    var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

    this.light1 = new THREE.PointLight( 0xffffff, .5, 10 );		
    this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
    this.light1.position.x = 40;
    this.light1.position.y = 40;
    this.light1.position.x = 40;
		this.scene.add( this.light1 );

    this.light2 = new THREE.PointLight( 0xffffff, .5, 10 );
    this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffff00 } ) ) );		
    this.light2.position.x = -40;
    this.light2.position.y = -40;
    this.light2.position.x = -40;    
		this.scene.add( this.light2 );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById(this.mainTag).appendChild(this.renderer.domElement);

    var gridHelper = new THREE.GridHelper(1000, 100, 0x0000ff, 0x808080);
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
    //this.model.update(this.clock.getDelta())
    this.character.update(this.clock.getDelta());

    this.renderer.render(this.scene, this.camera.camera);

    var time = Date.now() * 0.0005;

    this.light1.position.x = Math.sin( time * 0.7 ) * 50 + 20;
		this.light1.position.y = 30;//Math.cos( time * 0.5 ) * 70 + 20;
		this.light1.position.z = Math.cos( time * 0.3 ) * 70 + 20;
		this.light2.position.x = Math.cos( time * 0.3 ) * 70 + 20;
		this.light2.position.y = Math.sin( time * 0.5 ) * 70 + 20;
		this.light2.position.z = Math.sin( time * 0.7 ) * 70 + 20;


  }

}
