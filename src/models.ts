import { loadModel, type Drawable, type ParsedModel } from 'webgl-engine';

const assetList = [
    './assets/table.obj',
    './assets/paper.obj',
    './assets/keypad.obj',
    './assets/tree.obj',
    './assets/pillar.obj',
    './assets/flashlight.obj',
    './assets/book.obj',
    './assets/bookshelf.obj',
];
const models: Record<string, ParsedModel> = {};

function fileName(path: string): string {
    return path.substring(path.lastIndexOf('/') + 1);
}

export function initializeModels() {
    return new Promise<void>(async (resolve) => {
        for (const asset of assetList) {
            models[fileName(asset)] = await loadModel(asset, 'obj', true);
        }

        resolve();
    });
}

export function getModel(name: string): ParsedModel {
    return models[name];
}
