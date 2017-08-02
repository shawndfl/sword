
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';
import { Character } from '../game-engine/character';
import { CameraComponent } from '../game-engine/camera.component';

export class Environment {
    private ready: boolean = false;
    private root: THREE.Object3D;
    private terrain: G.EnvornmentGraphics;
    private flyCamera: CameraComponent;

    private character: Character;

    /**
     * Gets the camera
     */
    public get camera () {
        return this.flyCamera.camera;
    }

    public initialize(scene: THREE.Scene) {
        var loader = new THREE.FileLoader();
        this.character = new Character();
        this.character.initialize(scene);

        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.flyCamera = new CameraComponent(camera);
        this.flyCamera.setTarget(this.character.model);

        this.terrain = new G.EnvornmentGraphics();
        this.terrain.loadModelJson(scene, "../assets/environment.json", (envData: DATA.Terrain) => {

            this.ready = true;
        });       
    }

    public update(delta: number) {
        if (this.ready) {
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

