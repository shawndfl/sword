import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';

/**
 * This class will be used to hold all the logic for the main character.
 * It will recive inputs from the scene and manipulate the character graphics
 */
export class CharacterLogic
{

}

export class CharacterGraphics {

    // Data
    private CharacterModel: DATA.CharacterModel;

    public root: THREE.Object3D;

    //animation 
    private mixer: THREE.AnimationMixer;
    private animationClip: { [id: string]: THREE.AnimationClip } = {};

    public loadModelJson(scene: THREE.Scene, pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var characterModel: DATA.CharacterModel = JSON.parse(json);

            this.buildFromData(characterModel);
            scene.add(this.root);
        }, onProgress, onError);
    }

    public buildCharacter(scene: THREE.Scene) {
        //var model: DATA.CharacterModel =
        this.loadModelJson(scene, "../assets/Character.json");
        //this.buildFromData(model);
    }

    /**
     * builds a mesh from json data. This mesh will share the same material and texture.
     * It will load in animations too.
     * @param model 
     */
    private buildFromData(model: DATA.CharacterModel) {
        this.root = new THREE.Object3D();
        this.root.name = model.name;

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
        material.transparent = false;
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

            // Add to root 
            this.root.add(mesh);

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

        this.mixer = new THREE.AnimationMixer(this.root);

        //test animations
        this.walk();
        this.blink();
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

    public walk() {

        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['walk']);

        action.setEffectiveTimeScale(2.0);
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
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

}
