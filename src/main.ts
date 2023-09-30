import './app.css';
import App from './App.svelte';
import { Engine } from 'webgl-engine';
import { SandboxScene } from './scenes/sandboxScene';
import { initializeModels } from './models';
import { TempleScene } from './scenes/templeScene';

export type ActivePuzzle = 'none' | 'keypad';
export type GameProps = {
    clueText?: string;
    activePuzzle?: ActivePuzzle;
};

const engine = new Engine<GameProps>();

engine.properties.activePuzzle = 'none';

// @ts-ignore
window['gameEngine'] = engine;
engine.setReady('initialize');

// Initialize models
initializeModels().then(() => {
    // TODO: Manage scenes
    // engine.addScene(TempleScene);
    engine.addScene(SandboxScene);

    setTimeout(() => {
        function draw() {
            engine.draw();
            requestAnimationFrame(draw.bind(engine));
        }

        function update() {
            engine.update();
            requestAnimationFrame(update.bind(engine));
        }

        draw();
        update();

        engine.setReady('ready');
    }, 500);
});

const app = new App({
    target: document.getElementById('app') ?? document.createElement('div'),
});

export default app;
