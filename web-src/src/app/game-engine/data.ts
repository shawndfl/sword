
export class Metadata {
    version: number;
    generatedBy: string;
}


export class KeyFrameTrack {
    name: string;
    times: number[];
    values: any[];    
    interpolation: THREE.InterpolationModes;
}

export class AnimationClip {    
    name: String;
    duration: number;
    tracks: KeyFrameTrack[];
}

export class Node {
    name: string;
    parent: string;

    translation: number[];   //x,y,z
    rotation: number[]; //quaternion;
    scale: number[];   //x,y,z

    vertices: number[];
    tex1: number[];    
    faces: number[];

    matId: number;

    clip: AnimationClip;
}

export class Material {
    id: number;
    diffusedCol: number[];
    diffusedTex: string;
}

export class Model {
    metadata: Metadata;
    nodes: Node[];
    materials: Material[];    
}