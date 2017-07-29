
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';

export class Environment {
   private ready: boolean = false;
   private root: THREE.Object3D;
   private graphics: G.EnvornmentGraphics;

   public initialize(scene: THREE.Scene) {
      var loader = new THREE.FileLoader();      
      this.graphics = new G.EnvornmentGraphics();
      this.graphics.loadModelJson(scene, "../assets/environment.json", (envData: DATA.Terrain)=>{

         this.ready = true;
      });

       this.graphics.loadModelJson(scene, "../assets/character.json", (envData: DATA.Character)=>{

         this.ready = true;
      });

   }

   public update(delta: number) {
      if (this.ready) {

      }
   }

   private buildFromData() {

   }
}

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character {
    private _graphics: G.CharacterGraphics;
    private walkAction: THREE.AnimationAction;
    private rotateAngel: number = 0;
    private moveSpeed: number = 0;
    private ready: boolean = false;
    private speed: number = 5.0;
    private rotateSpeed: number = .05;

    public get graphics() : G.CharacterGraphics {
        return this._graphics;
    }

    public initialize(scene: THREE.Scene) {
        this._graphics = new G.CharacterGraphics();
        this.graphics.loadModelJson(scene, "../assets/character.json", (graphics) => {
            this.graphics.blink();
            scene.add(this.graphics);
            this.ready = true;
        });
    }

    public update(delta: number) {
        if (this.ready) {
            this.graphics.update(delta);
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
            this.graphics.rotateOnAxis(axis, this.rotateAngel);
            this.walk();
        }        

        if (this.moveSpeed != 0) {
            var direction: THREE.Vector3 = new THREE.Vector3();
            var up: THREE.Vector3 = new THREE.Vector3();
            var right: THREE.Vector3 = new THREE.Vector3();
            this.graphics.matrix.extractBasis(right, up, direction);

            var current: THREE.Vector3 = this.graphics.position;
            var newPos = current.addVectors(current, direction.multiplyScalar(this.moveSpeed));
            this.graphics.position.set(newPos.x, newPos.y, newPos.z);

            this.walk();
        }        
    }

    private walk() {
        if (this.walkAction == undefined) {
            this.walkAction = this.graphics.walk();
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

