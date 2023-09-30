import { v4 as uuidv4 } from 'uuid';
import { zeros, type Drawable, cuboid, rads } from 'webgl-engine';
import { computeBbox } from './math';

export type Doorway = 'N' | 'S' | 'E' | 'W';
export type RoomDef = {
    w: number;
    h: number;
    ceiling: number;
    doorWidth: number;
    doorways: Doorway[];
};

export function createRoom(def: RoomDef) {
    const container: Drawable = {
        name: 'room',
        vertexes: [],
        offsets: [def.w / 2, 0, -def.h / 2],
        position: zeros(),
        rotation: zeros(),
        children: [],
    };

    let r = 0,
        x = 0,
        y = 0,
        z = 0,
        idx = 0;

    // Generate the segments
    const segments = [
        {
            w: def.w,
            r: 0,
            gap: def.doorways.includes('N') ? def.doorWidth : undefined,
        },
        {
            w: def.h,
            r: 90,
            gap: def.doorways.includes('E') ? def.doorWidth : undefined,
        },
        {
            w: def.w,
            r: 90,
            gap: def.doorways.includes('S') ? def.doorWidth : undefined,
        },
        {
            w: def.h,
            r: 90,
            gap: def.doorways.includes('W') ? def.doorWidth : undefined,
        },
    ];

    for (const segment of segments) {
        r += segment.r;
        const fakeWall: Drawable = {
            name: uuidv4(),
            vertexes: cuboid(segment.w, 450, 1),
            offsets: [-segment.w, 0, 0],
            position: [x, y, z],
            rotation: [0, rads(r), 0],
        };

        // Compute the children.
        if (segment.gap) {
            const left: Drawable = {
                name: uuidv4(),
                vertexes: cuboid((segment.w - segment.gap) / 2, 450, 1),
                offsets: [-segment.w, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
            };
            const right: Drawable = {
                name: uuidv4(),
                vertexes: cuboid((segment.w - segment.gap) / 2, 450, 1),
                offsets: [-(segment.w - segment.gap) / 2, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
            };

            container.children?.push(left);
            container.children?.push(right);
        } else {
            container.children?.push(fakeWall);
        }

        const bbox = computeBbox(fakeWall);
        x = bbox.x - bbox.w;
        z = bbox.z - bbox.d;
        idx += 1;
    }

    return container;
}
