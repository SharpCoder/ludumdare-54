import { rads, zeros, type Drawable, m4 } from 'webgl-engine';
import { computeDimensions, distanceToCamera } from '../math';
import { getModel } from '../models';
import { removeText, updateText } from '../utils';

export function spawnFlashlight() {
    const flashlight = getModel('flashlight.obj');

    const scale = 10;
    const [w, h, d] = computeDimensions(flashlight.vertexes);
    console.log(w, h, d);
    const container: Drawable = {
        name: 'flashlight',
        ...flashlight,
        position: zeros(),
        rotation: [-rads(45), rads(0), rads(0)],
        offsets: [-w / 2, -h / 2, -d / 2],
        scale: [scale, scale, scale],
        update: function (time, engine) {
            const { camera } = engine.activeScene;
            const mat = m4.combine([
                m4.translate(
                    camera.position[0],
                    -camera.position[1],
                    -camera.position[2]
                ),
                m4.rotateZ(camera.rotation[2]),
                m4.rotateY(camera.rotation[1]),
                m4.rotateX(camera.rotation[0]),
                // camera.getMatrix(),
                m4.translate(0, -12, -30),
            ]);

            // this.rotation[1] += rads(1);
            // this.rotation[2] += rads(1);
            // this.rotation[0] -= rads(1);
            this.rotation = [camera.rotation[0], camera.rotation[1], 0];
            this.position = [mat[12], -mat[13], -mat[14]];
            // console.log(this.position);
            // this.position[2] += 50;
        },
    };

    return container;
}
