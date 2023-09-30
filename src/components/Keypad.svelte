<script lang="ts">
    import type { Engine } from 'webgl-engine';
    import type { GameProps } from '../main';

    let inputBox: HTMLInputElement;

    function handleInput(evt: KeyboardEvent) {
        // @ts-ignore
        const val = evt.target.value;
        // @ts-ignore
        const engine: Engine<GameProps> = window['gameEngine'];
        if (evt.key === 'Escape' || evt.which === 27) {
            engine.properties.activePuzzle = 'none';
        } else if (val === 'hello') {
            engine.properties.activePuzzle = 'none';
        }
    }

    $: {
        if (inputBox) {
            inputBox.focus();
        }
    }
</script>

<div class="keypad">
    <div>
        <h1>Enter the passcode</h1>
        <input bind:this={inputBox} on:keyup={handleInput} type="text" />
    </div>
</div>

<style>
    .keypad {
        position: absolute;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 2rem;
        display: flex;
        justify-content: center;
    }

    .keypad div {
        padding-top: 25%;
        display: flex;
        flex-direction: column;
    }

    .keypad input {
        margin-top: 20px;
        font-size: 2.5rem;
        border: 2px solid rgb(43, 255, 0);
        background: black;
        color: white !important;
        font-family: 'VT323', monospace;
        padding: 10px;
    }
</style>
