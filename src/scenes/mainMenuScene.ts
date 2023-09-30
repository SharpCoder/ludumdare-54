import { DefaultShader, Flatten, Repeat, Scene, cuboid } from 'webgl-engine';
import type { Obj3d } from 'webgl-engine';

export const MainMenuScene = new Scene<unknown>({
    title: 'Main Menu',
    shaders: [DefaultShader],
    once: (engine) => {},
    update: (time, engine) => {},
    init: (engine) => {
        engine.settings.fogColor = [1, 1, 1, 1];
        const { camera } = MainMenuScene;

        camera.setZ(-600);
    },
    status: 'ready',
});
