import { rads, Scene } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import { loadMap, type RoomDef } from '../map';
import { DefaultShader } from '../shaders/default';
import { spawnClue } from '../objects/clue';
import { spawnKeypad } from '../objects/keypad';
import { getModel } from '../models';
import { spawnPillar } from '../objects/pillar';
import { spawnTree } from '../objects/tree';
import { distanceToCamera } from '../math';
import { spawnGrass } from '../objects/grass';

export const TempleScene = new Scene<unknown>({
    title: 'Temple Scene',
    shaders: [DefaultShader],
    once: (engine) => {
        const map = [
            [1, 1, 0, 0, 0],
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
            TempleScene.addObject(room);
        }

        // Position the camera in the first room
        const firstRoom = roomList[0];
        // TempleScene.camera.position = [...firstRoom.position];

        const { def } = firstRoom.properties as { def: RoomDef };

        TempleScene.addObject(spawnPillar({ x: -300, z: def.h / 2 + 50 }));
        TempleScene.addObject(spawnPillar({ x: 300, z: def.h / 2 + 50 }));

        TempleScene.camera.position = [0, 0, def.h / 2 + 1000];
        TempleScene.camera.rotateX(rads(180));

        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1500 - Math.random() * 1500;
            const z = def.h / 2 + 1500 + Math.random() * 1500;

            if (distanceToCamera(engine, x, z) < 350) continue;
            TempleScene.addObject(
                spawnTree({ x, z, scale: Math.random() * 150 })
            );
        }

        TempleScene.addObject(spawnGrass({ w: 10000, d: 10000, x: 0, z: 0 }));
    },
    update: (time, engine) => {
        const { gl } = engine;
        useMouse(engine);
    },
    init: (engine) => {
        engine.settings.fogColor = [0, 0, 0, 1];
        // engine.settings.fogColor = [1, 1, 1, 1];

        const { camera } = TempleScene;
        camera.setY(-250);
        camera.setX(150);
    },
    status: 'ready',
});
