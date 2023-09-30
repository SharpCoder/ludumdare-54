import type { Engine } from 'webgl-engine';

export function updateText(engine: Engine<unknown>, text: string) {
    // @ts-ignore
    engine.properties['clueText'] = text;
}

export function removeText(engine: Engine<unknown>, text: string) {
    // @ts-ignore
    if (engine.properties['clueText'] === text) {
        // @ts-ignore
        engine.properties['clueText'] = '';
    }
}
