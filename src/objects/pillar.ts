import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type PillarDef = {
    x: number;
    z: number;
};

export function spawnPillar(def: PillarDef) {
    const pillar = getModel('pillar.obj');

    const [w, h, d] = computeDimensions(pillar.vertexes);
    const container: Drawable = {
        name: 'pillar_container',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'pillar',
        ...pillar,
        position: zeros(),
        rotation: [rads(0), rads(90), rads(0)],
        offsets: [-w / 2, 0, 0],
        scale: [600, 600, 600],
    });

    return container;
}
