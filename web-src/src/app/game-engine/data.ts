

export class KeyFrameTrack {
    name: string;
    times: number[];
    values: number[];
    interpolation: THREE.InterpolationModes;
}

export class AnimationClip {    
    name: string;
    duration: number;
    tracks: KeyFrameTrack[];
}

export class Mesh
{
    name: string

    offset: number[];
    position: number[];
    scale: number[];
    rotation: number[];

    nx: number[];
    px: number[];
    ny: number[];
    py: number[];
    nz: number[];
    pz: number[];
}

export class CharacterModel
{
    name: string;
    meshes: Mesh[];
    clipes: AnimationClip[];
    diffusedTex: string;
}


//////////////////////////////////////////////////
export class Metadata {
    version: number;
    generatedBy: string;
}

export class Node {
    name: string;
    parent: string;

    translation: number[];   //x,y,z
    rotation: number[]; //quaternion;
    scale: number[];   //x,y,z

    vertices: number[];
    normals: number[];
    tex1: number[];    
    faces: number[];

    matId: number;    
}

export class Material {
    id: number;
    diffusedCol: number[];
    diffusedTex: string;
}

export class Camera {

}

export class Model {
    metadata: Metadata;
    camera: Camera;
    nodes: Node[];
    materials: Material[];    
    clip: AnimationClip;
}
