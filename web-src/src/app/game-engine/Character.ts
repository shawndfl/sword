import * as THREE from 'three';

export class Character {

    // mesh parts
    public head: THREE.Mesh;

    public body: THREE.Mesh;

    public rarm: THREE.Mesh;
    public larm: THREE.Mesh;

    public rsholder: THREE.Mesh;
    public lsholder: THREE.Mesh;

    public rleg: THREE.Mesh;
    public lleg: THREE.Mesh;

    public root: THREE.Object3D;

    //animation 
    private mixer: THREE.AnimationMixer;
    private animationClip: THREE.AnimationClip;   

    public buildCharacter() {
        this.root = new THREE.Object3D();
        this.root.name = "root";

        this.buildHead();
        this.buildArms();
        this.buildSholders();
        this.buildLegs();
        this.buildBody();

        this.initAnimations();

        this.positionBody();

        this.walk();
    }

    private positionBody() {
        // Position all parts 
        this.head.position.set(0, 95, 0);
        this.head.scale.set(20, 20, 15);

        this.body.position.set(0, 60, 0);
        this.body.scale.set(30, 30, 15);

        this.lsholder.position.set(25, 70, 0);
        this.lsholder.scale.set(20, 10, 15);

        this.rsholder.position.set(-25, 70, 0);
        this.rsholder.scale.set(20, 10, 15);

        this.larm.position.set(35, 50, 0);
        this.larm.scale.set(20, 20, 20);

        this.rarm.position.set(-35, 50, 0);
        this.rarm.scale.set(20, 20, 20);

        this.lleg.position.set(15, 15, 0);
        this.lleg.scale.set(20, 30, 20);

        this.rleg.position.set(-15, 15, 0);
        this.rleg.scale.set(20, 30, 20);
    }

    private initAnimations() {
        var clip = {
            "name": "Default",
            "duration": 3.0,
            "tracks": [
                {
                "name": "lleg.position",
                "times": [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
                "values": [                   
                   15, 15, 0,  //pivit
                   15, 15, -10,  //push                   
                   15, 25, -10,  //lift                   
                   15, 25, 0,   //reach
                   15, 25, 10,   //reach                   
                   15, 15, 10,  //plant
                   15, 15, 0    //pull                   
                ]},
                {

                "name": "rleg.position",
                "times": [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
                "values": [                   
                   -15, 25, 0,   //lift           
                   -15, 25, 10,   //reach                         
                   -15, 15, 10,  //plant
                   -15, 15, 0,    //pull 
                   -15, 15, -10, //push          
                   -15, 25, -10,   //lift
                   -15, 25, 0    //reach
                ]},
                {

                "name": "rarm.position",
                "times": [0.0, 0.75, 1.5, 2.25, 3.0],
                "values": [                   
                   -35, 50, 0,   //center
                   -35, 50, -10,   //back                         
                   -35, 50, 0,  //center
                   -35, 50, 10,    //forward
                   -35, 50, 0 //center                         
                ]},
                 {

                "name": "larm.position",
                "times": [0.0, 0.75, 1.5, 2.25, 3.0],
                "values": [                   
                   35, 50, 0,   //center
                   35, 50, 10,   //back                         
                   35, 50, 0,  //center
                   35, 50, -10,    //forward
                   35, 50, 0 //center                         
                ]},
                {

                "name": "head.position",
                "times": [0.0, 0.75, 1.5, 2.25, 3.0],
                "values": [  
                           0, 95, 0,  //up
                           0, 90, 0,   //down
                           0, 95, 0,  //up
                           0, 90, 0,   //down
                           0, 95, 0,  //up
                ]},
                {

                "name": "rsholder.position",
                "times": [0.0, 0.75, 1.5, 2.25, 3.0],
                "values": [  
                           -25, 70, 0,  //up
                           -25, 68, 0,   //down
                           -25, 70, 0,  //up
                           -25, 68, 0,   //down
                           -25, 70, 0,  //up
                ]},
                {

                "name": "lsholder.position",
                "times": [0.0, 0.75, 1.5, 2.25, 3.0],
                "values": [  
                           25, 68, 0,  //up
                           25, 70, 0,   //down
                           25, 68, 0,  //up
                           25, 70, 0,   //down
                           25, 68, 0,  //up
                ]}
            ]
        }

        var tracks = new Array<THREE.KeyframeTrack>();
        for (let track of clip.tracks) {
            var animationTrack = new THREE.KeyframeTrack(track.name, track.times, track.values, THREE.InterpolateLinear);
            tracks.push(animationTrack);
        }

        this.animationClip = new THREE.AnimationClip(clip.name, clip.duration, tracks);
        this.mixer = new THREE.AnimationMixer(this.root);
    }

    private buildHead() {

        // Set material
        var textue = "assets/face.png";
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

        var geo: THREE.BufferGeometry = this.buildCube();
        this.head = new THREE.Mesh(geo, material);
        this.head.name="head";

        // Add to root 
        this.root.add(this.head);

    }

    private buildArms() {

        // Set material
        var textue = "assets/face.png";
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;

        var material = new THREE.MeshBasicMaterial();
        material.color = new THREE.Color(0.0, 0.0, 0.5);

        material.transparent = true;
        //material.map = diffused;
        material.wireframe = false;

        var geo: THREE.BufferGeometry = this.buildCube();

        this.rarm = new THREE.Mesh(geo, material);
        this.rarm.name="rarm";
        this.root.add(this.rarm);

        this.larm = new THREE.Mesh(geo, material);
        this.larm.name="larm";        
        this.root.add(this.larm);                
    }

    private buildSholders() {

        // Set material
        var textue = "assets/face.png";
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;

        var material = new THREE.MeshBasicMaterial();
        material.color = new THREE.Color(1.0, 1.0, 0.0);

        material.transparent = true;
        //material.map = diffused;
        material.wireframe = false;

        var geo: THREE.BufferGeometry = this.buildCube();

        this.rsholder = new THREE.Mesh(geo, material);
        this.rsholder.name = "rsholder";
        this.root.add(this.rsholder);

        this.lsholder = new THREE.Mesh(geo, material);
        this.lsholder.name = "lsholder";                
        this.root.add(this.lsholder);
        
    }

    private buildLegs() {
        // Set material
        var textue = "assets/face.png";
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;

        var lmaterial = new THREE.MeshBasicMaterial();
        lmaterial.color = new THREE.Color(0.5, 0.5, 0.0);

        lmaterial.transparent = true;
        //material.map = diffused;
        lmaterial.wireframe = false;

         var rmaterial = new THREE.MeshBasicMaterial();
        rmaterial.color = new THREE.Color(0.5, 0.0, 0.0);

        rmaterial.transparent = true;
        //material.map = diffused;
        rmaterial.wireframe = false;

        var geo: THREE.BufferGeometry = this.buildCube();
        
        this.rleg = new THREE.Mesh(geo, rmaterial);
        this.rleg.name = "rleg";
        this.root.add(this.rleg);

        this.lleg = new THREE.Mesh(geo, lmaterial);
        this.lleg.name = "lleg"
        this.root.add(this.lleg);
        

        // Add to root                              
    }

    private buildBody() {

        // Set material
        var textue = "assets/face.png";
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;

        var material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(0.0, 0.7, 0.0);

        material.shininess = 100.0;
        material.specular = new THREE.Color(1.0, 1.0, 1.0);
        material.transparent = true;
        //material.map = diffused;
        material.wireframe = false;

        var geo: THREE.BufferGeometry = this.buildCube();
        this.body = new THREE.Mesh(geo, material);

        // Add to root 
        this.root.add(this.body);
    }

    private buildCube(): THREE.BufferGeometry {
        return this.buildCubeOffset([0,0,0],
        [4,0],
        [1,0],
        [5,0],
        [3,0],
        [2,0],
        [0,0]);
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
        for(var i =0; i < vertices.length; i+=3)
        {
            vertices[i] += offset[0];
            vertices[i+1] += offset[1];
            vertices[i+2] += offset[2];
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
            pz[0] * s,     1.0 - (pz[1] * s), 
            pz[0] * s + s, 1.0 - (pz[1] * s),
            pz[0] * s + s, 1.0 - (pz[1] * s + s),
            pz[0] * s,     1.0 - (pz[1] * s + s), 

            px[0] * s,     1.0 - (px[1] * s), 
            px[0] * s + s, 1.0 - (px[1] * s),
            px[0] * s + s, 1.0 - (px[1] * s + s),
            px[0] * s,     1.0 - (px[1] * s + s), 

            nz[0] * s,     1.0 - (nz[1] * s), 
            nz[0] * s + s, 1.0 - (nz[1] * s),
            nz[0] * s + s, 1.0 - (nz[1] * s + s),
            nz[0] * s,     1.0 - (nz[1] * s + s), 

            nx[0] * s,     1.0 - (nx[1] * s), 
            nx[0] * s + s, 1.0 - (nx[1] * s),
            nx[0] * s + s, 1.0 - (nx[1] * s + s),
            nx[0] * s,     1.0 - (nx[1] * s + s), 

            py[0] * s,     1.0 - (py[1] * s), 
            py[0] * s + s, 1.0 - (py[1] * s),
            py[0] * s + s, 1.0 - (py[1] * s + s),
            py[0] * s,     1.0 - (py[1] * s + s), 

            ny[0] * s,     1.0 - (ny[1] * s), 
            ny[0] * s + s, 1.0 - (ny[1] * s),
            ny[0] * s + s, 1.0 - (ny[1] * s + s),
            ny[0] * s,     1.0 - (ny[1] * s + s), 

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
