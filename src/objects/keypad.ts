import { rads, zeros, type Drawable } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export type KeypadDef = {
    x: number;
    z: number;
};

export function spawnKeypad(def: KeypadDef) {
    const keypad = getModel('keypad.obj');

    const [w, h, d] = computeDimensions(keypad.vertexes);
    const container: Drawable = {
        name: 'keypad',
        vertexes: [],
        position: [def.x, 0, def.z],
        offsets: zeros(),
        rotation: zeros(),
        children: [],
    };

    container.children?.push({
        name: 'keypad',
        ...keypad,
        position: zeros(),
        rotation: [rads(0), rads(180), rads(0)],
        offsets: [-w / 2, -h / 2, -d / 2],
        scale: [40, 40, 40],
        update: function (time, engine) {
            const x = def.x - w / 2;
            const z = def.z - d / 2;
            const dist = distanceToCamera(engine, x, z);
            const msg = 'Press space to enter the code';

            if (dist < 300) {
                updateText(engine, msg);
                if (engine.keymap[' ']) {
                    // @ts-ignore
                    engine.properties.activePuzzle = 'keypad';
                }

                // @ts-ignore
            } else if (engine.properties['clueText'] === msg) {
                removeText(engine, msg);
            }
        },
    });

    return container;
}
