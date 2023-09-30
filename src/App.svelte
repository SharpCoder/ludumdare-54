<script lang="ts">
    import type { Engine } from 'webgl-engine';

    let webglCanvas: HTMLCanvasElement;
    let initialized = false;
    let ready = false;

    let clueText = '';
    let clueVisible = false;
    let timerId = -1;

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

        clearInterval(timerId);
        timerId = setInterval(() => {
            // @ts-ignore
            clueText = engine.properties?.clueText;
            if (clueText && clueText.length > 0) {
                clueVisible = true;
            } else {
                clueVisible = false;
            }
        }, 100);

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

{#if clueVisible}
    <div id="clue"><div class="clue-text">{clueText}</div></div>
{/if}

<style>
    #canvas {
        width: 100%;
        height: 100%;
        flex-grow: 1;
    }

    #clue {
        position: absolute;
        font-size: 2rem;
        color: white;
        width: 100vw;
        top: 78%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #clue .clue-text {
        width: 500px;
        min-height: 150px;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 30px;
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
        z-index: 1;
    }

    #loading[data-ready='true'] {
        display: none;
    }
</style>
