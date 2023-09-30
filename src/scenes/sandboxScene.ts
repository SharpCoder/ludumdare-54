import { Scene, loadModel, rads, zeros } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import {
    createRoom,
    loadMap,
    type Doorway,
    type RoomDef,
    populateRoom,
} from '../map';
import { DefaultShader } from '../shaders/default';
import { computeDimensions } from '../math';

export const SandboxScene = new Scene<unknown>({
    title: 'Sandbox Scene',
    shaders: [DefaultShader],
    once: (engine) => {},
    update: (time, engine) => {
        useMouse(engine);
    },
    init: (engine) => {
        const { gl } = engine;
        engine.settings.fogColor = [0, 0, 0, 1];
        // engine.settings.fogColor = [1, 1, 1, 1];
        gl.blendFunc(gl.SRC_COLOR, gl.SRC_ALPHA_SATURATE);
        // gl.blendFunc(gl.CONSTANT_COLOR, gl.DST_COLOR);

        const { camera } = SandboxScene;
        camera.setY(-250);
    },
    status: 'ready',
});

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
    populateRoom(def).then((objects) => {
        SandboxScene.addObject(objects);
    });
}
