import {
    rads,
    zeros,
    type Drawable,
    cuboid,
    Flatten,
    Repeat,
    tex2D,
} from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type GrassDef = {
    x: number;
    z: number;
    w: number;
    d: number;
};

export function spawnGrass(def: GrassDef) {
    const container: Drawable = {
        name: 'grass',
        vertexes: cuboid(def.w, 1, def.d),
        position: [def.x, 0, def.z],
        offsets: [-def.w / 2, -1, -def.d / 2],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/grass.png',
            enabled: true,
        },
        texcoords: Flatten(Repeat(tex2D(def.w / 64 / 6, def.d / 64 / 6), 6)),
        children: [],
    };

    return container;
}
