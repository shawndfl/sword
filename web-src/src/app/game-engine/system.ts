
import * as THREE from 'three';
import * as DATA from './data';
import * as G from './graphics';
import { Vector3, log } from 'three';
import { getComponent } from '../../../node_modules/@angular/core/src/linker/component_factory_resolver';

/**
 * The state a componet can be in
 */
export enum ComponentState {
    None = 0x00,
    Start = 0x02,
    Destroy = 0x04,
}

/**
 * Interface for components that can collide with others
 */
export interface ICollidable {
    OnHit(other: Component3D);
    getBBox(): THREE.Box3;
    getComponent(): Component3D;
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
export interface IInputMouse {
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
    getObj(): THREE.Object3D;
}

/**
 * The enviroment interface. 
 */
export interface IEnvironment {
    registerKeyboard(keyboard: IInputKeyboard);
    registerMouse(mouse: IInputMouse);
    registerComponent(system: ISystemBehavior);
    registerWindowResize(component: ISystemResize);
    registerCollidable(collidable: ICollidable);

    /**
     *  Gets the assets which is the models.
     */
    getAssets(): Assets;

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

    /**
     * Gets a component
     * @param name 
     */
    getComponent(name: string): Component

    /**
     * Gets the collision manager
     */
    getCollisionManager(): CollisionManager;

    /**
     * Removes a component from all systems
     * @param component 
     */
    removeComponent(name: string);
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
export abstract class Component implements ISystemBehavior {
    private _state: ComponentState;
    private _name: string;
    private _e: IEnvironment;

    public get e(): IEnvironment {
        return this._e;
    }

    /**
     * Gets the name of the component.
     */
    public get name(): string {
        return this._name;
    }

    public abstract get obj(): THREE.Object3D;

    /**
     * Sets the state of this component.
     * @param value 
     */
    protected setState(value: ComponentState) {
        this._state = value;
    }

    public getState(): ComponentState {
        return this._state;
    }

    public get assets(): Assets {
        return this._e.getAssets();
    }

    public constructor(e: IEnvironment, name: string) {
        this._e = e;
        this._state = ComponentState.None;
        this._name = name;

        //Register this component
        e.registerComponent(this);
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
export class Component3D extends Component {
    private _obj: THREE.Object3D;

    public get obj(): THREE.Object3D {
        return this._obj;
    }

    public constructor(e: IEnvironment, name: string) {
        super(e, name);
        this._obj = new THREE.Object3D();
    }
}


/**
 * Collision manager handles all collisions in the game.
 * First an object must register with the system then
 * events are raised on update
 */
export class CollisionManager extends Component {

    private collidable: ICollidable[] = [];
    private haveMoved: ICollidable[] = [];

    public registerCollidable(obj: ICollidable) {
        this.collidable.push(obj);
    }

    public EnqueueDirty(obj: ICollidable) {
        this.haveMoved.push(obj);
    }

    public constructor(e: IEnvironment) {
        super(e, "CollisionManager");
    }

    public get obj(): THREE.Object3D {
        throw new Error("No Object3D in this class.");
    }
    public removeComponent(name: string) {
        for (var i: number = 0; i < this.collidable.length; i++) {
            if (this.collidable[i].getComponent().name == name) {
                this.collidable.splice(i, 1);
            }
        }
    }
    update(delta: number) {
        // check everything that has moved
        while (this.haveMoved.length > 0) {
            var subject = this.haveMoved.pop();
            // against everything else
            this.collidable.forEach(target => {
                if (target != subject) {
                    if (target.getBBox().intersectsBox(subject.getBBox())) {
                        subject.OnHit(target.getComponent());
                        target.OnHit(subject.getComponent());
                    }
                }
            });
        }
    }
}

export class Cell extends Component3D {

    private _row;
    private _col;
    private _height;
    private _isPositionSet: boolean = false;
    private mesh: G.CubeMesh;

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
        this.mesh.position.set(60, 60, 60);
        this.mesh.scale.set(120, 120, 120);

        this.obj.add(this.mesh);
        this.e.getScene().add(this.obj);
    }

    public update(delta: number) {
        if (!this._isPositionSet) {
            var charPos: THREE.Vector3 = this.e.getCharacter().model.position;
            this.mesh.position.set(charPos.x + 60, charPos.y + 60, charPos.z + 60);
            this._isPositionSet = true;
        }
    }
}

export class CameraComponent extends Component implements ISystemResize, IInputMouse, IInputKeyboard {
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
    private targetOffset = new THREE.Vector3(0, 100, 0);
    private followSpeed = 5.0;
    private distanceMax = 360.0;
    private distanceMin = 360.0;
    private height = 120;
    private closeEnoughLimit = 10.0;
    private maxTargetMovement = 1;

    /**
     * Set the target for the camera to follow.
     * @param target 
     */
    public set target(target: THREE.Object3D) {
        this.targetObject = target;
        this.lastTargetPos = this.targetObject.getWorldPosition();
        this.position = this.target.getWorldPosition();
    }

    public get obj(): THREE.Object3D {
        throw new Error("No Object3D in this class.");
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

    public constructor(e: IEnvironment) {
        super(e, "FlyCamera");
        this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
        this.updateCamera();

        //register events
        this.e.registerWindowResize(this);
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

    start() {
        this.target = this.e.getComponent("Character").obj;
    }

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

        if (mouse.buttons === 1 && this.freeCamera) {
            var deltaX = -(mouse.x - this.lastPosition.x) * this.angleScale;
            var deltaY = -(mouse.y - this.lastPosition.y) * this.angleScale;

            this.angle.x += deltaX;
            this.angle.y += deltaY;

            //this.freeCamera = true;            
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
        switch (key.keyCode) {
            case 81: //Q
                this.freeCamera = !this.freeCamera;
                break;
        }
    }

    update(delta: number) {
        if (this.targetObject == null)
            return;

        if (this.freeCamera)
            return;



        //how many frames has the target been moving at fullspeed
        var maxFullSpeedCount = 5;

        var heightVector = new THREE.Vector3(0, this.height, 0);

        var targetPos = this.targetObject.getWorldPosition();
        targetPos.add(this.targetOffset);

        var targetDirection = this.targetObject.getWorldDirection();
        var idealCamPos = targetDirection.multiplyScalar(-this.distanceMin)
            .add(targetPos)
            .add(heightVector);

        var velocity = new THREE.Vector3().subVectors(idealCamPos, this.position);
        var speed = this.followSpeed;
        velocity.normalize();
        velocity.multiplyScalar(this.followSpeed);
        var newPos = new THREE.Vector3().addVectors(this.position, velocity);
        var currentDist = newPos.distanceTo(idealCamPos);

        //is the target moving a lot?
        var targetMovementChange = this.targetObject.getWorldPosition().distanceTo(this.lastTargetPos);
        if (targetMovementChange > this.maxTargetMovement) {
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
        } else if (currentDist > this.closeEnoughLimit) {

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
        if (this.targetObject) {
            var targetPos = this.targetObject.getWorldPosition();
            targetPos.add(this.targetOffset);
            look = look.subVectors(this.position, targetPos);
            look.normalize();
        }

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

    private lookAtTarget(target: Vector3): void {

        var look: THREE.Vector3 = this.position.sub(target);
        var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
        var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

        right.crossVectors(up, look);
        right.normalize();
        up.normalize();
        look.crossVectors(right, up);
        look.normalize();

        this.lookatForCamera(right, up, look, this.position);
    }

}

export class HUD extends Component {

    public get obj(): THREE.Object3D {
        throw new Error("No Object3D in this class.");
    }
}

/**
 * This class is used to load all the models from a json file and store them in a
 * map. The models here can be passed into G.Models.Initialize().
 * 
 * An instance of this is created by Environment.
 */
export class Assets extends Component {

    private _models: Map<string, DATA.Model> = new Map<string, DATA.Model>();
    private _levelData: DATA.Level;
    private _modelsLoaded: boolean = false;
    private _levelLoaded: boolean = false;


    /**
     * If the assets are ready to be used.
     */
    public get ready(): boolean {
        return this._modelsLoaded && this._levelLoaded;
    }

    /**
     * Gets the models
     */
    public get models(): Map<string, DATA.Model> {
        if (this._modelsLoaded)
            return this._models;
        else
            return null;
    }
    /**
     * Gets the level data. 
     */
    public get level(): DATA.Level {
        if (this._levelLoaded)
            return this._levelData;
        else
            return null;
    }

    public constructor(e: IEnvironment) {
        super(e, "AssetManager");
    }

    public get obj(): THREE.Object3D {
        throw new Error("No Object3D in this class.");
    }

    /**
      * Loads the meshes, animations, and textures from a json file then adds the meshes to the THREE scene    
      */
    public loadLevelJson(pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            this._levelData = JSON.parse(json);
            this._levelLoaded = true;
            onLoad(this);
        });
    }

    /**
     * Loads the models
     * @param pathToJson 
     * @param onLoad 
     * @param onProgress 
     * @param onError 
     */
    public loadModelJson(pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var models: DATA.Model[] = JSON.parse(json);
            this._modelsLoaded = true;

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

    public constructor(e: IEnvironment) {
        super(e, "PowerUpManager");
    }

    public get obj(): THREE.Object3D {
        throw new Error("No Object3D in this class.");
    }

    public initialize() {
        //create 10 items
        for (var i = 0; i < this.assets.level.itemCount; i++) {
            this._items.push(new PowerUp(this.e, "PowerUp" + i));
        }
    }

    public start() {
        this._items.forEach((value, index, array) => {
            var maxX = this.assets.level.terrain.rows * this.assets.level.terrain.cellSize;
            var maxZ = this.assets.level.terrain.columns * this.assets.level.terrain.cellSize;
            value.Positiion.x = (G.random.next() * maxX);
            value.Positiion.z = (G.random.next() * maxZ);
        });
    }

    public update(delta: number): void {
        var hitItems = [];
        this._items.forEach((value, index, array) => {
            if (value.hit) {
                hitItems.push(index);

                //remove from scene                
                this.e.removeComponent(value.name);
            }

        });

        //remove from items
        hitItems.forEach(element => {
            this._items.slice(element, 1);
        });
    }
    public windowResize(width: number, height: number) {/*nop*/ }

    public characterMove(character: Character) {

    }
}
/**
 * This is a power up a character can collect.
 */
export class PowerUp extends Component3D implements ICollidable {

    private _model: G.Model;
    private _bBox;
    //private _collisionHelper: THREE.BoxHelper;
    private _hit: boolean = false;
    private _position: Vector3;

    public constructor(e: IEnvironment, name: string) {
        super(e, name);
        this._position = new Vector3(0, 0, 0);
    }

    public get Positiion(): Vector3 {
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
        this.e.registerCollidable(this);

        var action: THREE.AnimationAction = this._model.getActionFromClip("idle");
        action.setEffectiveTimeScale(0.4);
        action.startAt(G.random.next());
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();

        //this._collisionHelper = new THREE.BoxHelper(this._model);

        this._bBox = new THREE.Box3();
        this.obj.add(this._model);
        //this.obj.add(this._collisionHelper);

        this.e.getScene().add(this.obj);

        this._bBox.expandByObject(this._model);
    }

    public update(delta: number) {

        // Set the position in case it changed
        this._model.position.set(this._position.x, this._position.y, this._position.z);
        this._model.update(delta);

        //this._collisionHelper.update();
    }

    public characterMove(character: Character) {
        //this._collisionHelper.update();
        this._bBox.makeEmpty();
        this._bBox.expandByObject(this._model);
        if (character.bBox.intersectsBox(this._bBox)) {
            this._hit = true;
        }
    }

    OnHit(other: Component3D) {
        this._hit = true;
    }
    getBBox(): THREE.Box3 {
        this._bBox.makeEmpty();
        this._bBox.expandByObject(this._model);
        return this._bBox;
    }
    getComponent(): Component3D {
        return this;
    }

    public destroy() {
        this.e.getScene().remove(this.obj);
    }

}

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character extends Component3D implements IInputKeyboard, ICollidable {

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
    //private _collisionHelper: THREE.BoxHelper;

    public get model() {
        return this._model;
    }
    public get bBox(): THREE.Box3 {
        return this._box;
    }

    public constructor(e: IEnvironment) {
        super(e, "Character");
        this.e.registerKeyboard(this);
    }

    ////////////////////////////////////////
    //   Life cycle events
    ////////////////////////////////////////
    public initialize() {
        this._model = new G.Model();
        this._box = new THREE.Box3();
        this.e.registerCollidable(this);
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

        //this._collisionHelper = new THREE.BoxHelper(this.model);

        this.obj.add(this.model);
        //this.obj.add(this._collisionHelper);

        var worldXMax = this.assets.level.terrain.cellSize * this.assets.level.terrain.rows;
        var worldZMax = this.assets.level.terrain.cellSize * this.assets.level.terrain.columns;
        this.model.position.x = G.random.next(0, worldXMax);
        this.model.position.z = G.random.next(0, worldZMax);

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
    //   Collision function
    ////////////////////////////////////////
    OnHit(other: Component3D) {
        console.info("Hit: " + other.name);
        this.model.material.color.g -= .05;
        this.model.material.color.b -= .05;

    }
    getBBox(): THREE.Box3 {
        //this._box.makeEmpty();
        //this._box.expandByObject(this._model);
        return this._box;
    }
    getComponent(): Component3D {
        return this;
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
            //this._collisionHelper.update();
            this.e.getCollisionManager().EnqueueDirty(this);
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
export class Skybox extends Component3D {
    private target: THREE.Object3D;

    public constructor(e: IEnvironment) {
        super(e, "SkyBox");
    }

    public setTarget(target: THREE.Object3D) {
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

        this.setTarget(this.e.getCharacter().model);
    }

    update(delta: number): void {
        //move the box around the character
        var pos = this.target.position;
        this.obj.position.set(pos.x, pos.y, pos.z);
    }
}
