

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
