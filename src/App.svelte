<script lang="ts">
    import type { Engine } from 'webgl-engine';

    let webglCanvas: HTMLCanvasElement;
    let initialized = false;
    let ready = false;

    $: {
        // @ts-ignore
        const engine: Engine<unknown> = window['gameEngine'];
        engine.onReadyChange = (readyState) => {
            if (readyState === 'ready') {
                ready = true;
            } else {
                ready = false;
            }
        };

        if (webglCanvas && !initialized) {
            initialized = true;
            engine.initialize(webglCanvas);
        } else if (webglCanvas) {
            engine.setCanvas(webglCanvas);
        }
    }
</script>

<canvas id="canvas" bind:this={webglCanvas} />
<div data-ready={ready} id="loading">
    <h1>Loading...</h1>
</div>

<style>
    #canvas {
        width: 100%;
        height: 100%;
        flex-grow: 1;
    }

    #loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
        color: white;
        background-color: black;
    }

    #loading[data-ready='true'] {
        display: none;
    }
</style>
