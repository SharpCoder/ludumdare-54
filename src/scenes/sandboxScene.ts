import { Scene } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import { loadMap } from '../map';
import { DefaultShader } from '../shaders/default';
import { spawnClue } from '../objects/clue';

export const SandboxScene = new Scene<unknown>({
    title: 'Sandbox Scene',
    shaders: [DefaultShader],
    once: (engine) => {
        const map = [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
        ];

        // Populate the map
        const roomList = loadMap(map);
        for (const room of roomList) {
            SandboxScene.addObject(room);
        }

        // Position the camera in the first room
        const firstRoom = roomList[0];
        SandboxScene.camera.position = [...firstRoom.position];

        const { def } = firstRoom.properties as any;
        if (def) {
            const clue = spawnClue({
                x: firstRoom.position[0],
                z: firstRoom.position[2] - 400,
                text: 'The password is uryyb',
            });

            SandboxScene.addObject(clue);
        }
    },
    update: (time, engine) => {
        useMouse(engine);
    },
    init: (engine) => {
        const { gl } = engine;
        engine.settings.fogColor = [0, 0, 0, 1];
        gl.blendFunc(gl.SRC_COLOR, gl.SRC_ALPHA_SATURATE);
        // gl.blendFunc(gl.CONSTANT_COLOR, gl.DST_COLOR);

        const { camera } = SandboxScene;
        camera.setY(-250);
    },
    status: 'ready',
});
