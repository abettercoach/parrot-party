import './style.css'
import { SYSTEM } from '@rcade/plugin-input-classic'
import { RCadeInputAdapter } from './RCadeInputAdapter'
import { ParrotPartyGame } from './game'

// const app = document.querySelector<HTMLDivElement>('#app')!
// app.innerHTML = `
//   <h1>Parrot Party</h1>
//   <p id="status">Press 1P START</p>
//   <div id="controls"></div>
// `

// const status = document.querySelector<HTMLParagraphElement>('#status')!
// const controls = document.querySelector<HTMLDivElement>('#controls')!

let inputAdapter = new RCadeInputAdapter();
let game = new ParrotPartyGame(inputAdapter);

function setup() {

    update();
}

function update() {
    if (game.state.scene === "title-screen") {
        if (SYSTEM.TWO_PLAYER) {
            // status.textContent = 'Game Started!'
            game.promptMove();
        }
    } else {
        // console.log("input post update");
        inputAdapter.postUpdate();
    }

    requestAnimationFrame(update);
}

setup()
