
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';
import { Character } from '../game-engine/character';
import { CameraComponent } from '../game-engine/camera.component';


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
    private character: Character;
    private _scene: THREE.Scene;
    private _start: boolean = false;

    // Gets the assets which is the models.
    public get assets() {
        return this._assets;
    }

    // The scene used to manage the graphics
    public get scene() {
        return this._scene;
    }

    //This is the number of async json files loaded.
    private loadCount: number = 0;
    //This is the number of json files the environment is loading.
    private itemsToLoad: number = 2;

    //When the number of json files loaded equals
    //the items to load ready will be set to true.
    public get ready() {
        return this.loadCount == this.itemsToLoad;
    }

    /**
     * Gets the camera
     */
    public get camera() {
        return this.flyCamera.camera;
    }

    public initialize(scene: THREE.Scene) {
        this._scene = scene;

        // Setup the camera here so we can render something the first frame.
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.flyCamera = new CameraComponent(camera);

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
        this.character = new Character();
        this.character.initialize(this);
        this.scene.add(this.character.model);
                
        this.flyCamera.setTarget(this.character.model);
    }

    public update(delta: number) {
        if (this.ready) {
            if (!this._start) {
                this.start();
            }
            this.character.update(delta);
            this.flyCamera.update(delta);
        }
    }

    public onMouseOver(mouse: MouseEvent): void {
        if (this.ready) {
            this.flyCamera.over(mouse);
        }
    }

    public onMouseMove(mouse: MouseEvent): void {
        if (this.ready) {
            this.flyCamera.move(mouse);
        }
    }

    public onKeyUp(key: KeyboardEvent): void {
        if (this.ready) {
            this.flyCamera.keyUp(key);
            this.character.keyUp(key);
        }
    }

    public onKeyDown(key: KeyboardEvent): void {
        if (this.ready) {
            this.flyCamera.keyDown(key);
            this.character.keyDown(key);
        }
    }

    public onWindowResize(width: number, height: number) {
        if (this.ready) {
            this.flyCamera.resize(width, height);
        }
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

