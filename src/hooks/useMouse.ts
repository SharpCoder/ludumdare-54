import {
    m4,
    type Engine,
    type Sphere,
    sphereRectCollision,
} from 'webgl-engine';
import type { GameProps } from '../main';

const MAX_VEL = 12.0;
let vx = 0.0,
    vy = 0.0;

export function useMouse(engine: Engine<GameProps>) {
    const { gl } = engine;
    const { camera } = engine.activeScene;

    if (engine.properties.activePuzzle !== 'none') return;

    // Calculate camera details
    const hx = gl.canvas.width / 2;
    const hy = gl.canvas.height / 2;

    const mx = hx - engine.mousex;
    const my = hy - engine.mousey;

    camera.rotation[1] = 2 * Math.PI * (mx / hx);
    // camera.rotation[0] = Math.max(Math.PI * (my / hy), 0);

    if (engine.keymap['w']) {
        vy = Math.max(vy - 2.8, -MAX_VEL);
    } else if (engine.keymap['s']) {
        vy = Math.min(vy + 2.8, MAX_VEL);
    }

    if (engine.keymap['d']) {
        vx = Math.min(vx + 2.8, MAX_VEL);
    } else if (engine.keymap['a']) {
        vx = Math.max(vx - 2.8, -MAX_VEL);
    }

    if (vy > 1.5) {
        vy -= 0.7;
    } else if (vy < -1.5) {
        vy += 0.7;
    } else {
        vy = 0;
    }

    if (vx > 1.5) {
        vx -= 0.7;
    } else if (vx < -1.5) {
        vx += 0.7;
    } else {
        vx = 0;
    }

    // Create a matrix
    const matrix = m4.combine([
        m4.rotateZ(camera.rotation[2]),
        m4.rotateY(camera.rotation[1]),
        m4.rotateX(camera.rotation[0]),
        m4.translate(vx, 0, vy),
    ]);

    const nextX = camera.position[0] + matrix[12];
    const nextY = camera.position[1];
    const nextZ = camera.position[2] - matrix[14];

    // Check if we are colliding with anything.
    let collision = false;
    const cameraSphere: Sphere = {
        x: nextX,
        y: nextY,
        z: nextZ,
        radius: 50,
    };

    for (const obj of engine.activeScene.objects) {
        if (obj.computeBbox && obj.allowClipping !== true && obj._bbox) {
            const [isColliding, dist] = sphereRectCollision(
                cameraSphere,
                obj._bbox
            );

            if (isColliding) {
                collision = true;
                break;
            }
        }
    }

    if (!collision) {
        camera.position[0] = nextX;
        camera.position[1] = nextY;
        camera.position[2] = nextZ;
    }
}
