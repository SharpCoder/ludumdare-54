import { loadModel, type Drawable } from 'webgl-engine';

const assetList = ['./assets/table.obj', './assets/paper.obj'];
const models: Record<string, Partial<Drawable>> = {};

function fileName(path: string): string {
    return path.substring(path.lastIndexOf('/'));
}

export function initializeModels() {
    return new Promise<void>(async (resolve) => {
        for (const asset of assetList) {
            models[fileName(asset)] = await loadModel(asset, 'obj', true);
        }

        resolve();
    });
}
