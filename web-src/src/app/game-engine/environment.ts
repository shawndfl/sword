
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';
import { CameraComponent } from '../game-engine/camera.component';

/**
 * Manages the lifecycle of an object
 */
export interface LifecycleBehavior {
    initialize();
    start(env: Environment);
    update(delta: number): void;
    mouseOver(mouse: MouseEvent): void;
    mouseMove(mouse: MouseEvent): void;
    keyUp(key: KeyboardEvent): void;
    keyDown(key: KeyboardEvent): void;
    windowResize(width: number, height: number);
}

/**
 * Gets a random number
 */
export function random() {
    return Math.random();
}

/**
 * This is the main container of the game.
 * Everything gets loaded and updated form here.
 * It also holds an instance of the main systems.
 */
export class Environment {
    private root: THREE.Object3D;
    private terrain: G.EnvornmentGraphics;
    private flyCamera: CameraComponent;
    private _assets: Assets;
    private _character: Character;
    private _items: PowerUpManager;
    private _scene: THREE.Scene;
    private _gameObjects: LifecycleBehavior[] = [];
    private _skybox: Skybox;

    ////////////////////////////////////////
    //   Properties
    ////////////////////////////////////////
    /**
     *  Gets the assets which is the models.
     */
    public get assets() {
        return this._assets;
    }

    /**
     *  The scene used to manage the graphics
     */
    public get scene() {
        return this._scene;
    }

    /**
     * The character
     */
    public get character() {
        return this._character;
    }

    public get skyBox() {
        return this._skybox;
    }

    /**
     * Gets the camera
     */
    public get camera() {
        return this.flyCamera.camera;
    }

    ////////////////////////////////////////
    //   Life cycle management vars
    ////////////////////////////////////////
    /**
     * Has the game started yet.
     */
    private _start: boolean = false;
    /**
     * This is the number of async json files loaded.
     */
    private loadCount: number = 0;
    /**
     * This is the number of json files the environment is loading.
     */
    private itemsToLoad: number = 2;

    /**
     * When the number of json files loaded equals
     * the items to load ready will be set to true.
     */
    public get ready() {
        return this.loadCount == this.itemsToLoad;
    }

    public constructor() {
        this._character = new Character();
        this._gameObjects.push(this._character);

        this._skybox = new Skybox();
        this._gameObjects.push(this._skybox);

        this._items = new PowerUpManager();
        this._gameObjects.push(this._items);

        // Setup the camera here so we can render something the first frame.
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.flyCamera = new CameraComponent(camera);
       
    }


    ////////////////////////////////////////
    //   Life cycle events
    ////////////////////////////////////////
    public initialize(scene: THREE.Scene) {
        this._scene = scene;

        this._gameObjects.forEach((value, index, array) => {
            value.initialize();
        });

        this.terrain = new G.EnvornmentGraphics();
        this.terrain.loadModelJson(scene, "../assets/environment.json", (envData: DATA.Terrain) => {
            this.loadCount++;
        });

        this._assets = new Assets();
        this.assets.loadModelJson("../assets/models.json", (assets: Assets) => {
            this.loadCount++;
        });
    }

    /**
     * This is called when all the json files are loaded.
     */
    private start() {
        this._start = true;

        this._gameObjects.forEach((value, index, array) => {
            value.start(this);
        });        

        // map dependencies
        this.scene.add(this._character.model);
        this.flyCamera.setTarget(this._character.model);
        //initialize all power ups
        this._items.addToScene(this.scene);

        this._skybox.setTarget(this._character);
        this.scene.add(this._skybox);
    }

    private update(delta: number) {
        this._gameObjects.forEach((value, index, array) => {
            value.update(delta);
        });
        this.flyCamera.update(delta);
    }

    public mouseOver(mouse: MouseEvent): void {
        this._gameObjects.forEach((value, index, array) => {
            value.mouseOver(mouse);
        });
        this.flyCamera.over(mouse);
    }

    public mouseMove(mouse: MouseEvent): void {
        this._gameObjects.forEach((value, index, array) => {
            value.mouseMove(mouse);
        });
        this.flyCamera.move(mouse);
    }

    public keyUp(key: KeyboardEvent): void {
        this._gameObjects.forEach((value, index, array) => {
            value.keyUp(key);
        });
        this.flyCamera.keyUp(key);
    }

    public keyDown(key: KeyboardEvent): void {
        this._gameObjects.forEach((value, index, array) => {
            value.keyDown(key);
        });
        this.flyCamera.keyDown(key);
    }

    public windowResize(width: number, height: number) {
        this._gameObjects.forEach((value, index, array) => {
            value.windowResize(width, height);
        });
        this.flyCamera.resize(width, height);
    }

    ////////////////////////////////////////
    //   callback events
    ////////////////////////////////////////
    public onUpdate(delta: number) {
        if (this.ready) {
            if (!this._start)
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
        if (this.ready)
            this.windowResize(width, height);
    }
}

/**
 * This class is used to load all the models from a json fil and store them in a
 * map. The models here can be passed into G.Models.Initialize().
 * 
 * An instance of this is created by Environment.
 */
export class Assets {

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

export class PowerUpManager implements LifecycleBehavior {
    private _items: PowerUp[] = [];

    public get items () {
        return this._items;
    }

    public addToScene(scene: THREE.Scene) {
        this._items.forEach((value, index, array) => {
            scene.add(value.model);
        });
    }

    initialize() {
        //create 10 items
        for (var i = 0; i < 10; i++) {            
            this._items.push(new PowerUp());            
        }
    }
    start(env: Environment) {
        this._items.forEach((value, index, array) => {
            value.start(env);
            value.model.position.x = index * 50;
        });

    }
    update(delta: number): void {
        this._items.forEach((value, index, array) => {
            value.update(delta);
        });
    }
    mouseOver(mouse: MouseEvent): void {/*nop*/ }
    mouseMove(mouse: MouseEvent): void {/*nop*/ }
    keyUp(key: KeyboardEvent): void {/*nop*/ }
    keyDown(key: KeyboardEvent): void {/*nop*/ }
    windowResize(width: number, height: number) {/*nop*/ }
}
/**
 * This is a power up a character can collect.
 */
export class PowerUp implements LifecycleBehavior {

    private _model: G.Model;

    public get model(): G.Model {
        return this._model;
    }

    public initialize() { /*nop*/ }

    public start(environment: Environment) {
        this._model = new G.Model();
        var model: DATA.Model = environment.assets.models.get("powerup");
        this.model.Initialize(model);    

        var action: THREE.AnimationAction = this.model.getActionFromClip("idle");
        action.setEffectiveTimeScale(1.0);
        action.startAt(random());
        action.loop = true;
        action.setLoop(THREE.LoopPingPong, Infinity);
        action.play();
    }

    public update(delta: number) {
        this.model.update(delta);
    }

    public keyDown(key: KeyboardEvent): void { /*nop*/ }
    public keyUp(key: KeyboardEvent): void { /*nop*/ }
    public mouseOver(mouse: MouseEvent): void { /*nop*/ }
    public mouseMove(mouse: MouseEvent): void { /*nop*/ }
    public windowResize(width: number, height: number) { /*nop*/ }
}

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character implements LifecycleBehavior {
    private _model: G.Model;
    private walkAction: THREE.AnimationAction;
    private rotateAngel: number = 0;
    private moveSpeed: number = 0;
    private speed: number = 5.0;
    private rotateSpeed: number = .05;
    private attackReady: boolean = false;
    private attacking: boolean = false;

    public get model(): G.Model {
        return this._model;
    }

    ////////////////////////////////////////
    //   Life cycle events
    ////////////////////////////////////////
    public initialize() {
        this._model = new G.Model();
    }

    public start(environment: Environment) {
        var model: DATA.Model = environment.assets.models.get("character");
        this.model.Initialize(model);

        var action: THREE.AnimationAction = this.model.getActionFromClip('blink');

        action.setEffectiveTimeScale(1.0);
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
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
        //console.log("keydown" + key.keyCode);
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

    public mouseOver(mouse: MouseEvent): void { /*nop*/ }
    public mouseMove(mouse: MouseEvent): void { /*nop*/ }
    public windowResize(width: number, height: number) { /*nop*/ }

    ////////////////////////////////////////
    //   private functions
    ////////////////////////////////////////
    private move() {
        if (this.rotateAngel != 0) {
            var axis: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
            this.model.rotateOnAxis(axis, this.rotateAngel);
            this.walk();
        }

        if (this.moveSpeed != 0) {
            var direction: THREE.Vector3 = new THREE.Vector3();
            var up: THREE.Vector3 = new THREE.Vector3();
            var right: THREE.Vector3 = new THREE.Vector3();
            this.model.matrix.extractBasis(right, up, direction);

            var current: THREE.Vector3 = this.model.position;
            var newPos = current.addVectors(current, direction.multiplyScalar(this.moveSpeed));
            this.model.position.set(newPos.x, newPos.y, newPos.z);

            this.walk();
        }

        if (this.attackReady && !this.attacking) {
            var action: THREE.AnimationAction = this.model.getActionFromClip("attack");
            action.setEffectiveTimeScale(2.5);
            action.loop = false;
            action.play();   
            this.attackReady = false;
            this.attacking = true;
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

export class Skybox extends THREE.Object3D implements LifecycleBehavior {
    private character: Character;

    setTarget(character: Character) {
        this.character = character;
    }
    initialize() {

    }
    start(env: Environment) {
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
        material.depthWrite = false;
        var geo = new G.GeoBuilder();
        geo.offset(0, 0, 0).faceIn().nx(2, 1).px(4, 1).ny(1, 1).py(0, 1).nz(3, 1).pz(5, 1);

        var mesh = new THREE.Mesh(geo.build(), material);
        mesh.scale.set(7000, 1000, 7000);
        mesh.position.set(0, 400, 0);
        this.add(mesh);
    }

    update(delta: number): void {
        //move the box around the character
        var pos = this.character.model.position;
        this.position.set(pos.x, pos.y, pos.z);
    }
    mouseOver(mouse: MouseEvent): void {/*nop*/ }
    mouseMove(mouse: MouseEvent): void {/*nop*/ }
    keyUp(key: KeyboardEvent): void {/*nop*/ }
    keyDown(key: KeyboardEvent): void {/*nop*/ }
    windowResize(width: number, height: number) {/*nop*/ }

}
