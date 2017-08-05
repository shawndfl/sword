import * as THREE from 'three';
import * as DATA from '../game-engine/data';

export class EnvornmentGraphics {
    public root: THREE.Object3D;

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
            var envData: DATA.Terrain = JSON.parse(json);

            this.buildFromData(envData);
            scene.add(this.root);
            onLoad(envData);
        }, onProgress, onError);
    }

    private buildFromData(envData: DATA.Terrain) {
        this.root = new THREE.Object3D();
        this.root.name = "terrain";

        // Set material
        var textue = envData.texture1;
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;
        diffused.wrapT = THREE.RepeatWrapping;
        diffused.magFilter = THREE.NearestFilter;
        diffused.minFilter = THREE.NearestMipMapNearestFilter;

        var material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(1.0, 1.0, 1.0);
        material.shininess = 100.0;
        material.specular = new THREE.Color(1.0, 1.0, 1.0);
        material.transparent = false;
        material.map = diffused;

        material.wireframe = false;
        var terrain = new TerrainGeometry().
            setSize(envData.terrain[0], envData.terrain[1], envData.terrain[2]).
            buildTerrain();
        var geo = terrain;
        var mesh = new THREE.Mesh(geo, material);

        this.root.add(mesh);
    }
}

/**
 * Calculates the uv coords for a face
 * @param x 0 based row
 * @param y 0 based col
 */
function calculateUV(x: number, y: number): number[] {
    var s = 0.0625;
    return [
        x * s, 1.0 - (y * s),
        x * s + s, 1.0 - (y * s),
        x * s + s, 1.0 - (y * s + s),
        x * s, 1.0 - (y * s + s)
    ]
}

export class TerrainGeometry extends THREE.BufferGeometry {

    private cellSize: number = 10;
    private rowCount: number = 10;
    private colCount: number = 10;

    public buildTerrain(): TerrainGeometry {
        var vertices = [];
        var normals = [];
        var tex1 = [];
        var faces = [];

        var gridHeight: number[][] = [[]];
        var vertCount = 0;

        //Use this as a component in the normal vector.
        //This will only work if each cell is moves up or
        //down in steps of (+-cellsize).
        var axis = -0.70710678118654752440084436210485;
        var rowCount = this.rowCount;
        var colCount = this.colCount;
        var cellSize = this.cellSize;

        //Build the rows one quad at a time. 
        for (var row = -rowCount; row < rowCount; row++) {

            for (var col = -colCount; col < colCount; col++) {

                //calcuate verts
                var x = cellSize * row;
                var y = 0;  //this value will change in calculateHeightFromNearVerts
                var z = cellSize * col;
                vertices.push(x, y, z + cellSize);
                vertices.push(x + cellSize, y, z + cellSize);
                vertices.push(x + cellSize, y, z);
                vertices.push(x, y, z);
                //this.calculateHeightFromNearVerts(row, col, vertices);

                //calculate uv textures
                calculateUV(0, 0).forEach(num => { tex1.push(num) });

                var normal = [0, 1, 0];

                //same normal for all 4 verts
                normals.push(normal[0], normal[1], normal[2]);
                normals.push(normal[0], normal[1], normal[2]);
                normals.push(normal[0], normal[1], normal[2]);
                normals.push(normal[0], normal[1], normal[2]);

                // makes faces
                var a = vertCount + 0;
                var b = vertCount + 1;
                var c = vertCount + 2;
                var d = vertCount + 3;
                faces.push(a, b, d);
                faces.push(b, c, d);

                //store height
                //gridHeight[row][col] = 0;

                //increment verts
                vertCount += 4;
            }
        }
        this.setIndex(new THREE.BufferAttribute(new Uint16Array(faces), 1));
        this.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(tex1), 2));
        this.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

        return this;
    }

    public constructor() {
        super();
    }

    public setSize(cellSize: number, rowCount: number, colCount: number): TerrainGeometry {
        this.cellSize = cellSize;
        this.rowCount = rowCount;
        this.colCount = colCount;
        return this;
    }

    private calculateHeightFromNearVerts(row: number, col: number, vertices: number[]) {

        var sz = vertices.length;

        //go back 4 vert each has x,y,z component
        var cell = sz - 4 * 3;
        //we want the offset of the Y component of each vert.
        // index * 3 components and Y is the "1" component
        var s0 = 0 * 3 + 1;
        var s1 = 1 * 3 + 1;
        var s2 = 2 * 3 + 1;
        var s3 = 3 * 3 + 1;
        var a = vertices[cell + s0];
        var b = vertices[cell + s1];
        var c = vertices[cell + s2];
        var d = vertices[cell + s3];
        var h = this.getHeight();        //this.cellSize;//

        //left cell
        var lCell = sz - 8 * 3;
        //top cell
        var tCell = sz - ((4 * 3) * 2 * this.rowCount) - (4 * 3);

        // if we are in the conner return what ever we want
        if (row == -this.rowCount && col == -this.colCount) {
            vertices[cell + s0] = h;
            vertices[cell + s1] = h;
            vertices[cell + s2] = h;
            vertices[cell + s3] = h;
        }

        else if (row == -this.rowCount) {
            //prevent peaks
            if (vertices[lCell + s1] != vertices[lCell + s2]) {
                vertices[cell + s0] = vertices[lCell + s1];
                vertices[cell + s1] = vertices[lCell + s1];
                vertices[cell + s2] = vertices[lCell + s1];
                vertices[cell + s3] = vertices[lCell + s0];
            }
            //change height
            else {
                vertices[cell + s0] = h;
                vertices[cell + s1] = h
                vertices[cell + s2] = vertices[lCell + s1];
                vertices[cell + s3] = vertices[lCell + s0];
            }
        }
        else if (col == -this.colCount) {
            //prevent peaks
            if (vertices[tCell + s0] != vertices[tCell + s1]) {
                vertices[cell + s0] = vertices[tCell + s1];
                vertices[cell + s1] = vertices[tCell + s1];
                vertices[cell + s2] = vertices[tCell + s1];
                vertices[cell + s3] = vertices[tCell + s1];
            }
            //change height
            else {
                vertices[cell + s0] = vertices[tCell + s1];
                vertices[cell + s1] = h;
                vertices[cell + s2] = h;
                vertices[cell + s3] = vertices[tCell + s2];
            }
        }
        else {
            if (vertices[tCell + s0] != vertices[tCell + s1]) {
                vertices[cell + s0] = vertices[tCell + s1];
                vertices[cell + s1] = vertices[tCell + s1];
                vertices[cell + s2] = vertices[tCell + s1];
                vertices[cell + s3] = vertices[tCell + s1];
            }
            else {
                vertices[cell + s0] = vertices[tCell + s1];
                vertices[cell + s1] = vertices[tCell + s1];
                vertices[cell + s2] = vertices[lCell + s1];
                vertices[cell + s3] = vertices[tCell + s2];
            }
        }

    }

    private getHeight(): number {
        var weight = .9;
        var scale = .5;
        var num = Math.random();
        if (num <= 0.33)
            return -this.cellSize * scale;
        else if (num >= .33 && num <= .66)
            return 0;
        else //if  (num >= .66) 
            return this.cellSize * scale;
    }
}

/**
 * The model for the character
 */
export class Model extends THREE.Object3D {

    //animation 
    private mixer: THREE.AnimationMixer;
    private animationClip: { [id: string]: THREE.AnimationClip } = {};

    /**
     * Loads the meshes, animations, and textures from a json file.    
     */   
    public Initialize(model: DATA.Model) {
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

            var geo: CubeGeometry = new CubeGeometry(
                meshData.offset,
                meshData.nx,
                meshData.px,
                meshData.ny,
                meshData.py,
                meshData.nz,
                meshData.pz
            );

            var mesh: CubeMesh = new CubeMesh(geo, material);
            mesh.name = meshData.name;

            mesh.position.set(meshData.position[0], meshData.position[1], meshData.position[2]);
            mesh.scale.set(meshData.scale[0], meshData.scale[1], meshData.scale[2]);

            // Add mesh
            if (meshData.parent == undefined) {
                this.add(mesh);
            }
            else {
                this.traverse((object: THREE.Object3D) => {
                    if (object.name == meshData.parent) {
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

    public walk(): THREE.AnimationAction {

        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['walk']);
        return action;
    }

    public idle(): THREE.AnimationAction {
        var action: THREE.AnimationAction = this.mixer.clipAction(this.animationClip['idle']);
        return action;
    }

    public getActionFromClip(clip: string) {
        return this.mixer.clipAction(this.animationClip[clip]);
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

export class CubeGeometry extends THREE.BufferGeometry {

    public constructor(offset: number[],
        nx: number[],
        px: number[],
        ny: number[],
        py: number[],
        nz: number[],
        pz: number[]) {
        super();

        var vertices = [
            -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,            //Front
            0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,            //Left
            0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,        //Back
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,        //Right
            -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,            //Top
            -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5         //Bottom
        ];

        //offset positions
        for (var i = 0; i < vertices.length; i += 3) {
            vertices[i + 0] += offset[0];
            vertices[i + 1] += offset[1];
            vertices[i + 2] += offset[2];
        }

        var normals = [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,                 //Front
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,                 //Left
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,             //Back
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,             //Right
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,                 //Top
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0              //Bottom
        ];

        var tex1 = [];
        calculateUV(pz[0], pz[1]).forEach(num => { tex1.push(num) });
        calculateUV(px[0], px[1]).forEach(num => { tex1.push(num) });
        calculateUV(nz[0], nz[1]).forEach(num => { tex1.push(num) });
        calculateUV(nx[0], nx[1]).forEach(num => { tex1.push(num) });
        calculateUV(py[0], py[1]).forEach(num => { tex1.push(num) });
        calculateUV(ny[0], ny[1]).forEach(num => { tex1.push(num) });

        var faces = [
            0, 3, 1, 3, 2, 1,                   //Front
            4, 7, 5, 7, 6, 5,                   //Left
            8, 11, 9, 11, 10, 9,                //Back
            12, 15, 13, 15, 14, 13,             //Right
            16, 19, 17, 19, 18, 17,             //Top
            20, 23, 21, 23, 22, 21              //Bottom
        ]

        this.setIndex(new THREE.BufferAttribute(new Uint16Array(faces), 1));
        this.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(tex1), 2));
        this.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    }
}

export class GeoBuilder {
    private vertices: number[] = [];
    private tex1: number[] = [];
    private normals: number[] = [];
    private faces: number[] = [];
    private _offset: number[] = [0, 0, 0];
    private negate: boolean;

    public offset(x, y, z): GeoBuilder {
        this._offset[0] = x; this._offset[1] = y; this._offset[2] = z;
        return this;
    }

    public faceOut(): GeoBuilder {
        this.negate = false;
        return this;
    }
    public faceIn(): GeoBuilder {
        this.negate = true;
        return this;
    }
    public nx(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 0] = -this.vertices[i + 0];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];

        }
        this.normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public px(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 0] = -this.vertices[i + 0];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];
        }
        this.normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public ny(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 1] = -this.vertices[i + 1];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];
        }
        this.normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public py(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 1] = -this.vertices[i + 1];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];
        }
        this.normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public nz(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 2] = -this.vertices[i + 2];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];
        }
        this.normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public pz(u, v): GeoBuilder {
        var start = this.vertices.length;
        this.vertices.push(-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5);
        for (var i = start; i < this.vertices.length; i += 3) {
            if (this.negate)
                this.vertices[i + 2] = -this.vertices[i + 2];
            this.vertices[i + 0] += this._offset[0];
            this.vertices[i + 1] += this._offset[1];
            this.vertices[i + 2] += this._offset[2];
        }
        this.normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
        calculateUV(u, v).forEach(num => { this.tex1.push(num) });
        var s = start / 3;
        this.faces.push(s + 0, s + 3, s + 1, s + 3, s + 2, s + 1);
        return this;
    }

    public build(): THREE.BufferGeometry {
        var buffer = new THREE.BufferGeometry();

        buffer.setIndex(new THREE.BufferAttribute(new Uint16Array(this.faces), 1));
        buffer.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.vertices), 3));
        buffer.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.tex1), 2));
        buffer.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.normals), 3));
        return buffer;
    }

}


export class CubeMesh extends THREE.Mesh {
    private pzOffset: number = 8 * 0;
    private pxOffset: number = 8 * 1;
    private nzOffset: number = 8 * 2;
    private nxOffset: number = 8 * 3;
    private pyOffset: number = 8 * 4;
    private nyOffset: number = 8 * 5;

    private rowCount = 16;

    // Used to animate the diffused texture
    get pz(): number {

        var geo: THREE.BufferGeometry = <THREE.BufferGeometry>this.geometry;
        var uvAttribute: THREE.BufferAttribute = <THREE.BufferAttribute>geo.getAttribute("uv");
        var xy = [uvAttribute.getX(this.pzOffset), uvAttribute.getY(this.pzOffset)];
        var index = xy[1] * this.rowCount + xy[1];
        return index;
    }

    // Used to animate the diffused texture
    set pz(value: number) {
        var x = Math.floor(value) % this.rowCount;
        var y = Math.floor(value / this.rowCount);

        var values = calculateUV(x, y);
        var geo: THREE.BufferGeometry = <THREE.BufferGeometry>this.geometry;
        var uvAttribute: THREE.BufferAttribute = <THREE.BufferAttribute>geo.getAttribute("uv");
        uvAttribute.needsUpdate = true;
        uvAttribute.set(values, this.pzOffset);
    }
    //TODO Add properties for the other 5 faces of the cube

    public constructor(geometry: CubeGeometry, material: THREE.Material) {
        super(geometry, material);
    }
}


export class Sword extends THREE.Mesh {

}
