import { v4 as uuidv4 } from 'uuid';
import {
    DefaultShader,
    Flatten,
    Repeat,
    Scene,
    computePositionMatrix,
    cuboid,
    m4,
    rads,
    zeros,
} from 'webgl-engine';
import type { Drawable, bbox } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import { computeBbox } from '../math';

export const SandboxScene = new Scene<unknown>({
    title: 'Sandbox Scene',
    shaders: [DefaultShader],
    once: (engine) => {},
    update: (time, engine) => {
        useMouse(engine);
    },
    init: (engine) => {
        engine.settings.fogColor = [1, 1, 1, 1];
        const { camera } = SandboxScene;

        camera.setY(-50);
        camera.setX(-500);
        camera.setZ(-500);
    },
    status: 'initializing',
});

const colors = [
    [253, 231, 37],
    [122, 209, 81],
    [34, 168, 132],
    [42, 120, 142],
    [65, 68, 135],
    [68, 1, 84],
];

const segments = [
    { w: 1500, gap: 200, r: 0 },
    { w: 1500, r: 90 },
    { w: 1500, r: 90 },
    { w: 1500, r: 90 },
];

function room(w: number, h: number) {
    const container: Drawable = {
        name: 'room',
        vertexes: [],
        offsets: zeros(),
        position: zeros(),
        rotation: zeros(),
        children: [],
    };

    let r = 0,
        x = 0,
        y = 0,
        z = 0,
        idx = 0;

    for (const segment of segments) {
        r += segment.r;
        const node: Drawable = {
            name: uuidv4(),
            colors: Flatten(Repeat(colors[idx], 36)),
            vertexes: cuboid(segment.w, 450, 1),
            offsets: [-segment.w, 0, 0],
            position: [x, y, z],
            rotation: [0, rads(r), 0],
        };

        const bbox = computeBbox(node);
        x = bbox.x - bbox.w;
        z = bbox.z - bbox.d;

        console.log(idx, bbox);
        idx += 1;

        container.children?.push(node);
    }

    return container;
}

SandboxScene.addObject(room(1000, 1000));
SandboxScene.status = 'ready';
