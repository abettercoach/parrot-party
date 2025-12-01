import './style.css'
import { SYSTEM } from '@rcade/plugin-input-classic'
import { RCadeInputAdapter } from './RCadeInputAdapter'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <h1>Parrot Party</h1>
  <p id="status">Press 1P START</p>
  <div id="controls"></div>
`

const status = document.querySelector<HTMLParagraphElement>('#status')!
const controls = document.querySelector<HTMLDivElement>('#controls')!

let gameStarted = false
let inputAdapter = new RCadeInputAdapter();

function setup() {

    inputAdapter.onInput((e) => {
        controls.textContent = e.player + e.input;
    });

    requestAnimationFrame(() => {
        if (!gameStarted) {
            if (SYSTEM.ONE_PLAYER) {
                gameStarted = true
                status.textContent = 'Game Started!'
            }
        } else {
            inputAdapter.postUpdate();
        }
    });
}

setup()
