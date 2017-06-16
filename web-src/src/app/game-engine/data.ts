
export class Metadata {
    version: number;
    generatedBy: string;    
}

export class Node {
    name: string;
    parent: string;

    translation: THREE.Vector3;
    rotation: THREE.Quaternion;
    scale: THREE.Vector3;

    vertices: number[];
    faces: number[];

    matId: number;
}

export class Material{
    id: number;
    diffusedCol: number[];
    diffusedTxt: string;
}

export class Model {
    metadata: Metadata;    
    nodes: Node[];
    materials: Material[];
}