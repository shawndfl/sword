
/////////////////////////////////////////////////////////////
//              Models
/////////////////////////////////////////////////////////////
export class KeyFrameTrack {
    name: string;
    times: number[];
    values: number[];
    interpolation: string;
}

export class AnimationClip {    
    name: string;
    duration: number;
    tracks: KeyFrameTrack[];
}

export class Mesh
{
    name: string;
    parent: string;
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

export class Model
{
    name: string;
    meshes: Mesh[];
    clipes: AnimationClip[];
    diffusedTex: string;
}

export class Character {
    position: number[];
    moveSpeed: number;
    rotateSpeed: number;
    health: number;

    model: Model;
}

/////////////////////////////////////////////////////////////
//              Tarrain
/////////////////////////////////////////////////////////////
export class Terrain {
    rows : number;
    columns : number;
    scale: number;
    texture1: string;
}

export class Level {
    seed: number;
    terrain: Terrain;
    character: Character;
}

/////////////////////////////////////////////////////////////
//              Consts
/////////////////////////////////////////////////////////////
export const NO_SWORD = 0
