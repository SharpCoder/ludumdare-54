import { v4 as uuidv4 } from 'uuid';
import {
    zeros,
    type Drawable,
    cuboid,
    rads,
    Flatten,
    Repeat,
    Repeat2D,
} from 'webgl-engine';
import { computeBbox } from './math';
import { rect2D } from 'webgl-engine';
import { tex2D } from 'webgl-engine';

export type Doorway = 'N' | 'S' | 'E' | 'W';
export type RoomDef = {
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
    const container: Drawable = {
        name: 'room',
        vertexes: [],
        offsets: [def.w / 2, 0, -def.h / 2],
        position: zeros(),
        rotation: zeros(),
        allowClipping: true,
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
        const texcoord_w = segment.w / 128;
        const texcoord_h = (def.ceiling / 128) * 1.5;

        const wallSegment: Partial<Drawable> = {
            colors: Flatten(Repeat(colors[idx % (colors.length - 1)], 36)),
            computeBbox: true,
            texture: {
                repeat_horizontal: 'mirrored_repeat',
                repeat_vertical: 'mirrored_repeat',
                uri: './assets/brick.png',
                enabled: true,
            },
        };

        r += segment.r;
        const fakeWall: Drawable = {
            name: uuidv4(),
            vertexes: cuboid(segment.w, def.ceiling, 1),
            offsets: [-segment.w, 0, 0],
            position: [x, y, z],
            rotation: [0, rads(r), 0],
            ...wallSegment,
            texcoords: Flatten(Repeat(tex2D(texcoord_w, texcoord_h), 6)),
        };

        // Compute the children.
        if (segment.gap) {
            const left: Drawable = {
                name: uuidv4(),
                vertexes: cuboid((segment.w - segment.gap) / 2, def.ceiling, 1),
                offsets: [-segment.w, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: Flatten(
                    Repeat(tex2D(texcoord_w / 2, texcoord_h), 6)
                ),
            };
            const right: Drawable = {
                name: uuidv4(),
                vertexes: cuboid((segment.w - segment.gap) / 2, def.ceiling, 1),
                offsets: [-(segment.w - segment.gap) / 2, 0, 0],
                position: [x, y, z],
                rotation: [0, rads(r), 0],
                ...wallSegment,
                texcoords: Flatten(
                    Repeat(tex2D(texcoord_w / 2, texcoord_h), 6)
                ),
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

    // Add a ceiling
    const ceiling: Drawable = {
        name: `ceiling_${def.w}_${def.h}`,
        vertexes: cuboid(def.w, 1, def.h),
        colors: Flatten(Repeat([28, 28, 28], 36)),
        offsets: [-def.w, def.ceiling, 0],
        position: [0, 0, 0],
        rotation: zeros(),
    };

    // Add a floor
    const floor: Drawable = {
        name: `floor_${def.w}_${def.h}`,
        vertexes: cuboid(def.w, 1, def.h),
        offsets: [-def.w, 0, 0],
        position: [0, 0, 0],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'mirrored_repeat',
            repeat_vertical: 'mirrored_repeat',
            uri: './assets/floor-tile.png',
            enabled: true,
        },
        texcoords: Flatten(Repeat(tex2D(brick_w, brick_h), 6)),
    };

    container.children?.push(ceiling);
    container.children?.push(floor);

    return container;
}
