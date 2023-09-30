import type { ProgramTemplate, repeat_mode } from 'webgl-engine';

const default3DVertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec2 a_texcoord;

    uniform mat4 u_worldView;
    uniform mat4 u_projection;
    uniform mat4 u_camera;

    varying vec4 v_color;
    varying vec2 v_texcoord;
    uniform bool u_transparent;

    varying vec3 v_position;

    void main() {

        if (u_transparent) {
            gl_Position = vec4(0);
        } else {
            gl_Position = u_projection * u_camera * u_worldView * a_position;
        }

        v_color = a_color;
        v_texcoord = vec2(a_texcoord.x, 1.0 - a_texcoord.y);
        v_position = (u_camera * u_worldView * a_position).xyz;
    }
`;

const default3DFragmentShader = `
    precision mediump float;
    #define LOG2 1.442695
    
    varying vec4 v_color;
    varying vec3 v_position;
    varying vec2 v_texcoord;
    
    // The texture
    uniform sampler2D u_texture;
    uniform bool u_showtex;
    uniform bool u_transparent;
    uniform float u_opacity;
    // Fog
    uniform vec4 u_fogColor;
    uniform float u_fogDensity;
    
    void main() {

        float fogDistance = length(v_position) / 100.0;
        float fogAmount = 1.0 - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * LOG2);
        fogAmount = clamp(fogAmount, 0.2, 1.0);


        if (u_showtex) {
            gl_FragColor = mix(texture2D(u_texture, v_texcoord), u_fogColor, fogAmount);
        } else {
            gl_FragColor = v_color;
        }

        if (u_transparent) {
            gl_FragColor[3] = 0.0;
        } 
    }
`;

const gl = document.createElement('canvas').getContext('webgl');
const repeatMap: Record<repeat_mode, number | undefined> = {
    clamp_to_edge: gl?.CLAMP_TO_EDGE,
    mirrored_repeat: gl?.MIRRORED_REPEAT,
    repeat: gl?.REPEAT,
};

export const DefaultShader: ProgramTemplate = {
    name: 'default',
    order: 0,
    objectDrawArgs: {
        components: 3,
        depthFunc: gl?.LESS,
        mode: gl?.TRIANGLES,
    },
    vertexShader: default3DVertexShader,
    fragmentShader: default3DFragmentShader,
    attributes: {
        a_color: {
            components: 3,
            type: gl?.UNSIGNED_BYTE,
            normalized: true,
            generateData: (engine) => {
                return new Uint8Array(engine.activeScene.colors);
            },
        },
        a_position: {
            components: 3,
            type: gl?.FLOAT,
            normalized: false,
            generateData: (engine) => {
                return new Float32Array(engine.activeScene.vertexes);
            },
        },
        a_texcoord: {
            components: 2,
            type: gl?.FLOAT,
            normalized: false,
            generateData: (engine) => {
                return new Float32Array(engine.activeScene.texcoords);
            },
        },
    },
    staticUniforms: {
        u_projection: (engine, loc) => {
            const { gl } = engine;
            gl.uniformMatrix4fv(loc, false, engine.computed.projectionMatrix);
        },
        u_camera: (engine, loc) => {
            const { gl } = engine;
            gl.uniformMatrix4fv(
                loc,
                false,
                engine.computed.inverseCameraMatrix
            );
        },
        u_fogColor: (engine, loc) => {
            const { gl } = engine;
            gl.uniform4fv(loc, engine.settings.fogColor);
        },
        u_fogDensity: (engine, loc) => {
            const { gl } = engine;
            gl.uniform1f(loc, engine.settings.fogDensity);
        },
    },
    dynamicUniforms: {
        u_showtex: (engine, loc, obj) => {
            const { gl } = engine;
            gl.uniform1i(
                loc,
                obj.texture && obj.texture.enabled !== false ? 1 : 0
            );
        },
        u_texture: (engine, loc, obj) => {
            const { gl } = engine;
            /// Apply the current texture if relevant
            // Check if the current texture is loaded
            if (obj && obj.texture && obj.texture.enabled !== false) {
                const { webglTexture, square } = obj.texture._computed;
                if (obj.texture._computed) {
                    gl.texParameteri(
                        gl.TEXTURE_2D,
                        gl.TEXTURE_WRAP_S,
                        repeatMap[obj.texture.repeat_horizontal] ??
                            gl.CLAMP_TO_EDGE
                    );
                    gl.texParameteri(
                        gl.TEXTURE_2D,
                        gl.TEXTURE_WRAP_T,
                        repeatMap[obj.texture.repeat_vertical] ??
                            gl.CLAMP_TO_EDGE
                    );
                }

                // if (square) {
                //     gl.generateMipmap(gl.TEXTURE_2D);
                // }

                // This ensures the image is loaded into
                // u_texture properly.
                gl.uniform1i(loc, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, webglTexture);
            }
        },
        u_transparent: (engine, loc, obj) => {
            const { gl } = engine;
            gl.uniform1i(loc, obj.transparent === true ? 1 : 0);
        },
        u_worldView: (engine, loc, obj) => {
            const { gl } = engine;
            gl.uniformMatrix4fv(loc, false, obj._computed.positionMatrix);
        },
    },
};
