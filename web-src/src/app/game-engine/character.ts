
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics'

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character {
    private _model: G.Model;
    private walkAction: THREE.AnimationAction;
    private rotateAngel: number = 0;
    private moveSpeed: number = 0;
    private ready: boolean = false;
    private speed: number = 5.0;
    private rotateSpeed: number = .05;

    public get model() : G.Model {
        return this._model;
    }

    public initialize(scene: THREE.Scene) {
        this._model = new G.Model();
         var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load("../assets/character.json", (json) => {
            var model: DATA.Model = JSON.parse(json);

            this.model.Initialize(model);            
            this.model.blink();
            this.ready = true;
            scene.add(this.model);
        });       
    }

    public update(delta: number) {
        if (this.ready) {
            this.model.update(delta);
            this.move();
        }
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
    }

    private walk() {
        if (this.walkAction == undefined) {
            this.walkAction = this.model.walk();
            this.walkAction.setEffectiveTimeScale(2.5);
            this.walkAction.loop = true;
            this.walkAction.setLoop(THREE.LoopRepeat, Infinity);
        }
        if (!this.walkAction.paused) {
            this.walkAction.play();
        }
    }

    private stop() {
        if (this.walkAction != undefined && this.walkAction.isRunning) {
            this.walkAction.stop();
        }
        //var action = this.graphics.idle();
        //action.setEffectiveTimeScale(2.0);
        //action.loop = true;
        //action.setLoop(THREE.LoopRepeat, Infinity);        
    }

}