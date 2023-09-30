import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type TreeDef = {
    x: number;
    z: number;
    scale: number;
};

export function spawnTree(def: TreeDef) {
    const temple = getModel('tree.obj');
    const scale = 300;

    const [w, h, d] = computeDimensions(temple.vertexes);
    const container: Drawable = {
        name: 'tree_container',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'tree',
        ...temple,
        position: zeros(),
        rotation: [rads(0), rads(0), rads(0)],
        offsets: [-(w * scale) / 2, 300 - (h * scale) / 2, 0],
        scale: [scale, scale, scale],
    });

    return container;
}
