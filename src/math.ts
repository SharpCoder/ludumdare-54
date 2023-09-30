import { type bbox, type Drawable, m4, Engine } from 'webgl-engine';

export function computePositionMatrix(obj: Drawable): number[] {
    // Calculate the position of all the vertexes for
    // this object.
    const scaleX = obj.scale?.[0] ?? 1.0;
    const scaleY = obj.scale?.[1] ?? 1.0;
    const scaleZ = obj.scale?.[2] ?? 1.0;

    // console.log({ scaleX });
    let positionMatrixes = [
        m4.translate(obj.position[0], -obj.position[1], -obj.position[2]),
        m4.rotateX(obj.rotation[0]),
        m4.rotateY(obj.rotation[1]),
        m4.rotateZ(obj.rotation[2]),
    ];

    if (obj.additionalMatrix) {
        positionMatrixes.push([...obj.additionalMatrix]);
    }

    positionMatrixes.push(
        m4.translate(obj.offsets[0], obj.offsets[1], obj.offsets[2])
    );
    positionMatrixes.push(m4.scale(scaleX, scaleY, scaleZ));

    return m4.combine(positionMatrixes);
}

export function computeBbox(obj: Drawable): bbox {
    const positionMatrix = computePositionMatrix(obj);

    const scaleX = obj.scale?.[0] ?? 1.0;
    const scaleY = obj.scale?.[1] ?? 1.0;
    const scaleZ = obj.scale?.[2] ?? 1.0;

    // Calculate the dimensions
    const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
    const vertexes = obj.vertexes;

    // Calculate the bounding box based on the vertexes
    for (let r = 0; r < vertexes.length / 3; r += 1) {
        for (let i = 0; i < 3; i++) {
            const axis = vertexes[r * 3 + i];
            if (min[i] > axis) {
                min[i] = axis;
            }
            if (max[i] < axis) {
                max[i] = axis;
            }
        }
    }

    const width = (max[0] - min[0]) * scaleX;
    const height = (max[1] - min[1]) * scaleY;
    const depth = (max[2] - min[2]) * scaleZ;

    // Calculate the bounding box of the shape
    // based on the rotations being applied.
    let bboxMatrixes = [
        m4.rotateZ(obj.rotation[2]),
        m4.rotateY(obj.rotation[1]),
        m4.rotateX(obj.rotation[0]),
        m4.translate(
            width + obj.offsets[0],
            height + obj.offsets[1],
            depth + obj.offsets[2]
        ),
        m4.scale(scaleX, scaleY, scaleZ),
    ];

    const bboxMatrix = m4.combine(bboxMatrixes);

    // Generate the bounding box property
    // with the absolute final position and
    // dimensions relative to orientation in
    // 3d space.
    return {
        x: positionMatrix[12],
        y: -positionMatrix[13],
        z: -positionMatrix[14],
        w: bboxMatrix[12],
        h: bboxMatrix[13],
        d: bboxMatrix[14],
    };
}

export function computeDimensions(vertexes: number[]) {
    const min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    const max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

    // Calculate the bounding box based on the vertexes
    for (let r = 0; r < vertexes.length / 3; r += 1) {
        for (let i = 0; i < 3; i++) {
            const axis = vertexes[r * 3 + i];
            if (min[i] > axis) {
                min[i] = axis;
            }
            if (max[i] < axis) {
                max[i] = axis;
            }
        }
    }

    const width = max[0] - min[0];
    const height = max[1] - min[1];
    const depth = max[2] - min[2];

    return [width, height, depth];
}

export function distanceToCamera(
    engine: Engine<unknown>,
    x: number,
    z: number
) {
    const { camera } = engine.activeScene;
    return Math.sqrt(
        Math.pow(camera.position[0] - x, 2) +
            Math.pow(camera.position[2] - z, 2)
    );
}
