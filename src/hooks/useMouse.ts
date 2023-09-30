import type { Engine } from 'webgl-engine';

const MAX_VEL = 12.0;
let vx = 0.0,
    vy = 0.0;

export function useMouse(engine: Engine<unknown>) {
    const { gl } = engine;
    const { camera } = engine.activeScene;

    // Calculate camera details
    const hx = gl.canvas.width / 2;
    const hy = gl.canvas.height / 2;

    const mx = hx - engine.mousex;
    const my = hy - engine.mousey;

    camera.rotation[1] = 2 * Math.PI * (mx / hx);
    camera.rotation[0] = Math.max(Math.PI * (my / hy), -Math.PI / 8);

    if (engine.keymap['w']) {
        vy = Math.min(vy + 2.8, MAX_VEL);
    } else if (engine.keymap['s']) {
        vy = Math.max(vy - 2.8, -MAX_VEL);
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

    camera.position[0] += vx;
    camera.position[2] += vy;
}
