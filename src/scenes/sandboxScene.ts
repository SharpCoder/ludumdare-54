import { DefaultShader, Scene } from 'webgl-engine';
import { useMouse } from '../hooks/useMouse';
import { createRoom, type RoomDef } from '../map';

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
    },
    status: 'initializing',
});

const MainRoom: RoomDef = {
    w: 1500,
    h: 1500,
    ceiling: 800,
    doorWidth: 250,
    doorways: ['S'],
};

SandboxScene.addObject(createRoom(MainRoom));
SandboxScene.status = 'ready';
