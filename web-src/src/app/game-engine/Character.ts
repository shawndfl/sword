import * as THREE from 'three';
import * as DATA from '../game-engine/data';

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
            var characterModel = JSON.parse(json);

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
                    pz: [0, 0]
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
                        values: [
                            25, 68, 0,  //up
                            25, 70, 0,   //down
                            25, 68, 0,  //up
                            25, 70, 0,   //down
                            25, 68, 0,  //up
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

            var geo: THREE.BufferGeometry = this.buildCubeOffset(
                meshData.offset,
                meshData.nx,
                meshData.px,
                meshData.ny,
                                meshData. py,
                meshData.nz,
                meshData.pz
            );
                        
            var mesh = new THREE.Mesh(geo, material);
            mesh.name = meshData.name;
            if(mesh.name == "head"){
                console.log("head");
                mesh
            }

            mesh.position.set(meshData.position[0], meshData.position[1], meshData.position[2]);
            mesh.scale.set(meshData.scale[0], meshData.scale[1], meshData.scale[2]);
             
            // Add to root 
            this.root.add(mesh);

        });

            model.clipes.forEach(clip => {
                var tracks = new Array<THREE.KeyframeTrack>();
                for (let track of clip.tracks) {
                    var animationTrack = new THREE.KeyframeTrack(track.name, track.times, track.values, THREE.InterpolateLinear);
                    tracks.push(animationTrack);
                }
                this.animationClip = new THREE.AnimationClip(clip.name, clip.duration, tracks);
            });

            this.mixer = new THREE.AnimationMixer(this.root);

            this.walk();
        
    }

    private buildCubeOffset(offset: number[],
        nx: number[],
        px: number[],
        ny: number[],
        py: number[],
        nz: number[],
        pz: number[])
        : THREE.BufferGeometry {

        var vertices = [
            -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,            //front
            0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,            //Left
            0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,        //Back
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,        //Right
            -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,            //Top
            -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5         //Bottom
        ];

        //offset positions
        for (var i = 0; i < vertices.length; i += 3) {
            vertices[i] += offset[0];
            vertices[i + 1] += offset[1];
            vertices[i + 2] += offset[2];
        }

        var normals = [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
        ];
        var s = 0.0625;
        var tex1 = [
            pz[0] * s, 1.0 - (pz[1] * s),
            pz[0] * s + s, 1.0 - (pz[1] * s),
            pz[0] * s + s, 1.0 - (pz[1] * s + s),
            pz[0] * s, 1.0 - (pz[1] * s + s),

            px[0] * s, 1.0 - (px[1] * s),
            px[0] * s + s, 1.0 - (px[1] * s),
            px[0] * s + s, 1.0 - (px[1] * s + s),
            px[0] * s, 1.0 - (px[1] * s + s),

            nz[0] * s, 1.0 - (nz[1] * s),
            nz[0] * s + s, 1.0 - (nz[1] * s),
            nz[0] * s + s, 1.0 - (nz[1] * s + s),
            nz[0] * s, 1.0 - (nz[1] * s + s),

            nx[0] * s, 1.0 - (nx[1] * s),
            nx[0] * s + s, 1.0 - (nx[1] * s),
            nx[0] * s + s, 1.0 - (nx[1] * s + s),
            nx[0] * s, 1.0 - (nx[1] * s + s),

            py[0] * s, 1.0 - (py[1] * s),
            py[0] * s + s, 1.0 - (py[1] * s),
            py[0] * s + s, 1.0 - (py[1] * s + s),
            py[0] * s, 1.0 - (py[1] * s + s),

            ny[0] * s, 1.0 - (ny[1] * s),
            ny[0] * s + s, 1.0 - (ny[1] * s),
            ny[0] * s + s, 1.0 - (ny[1] * s + s),
            ny[0] * s, 1.0 - (ny[1] * s + s),

        ]

        var faces = [
            0, 3, 1, 1, 3, 2,                   //Front
            4, 7, 5, 7, 6, 5,                   //Left
            8, 11, 9, 11, 10, 9,                //Back
            12, 15, 13, 15, 14, 13,             //Right
            16, 19, 17, 19, 18, 17,             //Top
            20, 23, 21, 23, 22, 21              //Bottom
        ]

        // Load geometry
        var geometry = new THREE.BufferGeometry();
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(faces), 1));
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(tex1), 2));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

        return geometry;
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
