import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions } from '../math';
import { getModel } from '../models';

export type ClueDef = {
    text: string;
    x: number;
    z: number;
};

export function spawnClue(def: ClueDef) {
    const table = getModel('table.obj');
    const paper = getModel('paper.obj');

    const [paperW, paperH, paperD] = computeDimensions(paper.vertexes);
    const [tableW, tableH, tableD] = computeDimensions(table.vertexes);

    const container: Drawable = {
        name: 'room_populus',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'table',
        ...table,
        position: zeros(),
        rotation: zeros(),
        offsets: [-tableW / 2, -tableH / 2, -tableD / 2],
        scale: [200, 200, 200],
    });

    container.children?.push({
        name: 'note',
        ...paper,
        position: [0, -tableH * 200, 0],
        rotation: [0, rads(90), 0],
        offsets: [-paperW / 2, -paperH / 2, -paperD / 2],
        scale: [25, 25, 25],
        update: function (time, engine) {
            const { camera } = engine.activeScene;
            // Calculate distance
            const dist = Math.sqrt(
                Math.pow(camera.position[0] - def.x, 2) +
                    Math.pow(camera.position[2] - def.z, 2)
            );

            if (dist < 300) {
                // @ts-ignore
                engine.properties['clueText'] = def.text;
                // @ts-ignore
            } else if (engine.properties['clueText'] === def.text) {
                // @ts-ignore
                engine.properties['clueText'] = '';
            }
        },
    });

    return container;
}
