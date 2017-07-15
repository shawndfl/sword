import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';

export class Character {

    // Data
    private CharacterModel: DATA.CharacterModel;   

    public root: THREE.Object3D;

    //animation 
    private mixer: THREE.AnimationMixer;
    private animationClip: THREE.AnimationClip;

    public loadModelJson(pathToJson: string, onLoad, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var characterModel: DATA.CharacterModel = JSON.parse(json);

            this.buildFromData(characterModel);
        }, onProgress, onError);
    }

    public buildCharacter() {
        var model: DATA.CharacterModel = {
            name: "main",
            diffusedTex: "assets/face.png",
            meshes: [
                {
                    name: "head",
                    offset: [0, 0, 0],
                    position: [0, 95, 0],
                    scale: [20, 20, 15],
                    rotation: [0, 0, 0],
                    nx: [4, 0],
                    px: [1, 0],
                    ny: [5, 0],
                    py: [3, 0],
                    nz: [2, 0],
                    pz: [6, 0]
                },
                {
                    name: "body",
                    offset: [0, 0, 0],
                    position: [0, 60, 0],
                    scale: [30, 30, 15],
                    rotation: [0, 0, 0],
                    nx: [1, 1],
                    px: [1, 1],
                    ny: [1, 1],
                    py: [5, 0],
                    nz: [1, 1],
                    pz: [0, 1]
                },
                {
                    name: "lsholder",
                    offset: [0, 0, 0],
                    position: [25, 70, 0],
                    scale: [20, 10, 15],
                    rotation: [0, 0, 0],
                    nx: [1, 1],
                    px: [1, 1],
                    ny: [1, 1],
                    py: [1, 1],
                    nz: [1, 1],
                    pz: [1, 1]
                },
                {
                    name: "rsholder",
                    offset: [0, 0, 0],
                    position: [-25, 70, 0],
                    scale: [20, 10, 15],
                    rotation: [0, 0, 0],
                    nx: [1, 1],
                    px: [1, 1],
                    ny: [1, 1],
                    py: [1, 1],
                    nz: [1, 1],
                    pz: [1, 1]
                },
                {
                    name: "larm",
                    offset: [0, 0, 0],
                    position: [35, 50, 0],
                    scale: [20, 20, 20],
                    rotation: [0, 0, 0],
                    nx: [5, 1],
                    px: [5, 1],
                    ny: [4, 1],
                    py: [1, 1],
                    nz: [5, 1],
                    pz: [5, 1]
                },
                 {
                    name: "rarm",
                    offset: [0, 0, 0],
                    position: [-35, 50, 0],
                    scale: [20, 20, 20],
                    rotation: [0, 0, 0],
                    nx: [5, 1],
                    px: [5, 1],
                    ny: [4, 1],
                    py: [1, 1],
                    nz: [5, 1],
                    pz: [5, 1]
                },
                 {
                    name: "lleg",
                    offset: [0, 0, 0],
                    position: [15, 15, 0],
                    scale: [20, 30, 20],
                    rotation: [0, 0, 0],
                    nx: [1, 2],
                    px: [1, 2],
                    ny: [0, 1],
                    py: [1, 1],
                    nz: [1, 2],
                    pz: [1, 2]
                },
                {
                    name: "rleg",
                    offset: [0, 0, 0],
                    position: [-15, 15, 0],
                    scale: [20, 30, 20],
                    rotation: [0, 0, 0],
                    nx: [1, 2],
                    px: [1, 2],
                    ny: [0, 1],
                    py: [1, 1],
                    nz: [1, 2],
                    pz: [1, 2]
                }
            ],
            clipes: [{
                name: "Default",
                duration: 3.0,
                tracks: [                    
                    {
                        name: "lleg.position",
                        times: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            15, 15, 0,  //pivit
                            15, 15, -10,  //push                   
                            15, 25, -10,  //lift                   
                            15, 25, 0,   //reach
                            15, 25, 10,   //reach                   
                            15, 15, 10,  //plant
                            15, 15, 0    //pull                   
                        ]
                    },
                    {
                        name: "rleg.position",
                        times: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            -15, 25, 0,   //lift           
                            -15, 25, 10,   //reach                         
                            -15, 15, 10,  //plant
                            -15, 15, 0,    //pull 
                            -15, 15, -10, //push          
                            -15, 25, -10,   //lift
                            -15, 25, 0    //reach
                        ]
                    },
                    {
                        name: "rarm.position",
                        times: [0.0, 0.75, 1.5, 2.25, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            -35, 50, 0,   //center
                            -35, 50, -10,   //back                         
                            -35, 50, 0,  //center
                            -35, 50, 10,    //forward
                            -35, 50, 0 //center                         
                        ]
                    },
                    {
                        name: "larm.position",
                        times: [0.0, 0.75, 1.5, 2.25, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            35, 50, 0,   //center
                            35, 50, 10,   //back                         
                            35, 50, 0,  //center
                            35, 50, -10,    //forward
                            35, 50, 0 //center                         
                        ]
                    },
                    {
                        name: "head.position",
                        times: [0.0, 0.75, 1.5, 2.25, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            0, 95, 0,  //up
                            0, 90, 0,   //down
                            0, 95, 0,  //up
                            0, 90, 0,   //down
                            0, 95, 0,  //up
                        ]
                    },
                    {
                        name: "rsholder.position",
                        times: [0.0, 0.75, 1.5, 2.25, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            -25, 70, 0,  //up
                            -25, 68, 0,   //down
                            -25, 70, 0,  //up
                            -25, 68, 0,   //down
                            -25, 70, 0,  //up
                        ]
                    },
                    {
                        name: "lsholder.position",
                        times: [0.0, 0.75, 1.5, 2.25, 3.0],
                        interpolation: THREE.InterpolateLinear,
                        values: [
                            25, 68, 0,  //up
                            25, 70, 0,   //down
                            25, 68, 0,  //up
                            25, 70, 0,   //down
                            25, 68, 0,  //up
                        ]
                    },
                    {
                        name: "head.pz",
                        times: [0.0, 2.5, 2.8, 3.0],
                        interpolation: THREE.InterpolateDiscrete,
                        values: [
                            0,       //open
                            6,       //close
                            0,       //open   
                            0        //open   
                        ]
                    }
                ]
            }]
        }

        this.buildFromData(model);
    }

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

            model.clipes.forEach(clip => {
                var tracks = new Array<THREE.KeyframeTrack>();
                for (let track of clip.tracks) {
                    var animationTrack = new THREE.KeyframeTrack(track.name, track.times, track.values, track.interpolation);
                    tracks.push(animationTrack);
                }
                this.animationClip = new THREE.AnimationClip(clip.name, clip.duration, tracks);
            });

            this.mixer = new THREE.AnimationMixer(this.root);

            this.walk();        
    }

    public walk() {

        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip);

        action.setEffectiveTimeScale(2.0);
        action.loop = true;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
    }        

    public update(delta: number) {
        if (this.mixer != undefined)
            this.mixer.update(delta);
    }

}
