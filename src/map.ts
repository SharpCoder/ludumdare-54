import { v4 as uuidv4 } from 'uuid';
import {
    zeros,
    type Drawable,
    cuboid,
    rads,
    Flatten,
    Repeat,
    cuboidNormals,
    Scene,
} from 'webgl-engine';
import { computeBbox } from './math';
import { tex2D } from 'webgl-engine';
import type { GameProps } from './main';
import { spawnVase } from './objects/vase';
import { spawnBookshelf } from './objects/bookshelf';
import { spawnClue } from './objects/clue';
import { spawnKeypad } from './objects/keypad';

export type Doorway = 'N' | 'S' | 'E' | 'W';
export type RoomDef = {
    type: number;
    x: number;
    z: number;
    w: number;
    h: number;
    // 0 - 1
    crushFactor: number;
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
        const crushy = segment.w * def.crushFactor;
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
            normals: cuboidNormals(),
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
                normals: cuboidNormals(),
                offsets: [-segment.w, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: texcoords_half,
            };
            const right: Drawable = {
                name: `${segment.w}_${segment.gap}_right`,
                vertexes: cuboid((segment.w - segment.gap) / 2, def.ceiling, 1),
                normals: cuboidNormals(),
                offsets: [-(segment.w - segment.gap) / 2, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: texcoords_half,
            };

            container.children?.push(left);
            container.children?.push(right);
        } else {
            // container.children?.push(fakeWall);

            // Calculate the crush segments
            const crushSegment: Drawable = {
                name: `${segment.w}_${segment.gap}_crush`,
                vertexes: cuboid(segment.w, def.ceiling, 1),
                normals: cuboidNormals(),
                offsets: [-segment.w, 0, crushy],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords,
            };

            container.children?.push(crushSegment);
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
        normals: cuboidNormals(),
        offsets: [-def.w, 0, 0],
        position: [0, 0, 0],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/ceiling.png',
            enabled: true,
        },
        texcoords: Flatten(Repeat(tex2D(brick_w, brick_h), 6)),
    };

    // Add a ceiling
    const ceiling: Drawable = {
        name: `floor_${def.w}_${def.h}`,
        vertexes: cuboid(def.w, 1, def.h),
        normals: cuboidNormals(),
        offsets: [-def.w, def.ceiling, 0],
        position: [0, 0, 0],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/ceiling.png',
            enabled: true,
        },
        texcoords: Flatten(Repeat(tex2D(brick_w, brick_h), 6)),
    };

    container.children?.push(floor);
    container.children?.push(ceiling);

    // Populate room
    for (const el of populateRoom(def)) {
        container.children?.push(el);
    }

    return container;
}

function populateRoom(def: RoomDef): Drawable[] {
    const elements: Drawable[] = [];
    const mod1 = Math.random() > 0.5 ? 1.0 : -1.0;
    const mod2 = Math.random() > 0.5 ? 1.0 : -1.0;
    const offset = def.w / 2 - def.w * def.crushFactor;

    if (def.type === 1) {
        // Puzzle room 1
        elements.push(
            spawnClue({
                x: -def.w / 2,
                z: -def.h / 2 - 700,
                text: 'uryyb',
            })
        );

        elements.push(spawnKeypad({ x: 0, z: -def.h / 2 - def.h / 6 }));
    } else if (def.type === 2) {
        // Vase room
        elements.push(
            spawnVase({
                x: -def.w / 2 - (offset - 50) * mod2,
                z: -def.h / 2 - (offset - 50) * mod1,
            })
        );
    } else if (def.type === 3) {
        // Bookshelf room
        elements.push(
            spawnBookshelf({
                x: -def.w / 2,
                z: -def.h / 2 - offset * mod1,
            })
        );
    }

    return elements;
}

export type MapProps = {
    x: number;
    z: number;
};
export function loadMap(
    scene: Scene<GameProps>,
    props: MapProps,
    map: number[][]
) {
    const ROOM_DEPTH = 2000;
    const ROOM_WIDTH = 2000;
    const roomList = [];
    let first = true;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const doorways: Doorway[] = [];
            const current = map[y][x] != 0;
            const N = map[y + 1]?.[x] != 0;
            const S = map[y - 1]?.[x] != 0;
            const E = map[y]?.[x - 1] != 0;
            const W = map[y]?.[x + 1] != 0;

            if (N || first) doorways.push('N');
            if (S) doorways.push('S');
            if (E) doorways.push('E');
            if (W) doorways.push('W');

            if (current)
                roomList.push(
                    createRoom({
                        type: map[y][x],
                        x: props.x + x * ROOM_WIDTH,
                        z: props.z + y * ROOM_DEPTH,
                        h: ROOM_WIDTH,
                        w: ROOM_DEPTH,
                        ceiling: 600,
                        doorWidth: 450 - 25 * y,
                        crushFactor: y / 1.5 / map.length,
                        doorways: doorways,
                    })
                );

            first = false;
        }
    }

    return roomList;
}
