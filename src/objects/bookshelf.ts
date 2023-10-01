import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type BookshelfDef = {
    x: number;
    z: number;
};

export function spawnBookshelf(def: BookshelfDef) {
    const bookshelf = getModel('bookshelf.obj');

    const [w, h, d] = computeDimensions(bookshelf.vertexes);
    const container: Drawable = {
        name: 'bookshelf_container',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'bookshelf',
        ...bookshelf,
        position: zeros(),
        rotation: [rads(0), rads(90), rads(0)],
        offsets: [-w / 2, -h / 2, -d / 2],
        scale: [600, 600, 600],
    });

    return container;
}
