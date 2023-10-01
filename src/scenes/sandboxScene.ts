import { Scene } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import { loadMap, type RoomDef } from '../map';
import { DefaultShader } from '../shaders/default';
import { spawnClue } from '../objects/clue';
import { spawnKeypad } from '../objects/keypad';
import { spawnFlashlight } from '../objects/flashlight';
import { spawnBookshelf } from '../objects/bookshelf';
import { spawnVase } from '../objects/vase';

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
        const roomList = loadMap({ x: 0, z: 0 }, map);
        for (const room of roomList) {
            SandboxScene.addObject(room);
        }

        // Position the camera in the first room
        const firstRoom = roomList[0];
        SandboxScene.camera.position = [...firstRoom.position];

        const { def } = firstRoom.properties as { def: RoomDef };

        // @ts-ignore
        engine.properties['def'] = def;

        if (def) {
            const clue = spawnClue({
                x: firstRoom.position[0],
                z: firstRoom.position[2] - 900,
                text: 'uryyb',
            });

            SandboxScene.addObject(clue);

            // Add the keypad
            const keypad = spawnKeypad({
                x: firstRoom.position[0] + def.w / 2,
                z: firstRoom.position[2] - def.h / 6,
            });

            keypad.offsets[1] = 300;
            SandboxScene.addObject(keypad);
        }

        SandboxScene.addObject(spawnFlashlight());

        SandboxScene.addObject(
            spawnVase({
                x: firstRoom.position[0],
                z: firstRoom.position[2] + 800,
            })
        );
        // SandboxScene.addObject(
        //     spawnBookshelf({
        //         x: firstRoom.position[0],
        //         z: firstRoom.position[2] + 900,
        //     })
        // );
    },
    update: (time, engine) => {
        const { gl } = engine;
        useMouse(engine);
    },
    init: (engine) => {
        engine.settings.fogColor = [0, 0, 0, 1];

        const { camera } = SandboxScene;
        camera.setY(-250);
    },
    status: 'ready',
});
