import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

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
            // Calculate distance
            const x = this._computed?.positionMatrix?.[12] ?? 0;
            const z = this._computed?.positionMatrix?.[14] ?? 0;
            const dist = distanceToCamera(engine, x, -z);

            if (dist < 300) {
                updateText(engine, def.text);
                // @ts-ignore
            } else if (engine.properties['clueText'] === def.text) {
                removeText(engine, def.text);
            }
        },
    });

    return container;
}
