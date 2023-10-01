import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type VaseDef = {
    x: number;
    z: number;
};

export function spawnVase(def: VaseDef) {
    const vase = getModel('vase.obj');

    const [w, h, d] = computeDimensions(vase.vertexes);
    const container: Drawable = {
        name: 'vase_container',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'vase',
        ...vase,
        position: zeros(),
        rotation: [rads(0), rads(90), rads(0)],
        offsets: [-w / 2, -h / 2, -d / 2],
        scale: [300, 300, 300],
    });

    return container;
}
