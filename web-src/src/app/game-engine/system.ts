
import * as THREE from 'three';
import * as DATA from './data';
import * as G from './graphics';
import { Vector3, log } from 'three';

enum ComponentState
{    
    None = 0x00,
    initializing = 0x01,
    initialize= 0x02,    
    Starting = 0x04,
    Start = 0x08,
    Destroy= 0x10,
}

/**
 * Interface for systems that care about the resize event. 
 * Like the camera component
 */
export interface ISystemResize {    
    windowResize(width: number, height: number);    
}

/**
 * Manages the mouse events
 */
export interface IInputMouse  {
    mouseOver(mouse: MouseEvent): void;
    mouseMove(mouse: MouseEvent): void;
}

/**
 * Handles the keyboard events
 */
export interface IInputKeyboard {
    keyUp(key: KeyboardEvent): void;
    keyDown(key: KeyboardEvent): void;   
}

/**
 * The main character interface. 
 */
export interface ICharacter extends ISystemBehavior, IInputKeyboard {        
    getObj() : THREE.Object3D;
}

/**
 * The enviroment interface. 
 */
export interface IEnvironment {
    registerKeyboard(keyboard: IInputKeyboard);
    registerMouse(mouse: IInputMouse);
    registerSystem(system: ISystemBehavior);
    registionWindowResize(component: ISystemResize);

    /**
     *  Gets the assets which is the models.
     */
    getAssets() : Assets;

     /**
     * The character
     */
    getCharacter(): Character            

    /**
     * Gets the camera
     */
    getCamera(): THREE.PerspectiveCamera        

    /**
     * Gets the meta data for a level
     */
    getData(): DATA.Level

    /**
     * Gets the scene
     */
    getScene(): THREE.Scene
}

/**
 * Manages the system events
 */
export interface ISystemBehavior {
    initialize();
    start();
    update(delta: number): void;
    destroy();            
}

/**
 * The base for all components
 */
export class Component implements ISystemBehavior
{    
    private _state: ComponentState;

    private _e: IEnvironment;

    public get e() : IEnvironment
    {
        return this._e;
    }

    /**
     * Sets the state of this component.
     * @param value 
     */
    protected setState(value : ComponentState)
    {
        this._state = value;
    }

    public getState() : ComponentState
    {
        return this._state;
    }

    public get assets() : Assets
    {
        return this._e.getAssets();
    }

    public constructor(e: IEnvironment){
        this._e = e;
        this._state = ComponentState.None;
    }

    initialize() {
        
    }
    start() {
        
    }
    update(delta: number): void {
        
    }
    destroy() {
        
    }
}

/**
 * The base for all 3d components
 */
export class Component3D extends Component
{
    private _obj: THREE.Object3D;    
   
    public get obj() : THREE.Object3D
    {
        return this._obj;
    }

    public constructor(e: IEnvironment){
        super(e);
        this._obj = new THREE.Object3D();
    }    
}

/**
 * This is the main container of the game.
 * Everything gets loaded and updated from here.
 * It also holds an instance of the main systems.
 */
export class Environment implements IEnvironment {   
        
    /// THREE JS objects
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;    

    //SYSTEMS
    private terrain: G.Terrain;
    private flyCamera: CameraComponent;
    private assets: Assets;
    private character: Character;
    private items: PowerUpManager;    
    private skybox: Skybox;

    //DATA
    private levelData: DATA.Level;

    // Listeners
    private systems: ISystemBehavior[] = [];    
    private inputMouseListeners: IInputMouse[] = [];    
    private inputKeyboardListeners: IInputKeyboard[] = [];        
    private windowResizeListeners: ISystemResize[] = [];        
    
    ////////////////////////////////////////
    //   Life cycle state vars
    ////////////////////////////////////////
    /**
     * The state of the system
     */
    private _state: ComponentState = ComponentState.None;
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
     * Gets the dom Element. this can be used for subscribing 
     * to input events.
     */
    public get domElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    ////////////////////////////////////////
    //   IEnvironment implementation
    ////////////////////////////////////////
    registerKeyboard(keyboard: IInputKeyboard) {
        this.inputKeyboardListeners.push(keyboard);
    }
    registerMouse(mouse: IInputMouse) {
        this.inputMouseListeners.push(mouse);
    }
    registerSystem(system: ISystemBehavior) {
        switch(this._state)
        {            
            case ComponentState.initializing:
            system.initialize();
            break;            
            case ComponentState.initialize:
            system.initialize();
            break;
            case ComponentState.Starting:
            system.initialize();
            system.start();
            break;
            case ComponentState.Start:
            system.initialize();
            system.start();
            break;
            case ComponentState.Destroy:
            break;
            default:
                console.error("Unkown state " + this._state);
            break;            
        }        
        this.systems.push(system);
    }    
    registionWindowResize(component: ISystemResize) {
        this.windowResizeListeners.push(component);
    }
    getAssets(): Assets {
        return this.assets;
    }    
    getCharacter(): Character {
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

    ////////////////////////////////////////
    //   Life cycle events
    ////////////////////////////////////////

    /**
     * Creates the scene and does some initialize setup.
     * @param scene 
     */
    public initialize() {
        this._state = ComponentState.initializing;

        this.scene = new THREE.Scene();
        
        // rendering 
        this.renderer = this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.autoClear = false;

        //Light
        var ambient = new THREE.AmbientLight(0x909090); // soft white light
        this.scene.add(ambient);

        this.character = new Character(this);        
        this.skybox = new Skybox(this);        
        this.items = new PowerUpManager(this);        

        // Setup the camera here so we can render something the first frame.
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.flyCamera = new CameraComponent(this, camera);       

        this.systems.forEach((value, index, array) => {
            value.initialize();
        });
        this._state = ComponentState.initialize;
        
        this.loadLevelJson(this.scene, "../assets/environment.json");

        this.assets = new Assets(this);
        this.assets.loadModelJson("../assets/models.json", (assets: Assets) => {
            this.assetsLoaded = true;
        });

        this._state = ComponentState.initialize;
    }   

    /**
      * Loads the meshes, animations, and textures from a json file then adds the meshes to the THREE scene    
      */
     public loadLevelJson(scene: THREE.Scene, pathToJson: string): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var levelData: DATA.Level = JSON.parse(json);

            // set the random seed for everything
            G.random.start(levelData.seed);
            
            this.terrain = new G.Terrain();
            this.terrain.buildFromData(levelData.terrain);
            scene.add(this.terrain);
            
            //we are done loading the level
            this.levelLoaded = true;
        });
    }

    /**
     * This is called when all the json files are loaded.
     */
    private start() {
        this._state = ComponentState.Starting;

        // map dependencies        
        this.flyCamera.target = this.character.model;
        this.skybox.setTarget(this.character.model);                

        this.systems.forEach((value, index, array) => {
            value.start();
        });        

        this._state = ComponentState.Start;
    }

    private update(delta: number) {
    
        this.systems.forEach((value, index, array) => {
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
            if (this._state != ComponentState.Start)
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

export class CameraComponent extends Component implements ISystemResize, IInputMouse, IInputKeyboard 
{
  private _camera: THREE.PerspectiveCamera;
  private angle: THREE.Vector2 = new THREE.Vector2(0, 0);
  private lastPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  private readonly TwoPi: number = Math.PI * 2.0;

  // Target following variables 
  private targetObject: THREE.Object3D;
  private lastTargetPos: THREE.Vector3;
  private fullSpeedCount: number = 0;
  private closeEnough: boolean = false;
  private freeCamera = false;
  
  /**
   * Set the target for the camera to follow.
   * @param target 
   */
  public set target(target: THREE.Object3D) {
    this.targetObject = target;
    this.lastTargetPos = this.targetObject.getWorldPosition();
  }

  /**
   * Gets the target
   */
  public get target(): THREE.Object3D {
    return this.targetObject;
  }

  public get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }
  /**
   * Scale the camera's rotation speed
   */
  public angleScale: number = .005;

  /**
   * Scale the camera's movement speed
   */
  public moveScale: number = 5;

  /**
   * The camera's position
   */
  public position: THREE.Vector3 = new THREE.Vector3(0, 100, 200);

  public constructor(e: IEnvironment, camera: THREE.PerspectiveCamera) {
    super(e);
    this._camera = camera;
    this.updateCamera();

    //register events
    this.e.registionWindowResize(this);
    this.e.registerSystem(this);
    this.e.registerMouse(this);
    this.e.registerKeyboard(this);
  }

  debug(): void {

    var look: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    var right: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    this.camera.matrix.extractBasis(right, up, look);
    var te = this.camera.matrix.elements;
    var position = new THREE.Vector3(te[12], te[13], te[14]);

    console.log("right: " + right.x + ", " + right.y + ", " + right.z);
    console.log("up: " + up.x + ", " + up.y + ", " + up.z);
    console.log("look: " + look.x + ", " + look.y + ", " + look.z);
    console.log("position: " + position.x + ", " + position.y + ", " + position.z);
  }

  private lookatForCamera(xAxis: THREE.Vector3, yAxis: THREE.Vector3, zAxis: THREE.Vector3, eye: THREE.Vector3): void {
    this.position = eye;
    this.camera.matrix.makeBasis(xAxis, yAxis, zAxis);
    this.camera.matrix.setPosition(eye);
    this.camera.matrixAutoUpdate = false;
    this.camera.updateMatrixWorld(true);
  }

  initialize() { /*nop*/ }
  start() { /*nop*/ }

  mouseOver(mouse: MouseEvent): void {
    this.lastPosition.x = mouse.x;
    this.lastPosition.y = mouse.y;
  }

  /**
   * Move the camera using the mouse. While the left button is 
   * down the camera is in free mode and can use the wasd keys.
   * It will not return out of free mode until 'q' is hit
   * 
   * @param mouse 
   */
  mouseMove(mouse: MouseEvent): void {
    
    if (mouse.buttons === 1) {
      var deltaX = -(mouse.x - this.lastPosition.x) * this.angleScale;
      var deltaY = -(mouse.y - this.lastPosition.y) * this.angleScale;

      this.angle.x += deltaX;
      this.angle.y += deltaY;

      this.freeCamera = true;

      this.updateCamera();
    }    

    this.lastPosition.x = mouse.x;
    this.lastPosition.y = mouse.y;

  }

  keyDown(key: KeyboardEvent): void {
    var direction: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    switch (key.keyCode) {
      case 87: //W       
        direction.add(new THREE.Vector3(0, 0, -1));
        break;
      case 65: //A
        direction.add(new THREE.Vector3(-1, 0, 0));
        break;
      case 68: //D
        direction.add(new THREE.Vector3(1, 0, 0));
        break;
      case 83: //S
        direction.add(new THREE.Vector3(0, 0, 1));
        break;
      case 69: //E
        direction.add(new THREE.Vector3(0, 1, 0));
        break;
      case 88: //X
        direction.add(new THREE.Vector3(0, -1, 0));
        break;
      case 81: //Q
        this.freeCamera = false;
        break;      
    }

    if (direction.length() > 0) {
      direction.multiplyScalar(this.moveScale);
      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
      var right: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

      this.camera.matrix.extractBasis(right, up, look);

      look.multiplyScalar(direction.z);
      up.multiplyScalar(direction.y);
      right.multiplyScalar(direction.x);

      this.position.add(right).add(up).add(look);

      this.updateCamera();
    }
  }

  keyUp(key: KeyboardEvent): void {
   //NOP
  }

  update(delta: number) {
    if (this.targetObject == null)
        return;

    if (this.freeCamera)
      return;

    var followSpeed = 5.0;
    var distanceMax = 360.0;
    var distanceMin = 360.0;
    var height = 120;
    var closeEnoughLimit = 10.0;
    var maxTargetMovement = 1;

    //how many frames has the target been moving at fullspeed
    var maxFullSpeedCount = 5;

    var heightVector = new THREE.Vector3(0, height, 0);
    var targetOffset = new THREE.Vector3(0, 100, 0);

    var targetPos = this.targetObject.getWorldPosition();
    targetPos.add(targetOffset);

    var targetDirection = this.targetObject.getWorldDirection();
    var idealCamPos = targetDirection.multiplyScalar(-distanceMin)
      .add(targetPos)
      .add(heightVector);

    var velocity = new THREE.Vector3().subVectors(idealCamPos, this.position);
    var speed = followSpeed;
    velocity.normalize();
    velocity.multiplyScalar(followSpeed);
    var newPos = new THREE.Vector3().addVectors(this.position, velocity);
    var currentDist = newPos.distanceTo(idealCamPos);

    //is the target moving a lot?
    var targetMovementChange = this.targetObject.getWorldPosition().distanceTo(this.lastTargetPos);
    if (targetMovementChange > maxTargetMovement) {
      this.fullSpeedCount++;
    }
    else {
      this.fullSpeedCount = 0;
    }

    //If the target is moving at full speed for a while 
    //don't animate just lock on to the target
    if (this.fullSpeedCount > maxFullSpeedCount && this.closeEnough) {
      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
      var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

      look = look.subVectors(this.position, targetPos);
      look.normalize();
      right.crossVectors(up, look);
      right.normalize();
      up.crossVectors(look, right);
      up.normalize();

      this.lookatForCamera(right, up, look, idealCamPos);

      //not moving at full speed animate the camera
    } else if (currentDist > closeEnoughLimit) {

      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
      var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

      look = look.subVectors(this.position, targetPos);
      look.normalize();
      right.crossVectors(up, look);
      right.normalize();
      up.crossVectors(look, right);
      up.normalize();

      this.lookatForCamera(right, up, look, newPos);
      this.closeEnough = false;

    } else {
      this.closeEnough = true;
    }

    this.lastTargetPos = this.targetObject.getWorldPosition();

  }

  public windowResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }  

  private updateCamera(): void {

    if (this.angle.x > this.TwoPi)
      this.angle.x += -this.TwoPi;

    if (this.angle.x < -this.TwoPi)
      this.angle.x += this.TwoPi;

    if (this.angle.y > this.TwoPi)
      this.angle.y += -this.TwoPi;

    if (this.angle.y < -this.TwoPi)
      this.angle.y += this.TwoPi;

    var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

    look.applyAxisAngle(up, this.angle.x);
    right.crossVectors(up, look);
    right.normalize();

    up = up.applyAxisAngle(right, this.angle.y);
    up.normalize();

    look.crossVectors(right, up);
    look.normalize();

    this.lookatForCamera(right, up, look, this.position);
  }

}

export class HUD extends Component{
     
}

/**
 * This class is used to load all the models from a json file and store them in a
 * map. The models here can be passed into G.Models.Initialize().
 * 
 * An instance of this is created by Environment.
 */
export class Assets extends Component {

    public models: Map<string, DATA.Model> = new Map<string, DATA.Model>();    

    public loadModelJson(pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var models: DATA.Model[] = JSON.parse(json);

            //store the models in a map
            models.forEach((value: DATA.Model, index: number, array: DATA.Model[]) => {
                this.models.set(value.name, value);
            });

            onLoad(this);
        }, onProgress, onError);
    }
}

/**
 * This is the manager of all the items the user can collect
 */
export class PowerUpManager extends Component {

    private _items: PowerUp[] = [];  

    public get items() {
        return this._items;
    }

    public constructor(e: IEnvironment)
    {
        super(e);
        e.registerSystem(this);
    }

    public initialize() {
        //create 10 items
        for (var i = 0; i < 100; i++) {
            this._items.push(new PowerUp(this.e));
        }
    }

    public start() {                
        this._items.forEach((value, index, array) => {        
            value.Positiion.x = (G.random.next() * 5000) - 2000;
            value.Positiion.z = (G.random.next() * 5000) - 2000;
        });        
    }

    public update(delta: number): void {
        
    }   
    public windowResize(width: number, height: number) {/*nop*/ }
    public characterMove(character: Character) {
        var hitItems = [];
        this._items.forEach((value, index, array) => {
            value.characterMove(character);
            if (value.hit) {
                hitItems.push(index);

                //remove from scene                
                value.destroy();
            }

        });

        //remove from items
        hitItems.forEach(element => {
            this._items.slice(element, 1);
        });
    }
}
/**
 * This is a power up a character can collect.
 */
export class PowerUp extends Component3D {

    private _model: G.Model;
    private _bBox;
    private _collisionHelper: THREE.BoxHelper;
    private _hit: boolean = false;
    private _scene;
    private _position : Vector3;

    public constructor(e: IEnvironment){
        super(e);
        e.registerSystem(this);

        this._position = new Vector3(0,0,0);
    }       

    public get Positiion(): Vector3
    {        
        return this._position;
    }

    public get hit() {
        return this._hit;
    }   

    public initialize() {
        this._model = new G.Model();
     }

    public start() {        
        
        var model: DATA.Model = this.e.getAssets().models.get("powerup");
        this._model.Initialize(model);

        var action: THREE.AnimationAction = this._model.getActionFromClip("idle");
        action.setEffectiveTimeScale(0.4);
        action.startAt(G.random.next());
        action.loop = true;                   
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();

        this._collisionHelper = new THREE.BoxHelper(this._model);
        //this._scene.add(this._collisionHelper);
        this._bBox = new THREE.Box3();
        this._bBox.expandByObject(this._model); 
        this.obj.add(this._model);
        this.obj.add(this._collisionHelper);   
        
        this.e.getScene().add(this.obj);
    }

    public update(delta: number) {      
        
        // Set the position in case it changed
        this._model.position.set(this._position.x, this._position.y, this._position.z);  

        this._model.update(delta);
        
    }
        
    public characterMove(character: Character) {
        this._collisionHelper.update();
        this._bBox.makeEmpty();
        this._bBox.expandByObject(this._model);
        if (character.bBox.intersectsBox(this._bBox)) {
            this._hit = true;
        }
    }

    public destroy() {
        this._scene.remove(this._collisionHelper);
        this.e.getScene().remove(this._model);  
    }
}

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character extends Component3D implements IInputKeyboard {
        
    private _model: G.Model;
    private walkAction: THREE.AnimationAction;
    private attackAction: THREE.AnimationAction;
    private rotateAngel: number = 0;
    private moveSpeed: number = 0;
    private speed: number = 5.0;
    private rotateSpeed: number = .05;
    private attackReady: boolean = false;
    private attacking: boolean = false;
    private _box: THREE.Box3;    
    private _collisionHelper: THREE.BoxHelper;

    public get model() {
        return this._model;
    }
    public get bBox(): THREE.Box3 {
        return this._box;
    }    

    public constructor(e: IEnvironment)
    {
        super(e);
        this.e.registerKeyboard(this);
        this.e.registerSystem(this);
    }

    ////////////////////////////////////////
    //   Life cycle events
    ////////////////////////////////////////
    public initialize() {
        this._model = new G.Model();
        this._box = new THREE.Box3();

    }

    public start() {        
        var model: DATA.Model = this.e.getAssets().models.get("character");
        this.model.Initialize(model);

        //run blink animation
        var action: THREE.AnimationAction = this.model.getActionFromClip('blink');
        action.setEffectiveTimeScale(1.0);
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();

        this._collisionHelper = new THREE.BoxHelper(this.model);
        
        this.obj.add(this.model);
        this.obj.add(this._collisionHelper);

        this.e.getScene().add(this.obj);
    }

    public update(delta: number) {
        this.model.update(delta);
        this.move();
    }

    public keyDown(key: KeyboardEvent): void {
        switch (key.keyCode) {
            case 38: //UP
                this.moveSpeed = this.speed;
                break;
            case 37: //LEFT                
                this.rotateAngel = this.rotateSpeed;
                break;
            case 39: //RIGHT                
                this.rotateAngel = -this.rotateSpeed;
                break;
            case 40: //DOWN                
                this.moveSpeed = -this.speed;
                break;
            case 32: //SPACE BAR
                this.attackReady = true;
                break;
        }
    }

    public keyUp(key: KeyboardEvent): void {
        switch (key.keyCode) {
            case 38: //UP
                this.stop();
                this.moveSpeed = 0.0;
                break;
            case 37: //LEFT                
                this.stop();
                this.rotateAngel = 0;
                break;
            case 39: //RIGHT
                this.stop();
                this.rotateAngel = 0;
                break;
            case 40: //DOWN        
                this.stop();
                this.moveSpeed = 0.0;
                break;
        }
    }   

    ////////////////////////////////////////
    //   private functions
    ////////////////////////////////////////
    private move() {
        var positionDirty = false;
        // rotate
        if (this.rotateAngel != 0) {
            var axis: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
            this.model.rotateOnAxis(axis, this.rotateAngel);
            this.walk();
            positionDirty = true;
        }

        // move
        if (this.moveSpeed != 0) {
            var direction: THREE.Vector3 = new THREE.Vector3();
            var up: THREE.Vector3 = new THREE.Vector3();
            var right: THREE.Vector3 = new THREE.Vector3();
            this.model.matrix.extractBasis(right, up, direction);

            var current: THREE.Vector3 = this.model.position;
            var newPos = current.addVectors(current, direction.multiplyScalar(this.moveSpeed));
            this.model.position.set(newPos.x, newPos.y, newPos.z);
            this.walk();
            positionDirty = true;
        }

        // attack
        if (this.attackReady && !this.attacking) {
            this.attackAction = this.model.getActionFromClip("attack");
            this.attackAction.setEffectiveTimeScale(3.5);
            this.attackAction.loop = false;
            this.attackAction.setLoop(THREE.LoopOnce, 1);
            this.attackAction.reset();
            this.attackAction.play();
            this.attacking = true;
            this.attackReady = false;
            positionDirty = true;
        }

        // reset attack
        if (this.attackAction != undefined && this.attacking && !this.attackAction.enabled) {
            this.attacking = false;
        }

        // raise move event
        if (positionDirty) {
            this._box.makeEmpty();
            this._box.expandByObject(this.model);
            this._collisionHelper.update();
            //this.environment.onCharacterMove();
        }
    }

    private walk() {
        if (this.walkAction == undefined) {
            this.walkAction = this.model.getActionFromClip("walk");
            this.walkAction.setEffectiveTimeScale(2.5);
            this.walkAction.loop = true;
            this.walkAction.setLoop(THREE.LoopRepeat, Infinity);
        }
        if (!this.walkAction.isRunning()) {
            this.walkAction.play();
        }
    }

    private stop() {
        if (this.walkAction != undefined && this.walkAction.isRunning) {
            this.walkAction.stop();
        }
    }

}

/**
 * This will render the skybox for the environment. This class will expect
 * an asset called environment.png to exists
 */
export class Skybox extends Component3D implements ISystemBehavior {
    private target: THREE.Object3D;

    public constructor(e : IEnvironment)
    {
        super(e);
        e.registerSystem(this);
    }

    public setTarget(target:  THREE.Object3D) {
        this.target = target;
    }

    initialize() {
    }

    start() {
        // Set material
        var textue = "assets/environment.png";
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.MirroredRepeatWrapping;
        diffused.wrapT = THREE.MirroredRepeatWrapping;
        diffused.magFilter = THREE.NearestMipMapNearestFilter;
        diffused.minFilter = THREE.NearestMipMapNearestFilter;

        var material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(1.0, 1.0, 1.0);

        material.shininess = 100.0;
        material.specular = new THREE.Color(1.0, 1.0, 1.0);
        material.transparent = true;
        material.map = diffused;
        material.wireframe = false;
        material.depthWrite = false;
        var geo = new G.GeoBuilder();
        geo.offset(0, 0, 0).faceIn().nx(0, 2).px(0, 2).ny(0, 1).py(0, 3).nz(0, 2).pz(0, 2);

        var mesh = new THREE.Mesh(geo.build(), material);
        mesh.scale.set(7000, 1000, 7000);
        mesh.position.set(0, 400, 0);

        this.obj.add(mesh);

        this.e.getScene().add(this.obj);
    }

    update(delta: number): void {
        //move the box around the character
        var pos = this.target.position;
        this.obj.position.set(pos.x, pos.y, pos.z);
    }    
}
