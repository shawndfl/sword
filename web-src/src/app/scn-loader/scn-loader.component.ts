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

  model: LOADER.ModelLoader

  ready: boolean = false;


  constructor() {
    this.mainTag = "mainGame";
  }

  ngOnInit() {
    this.init();
    this.render();
  }

  private BuildSampleModel(scene: THREE.Scene): void {

    var modelData: DATA.Model = new DATA.Model();
    modelData.nodes = new Array<DATA.Node>();
    modelData.materials = new Array<DATA.Material>();

    var node: DATA.Node = new DATA.Node();
    node.name = "box01";
    node.matId = 0;
    node.scale = ([15, 20, 25]);
    node.translation = ([15, 20, 25]);

    var rot = new THREE.Quaternion();
    rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4.0);
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
    modelData.clip = new DATA.AnimationClip();
    var clip: DATA.AnimationClip = modelData.clip;

    clip.name = "Move";
    clip.duration = 3.0;
    clip.tracks = new Array<DATA.KeyFrameTrack>();

    // Make a track
    var track1 = new DATA.KeyFrameTrack();

    // add a track
    track1.name = "box01.position";
    track1.times = ([0, 1, 2, 3]);
    track1.values = ([
      0, 20, 0,
      20, 20, 0,
      40, 20, 0,
      70, 20, 50,
    ]);;

    clip.tracks.push(track1);

    modelData.nodes.push(node);
    var matId = modelData.nodes[0].matId;

    var material: DATA.Material = new DATA.Material();
    material.diffusedCol = ([1, 1, 0]);
    material.diffusedTex = 'assets/house.png';
    material.id = 0;

    modelData.materials.push(material);

    var color = modelData.materials[matId].diffusedCol;

    // DEBUG the json we created
    console.log(JSON.stringify(modelData));

    // Create the mesh
    this.model = new LOADER.ModelLoader();
    //var mesh = this.model.loadModel(modelData);      

    var mesh = this.model.loadModelJson("assets/test-model.json", function (mesh: THREE.Mesh) {
      // Add the mesh to the scene
      scene.add(mesh);
    });
  }

  public init() {

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new CameraComponent();

    this.BuildSampleModel(this.scene);

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
    this.model.update(this.clock.getDelta())

    this.renderer.render(this.scene, this.camera.camera);
  }

}
