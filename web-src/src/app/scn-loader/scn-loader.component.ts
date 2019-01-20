import { Component, OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import * as S from '../game-engine/system';
import * as G from '../game-engine/graphics';
import * as DATA from '../game-engine/data';
import { Vector3, log, Box3 } from 'three';


/**
 * This is the main container of the game.
 * Everything gets loaded and updated from here.
 * It also holds an instance of the main systems.
 */
export class Environment implements S.IEnvironment {

  /// THREE JS objects
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  //SYSTEMS
  private terrain: S.Terrain;
  private flyCamera: S.CameraComponent;
  private assets: S.Assets;
  private character: S.Character;
  private enemy: S.Enemy;
  private items: S.PowerUpManager;
  private skybox: S.Skybox;
  private collision: S.CollisionManager;
  private cell: Cell;

  //DATA
  private levelData: DATA.Level;

  // Listeners
  private components: Map<String, S.Component> = new Map<String, S.Component>();
  private inputMouseListeners: S.IInputMouse[] = [];
  private inputKeyboardListeners: S.IInputKeyboard[] = [];
  private windowResizeListeners: S.ISystemResize[] = [];
  private startQueue: S.Component[] = [];
  private initQueue: S.Component[] = [];

  ////////////////////////////////////////
  //   Life cycle state vars
  ////////////////////////////////////////
  /**
   * The state of the system
   */
  private _state: S.ComponentState = S.ComponentState.None;
  /**
   * This is the level loaded
   */
  private levelLoaded: boolean = false;
  /**
   * If the assets have been loaded
   */
  private assetsLoaded: boolean = false;

  /**
   * When the number of json files loaded equals
   * the items to load ready will be set to true.
   */
  public get ready() {
     return this.levelLoaded && this.assetsLoaded;
  }

  /**
   * Gets a component
   * @param name
   */
  public getComponent(name: string): S.Component {
     return this.components.get(name);
  }

  /**
   * Gets the dom Element. this can be used for subscribing 
   * to input events.
   */
  public get domElement(): HTMLCanvasElement {
     return this.renderer.domElement;
  }

  ////////////////////////////////////////
  //   IEnvironment implementation
  ////////////////////////////////////////
  registerKeyboard(keyboard: S.IInputKeyboard) {
     this.inputKeyboardListeners.push(keyboard);
  }
  registerMouse(mouse: S.IInputMouse) {
     this.inputMouseListeners.push(mouse);
  }
  registerComponent(component: S.Component) {
     this.initQueue.push(component);
     if (this.components.has(component.name))
        console.error("More than one component called: " + component.name);
     this.components.set(component.name, component);
  }
  registerWindowResize(component: S.ISystemResize) {
     this.windowResizeListeners.push(component);
  }
  registerCollidable(object: S.ICollidable) {
     this.collision.registerCollidable(object);
  }

  getAssets(): S.Assets {
     return this.assets;
  }
  getCharacter(): S.Character {
     return this.character;
  }
  getCamera(): THREE.PerspectiveCamera {
     return this.flyCamera.camera;
  }
  getData(): DATA.Level {
     return this.levelData;
  }
  getScene(): THREE.Scene {
     return this.scene;
  }
  getCollisionManager(): S.CollisionManager {
     return this.collision;
  }
  removeComponent(name: string) {
     var component = this.components.get(name);
     if (component) {
        component.destroy();
        this.components.delete(name);
        this.collision.removeComponent(name);
     }

  }

  ////////////////////////////////////////
  //   Life cycle events
  ////////////////////////////////////////

  /**
   * Creates the scene and does some initialize setup.
   * @param scene 
   */
  public initialize() {

     this.scene = new THREE.Scene();

     // rendering 
     this.renderer = this.renderer = new THREE.WebGLRenderer();
     this.renderer.setSize(window.innerWidth, window.innerHeight);
     this.renderer.autoClear = false;

     //Light
     var ambient = new THREE.AmbientLight(0x909090); // soft white light
     this.scene.add(ambient);

     this.cell = new Cell(this, "Cell1");
     this.character = new S.Character(this);
     this.enemy = new S.Enemy(this);
     this.skybox = new S.Skybox(this);
     this.items = new S.PowerUpManager(this);

     this.collision = new S.CollisionManager(this);

     // Setup the camera here so we can render something the first frame.        
     this.flyCamera = new S.CameraComponent(this);

     this.assets = new S.Assets(this);
     this.assets.loadLevelJson("../assets/environment.json", (assets: S.Assets) => {
        // set the random seed for everything
        G.random.start(this.assets.level.seed);

        this.terrain = new S.Terrain();
        this.terrain.buildFromData(this.assets.level.terrain);
        this.scene.add(this.terrain);

        //we are done loading the level
        this.levelLoaded = true;
     });

     this.assets.loadModelJson("../assets/models.json", (assets: S.Assets) => {
        this.assetsLoaded = true;
     });
  }

  /**
   * This is called when all the json files are loaded.
   */
  private start() {
     // map dependencies        
     this.flyCamera.target = this.character.model;
     this.skybox.setTarget(this.character.model);
     this._state = S.ComponentState.Start;
  }

  private update(delta: number) {

     this.components.forEach((value, index, array) => {
        value.update(delta);
     });
     this.renderer.render(this.scene, this.flyCamera.camera, null, true);
     //this.renderer.render(this.sceneHUD, this.cameraHUD, null, false);

  }

  public mouseOver(mouse: MouseEvent): void {
     this.inputMouseListeners.forEach((value, index, array) => {
        value.mouseOver(mouse);
     });
  }
  public mouseMove(mouse: MouseEvent): void {
     this.inputMouseListeners.forEach((value, index, array) => {
        value.mouseMove(mouse);
     });
  }
  public keyUp(key: KeyboardEvent): void {
     this.inputKeyboardListeners.forEach((value, index, array) => {
        value.keyUp(key);
     });
  }
  public keyDown(key: KeyboardEvent): void {
     this.inputKeyboardListeners.forEach((value, index, array) => {
        value.keyDown(key);
     });
  }
  public windowResize(width: number, height: number) {
     this.windowResizeListeners.forEach((value, index, array) => {
        value.windowResize(width, height);
     });
  }

  ////////////////////////////////////////
  //   callback events
  ////////////////////////////////////////
  public onUpdate(delta: number) {
     if (this.ready) {

        // Initialize components
        while (this.initQueue.length > 0) {
           var component = this.initQueue.pop();
           component.initialize()
           this.startQueue.push(component);
        }

        //Start any new components
        while (this.startQueue.length > 0) {
           this.startQueue.pop().start();
        }

        if (this._state != S.ComponentState.Start)
           this.start();

        this.update(delta);
     }
  }
  public onMouseOver(mouse: MouseEvent): void {
     if (this.ready)
        this.mouseOver(mouse);
  }
  public onMouseMove(mouse: MouseEvent): void {
     if (this.ready)
        this.mouseMove(mouse);
  }
  public onKeyUp(key: KeyboardEvent): void {
     if (this.ready)
        this.keyUp(key);
  }
  public onKeyDown(key: KeyboardEvent): void {
     if (this.ready)
        this.keyDown(key);
  }
  public onWindowResize(width: number, height: number) {
     this.renderer.setSize(width, height);
     if (this.ready)
        this.windowResize(width, height);

  }
}

export class Cell extends S.Component3D implements S.ICollidable {

  private _row;
  private _col;
  private _height;
  private _isPositionSet: boolean = false;
  private mesh: G.CubeMesh;
  private _bbox: Box3;

  public start() {
     
     var texturePath: string = "assets/environment.png"
     // Set material        
     var texture: THREE.Texture = new THREE.TextureLoader().load(texturePath);
     texture.wrapS = THREE.ClampToEdgeWrapping;
     texture.wrapT = THREE.ClampToEdgeWrapping;
     texture.magFilter = THREE.NearestFilter;
     texture.minFilter = THREE.NearestMipMapNearestFilter;

     var material = new THREE.MeshPhongMaterial();
     material.color = new THREE.Color(1.0, 1.0, 1.0);

     material.shininess = 100.0;
     material.specular = new THREE.Color(1.0, 1.0, 1.0);
     material.transparent = true;
     material.map = texture;
     material.wireframe = false;

     var geo: G.CubeGeometry = new G.CubeGeometry(
        [0, 0, 0],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1]
     );

     this.mesh = new G.CubeMesh(geo, material);
     this.mesh.name = this.name;
     this.mesh.position.set(0, 0, 0);
     this.mesh.scale.set(120, 120, 120);

     this.obj.add(this.mesh);
     this.e.getScene().add(this.obj);

     this._bbox = new THREE.Box3();

     this.e.registerCollidable(this);
  }

  public update(delta: number) {
     if (!this._isPositionSet) {

        var charPos: THREE.Vector3 = this.e.getCharacter().model.position;
        this.obj.position.set(charPos.x + 120, charPos.y + 60, charPos.z + 120);
        //this.mesh.position.set(charPos.x + 120, charPos.y + 60, charPos.z + 120);

        this._bbox.empty();
        this._bbox.expandByObject(this.mesh);
        this._bbox.max.add(this.obj.position);
        this._bbox.min.add(this.obj.position);
        this._isPositionSet = true;
     }
  }

  OnHit(other: S.Component3D) {

  }
  public getCollsionType(): S.CollsionType {
     return S.CollsionType.Wall;
  }
  getBBox(): THREE.Box3 {
     return this._bbox;
  }
  getComponent(): S.Component3D {
     return this;
  }
}

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
  
  environment: Environment;

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

    this.environment = new Environment();
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
