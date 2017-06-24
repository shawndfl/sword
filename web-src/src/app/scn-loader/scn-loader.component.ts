import { Component, OnInit, HostListener } from '@angular/core';
import { CameraComponent } from '../game-engine/camera.component';
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

  constructor() {
    this.mainTag = "mainGame";
  }

  ngOnInit() {
    this.init();
    this.render();
  }

  private BuildSampleModel(): void {   

      var model: DATA.Model = new DATA.Model();
      model.nodes = new Array<DATA.Node>();
      model.materials = new Array<DATA.Material>();

      var node: DATA.Node = new DATA.Node();
      node.name = "box01";
      node.matId = 0;
      node.scale = ([15, 20, 25]);
      node.translation = ([15, 20, 25]);

      var rot = new THREE.Quaternion();
      rot.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/4.0 );      
      node.rotation = ([rot.x, rot.y, rot.z, rot.w]);
      node.vertices = ([
       -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
      ]);

      node.tex1 = ([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,

        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
      ]);

      node.faces = ([
        0, 3, 1,  //front
        1, 3, 2,

        1, 2, 5,  //right
        5, 2, 6,

        5, 6, 7, //back
        4, 5, 7,

        4, 7, 3, //left
        0, 4, 3,

        2, 3, 7, //bottom
        6, 2, 7,

        4, 0, 5,  //top
        5, 0, 1

      ]);

      //create an animation clip for this node
      node.clip = new DATA.AnimationClip();      
      node.clip.name = "Move";
      node.clip.duration = 2.0;
      node.clip.tracks = new Array<DATA.KeyFrameTrack>();
      var track1 = new DATA.KeyFrameTrack();

      // add a track
      track1.name="box01.position";
      track1.times= ([0, 1, 2, 3]);
      track1.values=([
                      0, 20, 0, 
                      20, 20, 0,
                      40, 20, 0,
                      60, 20, 0,
                      ]);;      

      node.clip.tracks.push(track1);      

      model.nodes.push(node);
      var matId = model.nodes[0].matId;

      var material: DATA.Material = new DATA.Material();
      material.diffusedCol = ([1,1,0]);
      material.diffusedTex = 'assets/house.png';
      material.id = 0;

      model.materials.push(material);
      
      var color = model.materials[matId].diffusedCol;

      // DEBUG the json we created
      console.log(JSON.stringify(model));

      // Create the mesh
      var loader :LOADER.ModelLoader = new LOADER.ModelLoader();
      var mesh = loader.loadModel(model);      
      
      this.animate(mesh)
      // Add the mesh to the scene
      this.scene.add(mesh);          
  }

  public animate(mesh: THREE.Mesh): void
  {
      this.clock = new THREE.Clock();

      // TODO Load Animation 
      var times: number[] = ([0, 1, 2, 3]);
      var values: number[] = ([0, 20, 0, 
                              20, 20, 0,
                              40, 20, 0,
                              60, 20, 0,
                               ]);
      
      var tracks = ([new THREE.KeyframeTrack("box01.position", times, values, THREE.InterpolateLinear )]);
      var clip : THREE.AnimationClip = new THREE.AnimationClip("Move", -1, tracks);      

      this.mixer = new THREE.AnimationMixer(mesh);            
      var action: THREE.AnimationAction = this.mixer.clipAction(clip);

      action.setEffectiveTimeScale(-1);
      action.loop = true;
      action.setLoop(THREE.LoopPingPong, Infinity);
      action.play();      
  }

  public init() {

    this.scene = new THREE.Scene();
    this.camera = new CameraComponent();
   
    this.BuildSampleModel();      

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

    this.mixer.update( this.clock.getDelta() );

    this.renderer.render(this.scene, this.camera.camera);
  }

}
