
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics'

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class Character {
    private _model: Model;
    private walkAction: THREE.AnimationAction;
    private rotateAngel: number = 0;
    private moveSpeed: number = 0;
    private ready: boolean = false;
    private speed: number = 5.0;
    private rotateSpeed: number = .05;

    public get model() : Model {
        return this._model;
    }

    public initialize(scene: THREE.Scene) {
        this._model = new Model();
        this.model.loadModelJson(scene, "../assets/character.json", (graphics) => {
            this.model.blink();
            scene.add(this.model);
            this.ready = true;
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

/**
 * The model for the character
 */
class Model extends THREE.Object3D {      

    //animation 
    private mixer: THREE.AnimationMixer;
    private animationClip: { [id: string]: THREE.AnimationClip } = {};

    /**
     * Loads the meshes, animations, and textures from a json file.
     * @param scene 
     * @param pathToJson 
     * @param onLoad 
     * @param onProgress 
     * @param onError 
     */
    public loadModelJson(scene: THREE.Scene, pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var characterModel: DATA.CharacterModel = JSON.parse(json);

            this.buildFromData(characterModel);            
            onLoad(this);
        }, onProgress, onError);
    }

    public walk(): THREE.AnimationAction {

        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['walk']);
        return action;
    }

    public idle(): THREE.AnimationAction {
        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['idle']);
        return action;
    }

    public blink() {

        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['blink']);

        action.setEffectiveTimeScale(1.0);
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
    }

    public update(delta: number) {
        if (this.mixer != undefined)
            this.mixer.update(delta);
    }

    /**
     * builds a mesh from json data. This mesh will share the same material and texture.
     * It will load in animations too.
     * @param model 
     */
    private buildFromData(model: DATA.CharacterModel) {       
        this.name = model.name;

        // Set material
        var textue = model.diffusedTex;
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

        //Load in all meshes that make up this model
        model.meshes.forEach(meshData => {

            var geo: G.CubeGeometry = new G.CubeGeometry(
                meshData.offset,
                meshData.nx,
                meshData.px,
                meshData.ny,
                meshData.py,
                meshData.nz,
                meshData.pz
            );

            var mesh: G.CubeMesh = new G.CubeMesh(geo, material);
            mesh.name = meshData.name;

            mesh.position.set(meshData.position[0], meshData.position[1], meshData.position[2]);
            mesh.scale.set(meshData.scale[0], meshData.scale[1], meshData.scale[2]);

            // Add mesh
            if(meshData.parent == undefined) 
            {
                this.add(mesh);
            }
            else
            {
                this.traverse((object: THREE.Object3D)=>{
                    if(object.name == meshData.parent){
                        object.add(mesh);
                    }
                })
            }

        });

        //Process all animation clips
        model.clipes.forEach(clip => {
            var tracks = new Array<THREE.KeyframeTrack>();
            for (let track of clip.tracks) {

                var interpolation: THREE.InterpolationModes = this.convertToInterpolateMode(track.interpolation);
                var animationTrack = new THREE.KeyframeTrack(track.name, track.times, track.values, interpolation);
                tracks.push(animationTrack);
            }
            this.animationClip[clip.name] = new THREE.AnimationClip(clip.name, clip.duration, tracks);
        });

        this.mixer = new THREE.AnimationMixer(this);
    }

    private convertToInterpolateMode(value: string): THREE.InterpolationModes {
        var interpolation: THREE.InterpolationModes;

        switch (value) {
            case "InterpolateDiscrete":
                interpolation = THREE.InterpolateDiscrete;
                break;
            case "InterpolateLinear":
                interpolation = THREE.InterpolateLinear;
                break;
            case "InterpolateSmooth":
                interpolation = THREE.InterpolateSmooth;
                break;
            default:
                interpolation = THREE.InterpolateLinear;
        }
        return interpolation;
    }
}
