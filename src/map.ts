import { v4 as uuidv4 } from 'uuid';
import {
    zeros,
    type Drawable,
    cuboid,
    rads,
    Flatten,
    Repeat,
} from 'webgl-engine';
import { computeBbox, computeDimensions } from './math';
import { tex2D } from 'webgl-engine';
import { getModel } from './models';

export type Doorway = 'N' | 'S' | 'E' | 'W';
export type RoomDef = {
    x: number;
    z: number;
    w: number;
    h: number;
    ceiling: number;
    doorWidth: number;
    doorways: Doorway[];
};

const colors = [
    [253, 231, 37],
    [122, 209, 81],
    [34, 168, 132],
    [42, 120, 142],
    [65, 68, 135],
    [68, 1, 84],
];

export function createRoom(def: RoomDef) {
    const godmode = false;

    const container: Drawable = {
        name: 'room',
        vertexes: [],
        offsets: [def.w / 2, 0, -def.h / 2],
        position: [def.x, 0, def.z],
        rotation: zeros(),
        allowClipping: true,
        properties: {
            def,
        },
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
        const texcoord_w = segment.w / 512 / 4;
        const texcoord_h = def.ceiling / 512 / 4;
        const texcoords = Flatten(Repeat(tex2D(texcoord_w, texcoord_h), 6));
        const texcoords_half = Flatten(
            Repeat(tex2D(texcoord_w / 2, texcoord_h), 6)
        );

        const wallSegment: Partial<Drawable> = {
            colors: Flatten(Repeat(colors[idx % (colors.length - 1)], 36)),
            computeBbox: true,
            texture: {
                repeat_horizontal: 'repeat',
                repeat_vertical: 'repeat',
                uri: './assets/stone.png',
                enabled: true,
            },
            allowClipping: godmode,
        };

        r += segment.r;
        const fakeWall: Drawable = {
            name: `${segment.w}_${segment.gap}_main`,
            vertexes: cuboid(segment.w, def.ceiling, 0),
            offsets: [-segment.w, 0, 0],
            position: [x, y, z],
            rotation: [0, rads(r), 0],
            ...wallSegment,
            texcoords,
        };

        // Compute the children.
        if (segment.gap) {
            const left: Drawable = {
                name: `${segment.w}_${segment.gap}_left`,
                vertexes: cuboid((segment.w - segment.gap) / 2, def.ceiling, 1),
                offsets: [-segment.w, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: texcoords_half,
            };
            const right: Drawable = {
                name: `${segment.w}_${segment.gap}_right`,
                vertexes: cuboid((segment.w - segment.gap) / 2, def.ceiling, 1),
                offsets: [-(segment.w - segment.gap) / 2, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: texcoords_half,
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

    const brick_w = (def.w / 128) * 1.5;
    const brick_h = (def.h / 128) * 1.5;

    // Add a floor
    const floor: Drawable = {
        name: `floor_${def.w}_${def.h}`,
        vertexes: cuboid(def.w, 1, def.h),
        offsets: [-def.w, 0, 0],
        position: [0, 0, 0],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/floor-tile.png',
            enabled: true,
        },
        texcoords: Flatten(Repeat(tex2D(brick_w, brick_h), 6)),
    };

    container.children?.push(floor);

    return container;
}

export function loadMap(map: number[][]) {
    const ROOM_DEPTH = 1000;
    const ROOM_WIDTH = 1000;
    const roomList = [];

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const doorways: Doorway[] = [];
            const Current = map[y][x] == 1;
            const N = map[y + 1]?.[x] == 1;
            const S = map[y - 1]?.[x] == 1;
            const E = map[y]?.[x - 1] == 1;
            const W = map[y]?.[x + 1] == 1;

            if (N) doorways.push('N');
            if (S) doorways.push('S');
            if (E) doorways.push('E');
            if (W) doorways.push('W');

            if (Current)
                roomList.push(
                    createRoom({
                        x: x * ROOM_WIDTH,
                        z: y * ROOM_DEPTH,
                        h: ROOM_WIDTH,
                        w: ROOM_DEPTH,
                        ceiling: 1600,
                        doorWidth: 500 - 25 * y,
                        doorways: doorways,
                    })
                );
        }
    }

    return roomList;
}
