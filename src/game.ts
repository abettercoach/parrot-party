//   const BINDINGS = KeyboardBindings;

import { SYSTEM } from '@rcade/plugin-input-classic'
import { RCadeInputAdapter, type RCadePlayer, type RCadeInput, type RCadeInputEvent } from "./RCadeInputAdapter";
import * as Util from "./util";

import partyParrotURL from '../assets/party_parrot.gif';
import sadParrotURL from '../assets/sad_parrot.gif';

import bgtrack from '../assets/audio/bgtrack.wav';
import upsound from '../assets/audio/up.wav';
import downsound from '../assets/audio/down.wav';
import rightsound from '../assets/audio/right.wav';
import leftsound from '../assets/audio/left.wav';
import asound from '../assets/audio/a.wav';
import bsound from '../assets/audio/b.wav';


type GameUI = {
  header: HTMLElement, 
  main: HTMLElement, 
  footer: HTMLElement, 
  moveBoxes: HTMLElement[],
  audio: {
    backTrack: HTMLAudioElement,
    up: HTMLAudioElement,
    down: HTMLAudioElement,
    right: HTMLAudioElement,
    left: HTMLAudioElement,
    a: HTMLAudioElement,
    b: HTMLAudioElement,
  }
};
type GameState = {
  scene: string,
  curr_player: RCadePlayer,
  curr_index: number,
  memory: RCadeInputEvent[],
};

export class ParrotPartyGame {
  private ui: GameUI;
  public state: GameState;

  private mainTimeout: number | undefined;

  constructor(input: RCadeInputAdapter) {
    const h = document.createElement('header');
    document.body.appendChild(h);

    const m = document.createElement('main');
    document.body.appendChild(m);

    const f = document.createElement('footer');
    document.body.appendChild(f);

    this.ui = {
      header: h,
      main: m,
      footer: f,
      moveBoxes: [],
      audio: {
        backTrack: new Audio(bgtrack),
        up: new Audio(upsound),
        down: new Audio(downsound),
        right: new Audio(rightsound),
        left: new Audio(leftsound),
        a: new Audio(asound),
        b: new Audio(bsound),
      }
    };

    this.state = {
      scene: "title-screen",
      curr_player: "P1",
      curr_index: 0,
      memory: [],
    }

    this.ui.audio.backTrack.load();
    this.ui.audio.backTrack.loop = true;
    this.ui.audio.backTrack.volume = 0.15;

    this.ui.audio.up.load();
    this.ui.audio.down.load();
    this.ui.audio.right.load();
    this.ui.audio.left.load();
    this.ui.audio.a.load();
    this.ui.audio.b.load();
    this.ui.audio.b.volume = 0.4;

    input.onInput((e) => {
      // If game idle for 1 min, return to title screen
      if (this.mainTimeout) {
        clearTimeout(this.mainTimeout);
      }
      this.mainTimeout = setTimeout(() => {
        this.resetGame();
      }, 30000);

      if (this.state.scene === "title-screen" && SYSTEM.TWO_PLAYER) {
        this.promptMove();
      }

      this.handleAction(e.player, e.input);
    });

    this.resetGame();
  }

  handleAction(player: RCadePlayer, action: RCadeInput) {

    if (player === this.state.curr_player) {
      switch (action) {
        case "Up":
          this.ui.audio.up.currentTime = 0;
          this.ui.audio.up.play();
          break;
        case "Down":
          this.ui.audio.down.currentTime = 0;
          this.ui.audio.down.play();
          break;
        case "Right":
          this.ui.audio.right.currentTime = 0;
          this.ui.audio.right.play();
          break;
        case "Left":
          this.ui.audio.left.currentTime = 0;
          this.ui.audio.left.play();
          break;
        case "A":
          this.ui.audio.a.currentTime = 0;
          this.ui.audio.a.play();
          break;
        case "B":
          this.ui.audio.b.currentTime = 0;
          this.ui.audio.b.play();
          break;
        default:
          break;
      }
    }

    switch (this.state.scene) {
      case "title-screen":
        this.promptMove();
        break;
      case "prompt-move":
        this.addMove(player, action);
        break;
      case "echo-moves":
        this.echoMove(player, action);
        break;
      default:
        break;
    }
  }

  resetGame() {
    this.state.scene = "title-screen";

    this.state.curr_player = "P1";
    this.state.memory = [];
    this.state.curr_index = 0;

    //Audio
    this.ui.audio.backTrack.currentTime = 0;

    this.ui.audio.backTrack.playbackRate = 1;
    this.ui.audio.up.playbackRate = 1;
    this.ui.audio.down.playbackRate = 1;
    this.ui.audio.left.playbackRate = 1;
    this.ui.audio.right.playbackRate = 1;
    this.ui.audio.a.playbackRate = 1;
    this.ui.audio.b.playbackRate = 1;

    this.ui.moveBoxes = [];
    this.ui.footer.replaceChildren();

    this.ui.audio.backTrack.play();

    this.uiTitleScreen();
  }

  promptMove() {
    this.state.scene = "prompt-move";

    this.uiPromptMove();
  }

  addMove(player: RCadePlayer, input: RCadeInput) {

    const is_curr_player = player === this.state.curr_player;
    if (!is_curr_player) return;

    this.state.scene = "add-move";

    this.state.memory.push({player, input});

    this.uiAddMove();

    setTimeout(() => {
      this.nextPlayer();
    }, 1000);

  }

  nextPlayer() {
    this.state.scene = "scramble";

    this.state.curr_player = this.state.curr_player === "P1" ? "P2" : "P1";
    this.state.curr_index = 0;

    this.uiScramble();
  }

  echoMoves() {

    this.state.scene = "echo-moves";

    this.uiEchoMoves();
  }

  echoMove(player: RCadePlayer, input: RCadeInput) {

    this.state.scene = "echo-moves";

    const is_curr_player = player === this.state.curr_player;
    if (!is_curr_player) return;

    const is_correct_move = input === this.state.memory[this.state.curr_index].input;

    if (is_correct_move) {
      this.goodMove();
    } else {
      this.badMove();
    }
  }

  goodMove() {
    this.state.scene = "good-move";

    this.uiGoodMove();

    this.state.curr_index++;

    if (this.state.curr_index >= this.state.memory.length) {
      this.promptMove();
    } else {
      this.echoMoves(); 
    }
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  badMove() {
    this.state.scene = "bad-move";

    this.uiBadMove();

    const playbackRate = (rate: number) => {
        this.ui.audio.backTrack.playbackRate = rate;
        this.ui.audio.up.playbackRate = rate;
        this.ui.audio.down.playbackRate = rate;
        this.ui.audio.left.playbackRate = rate;
        this.ui.audio.right.playbackRate = rate;
        this.ui.audio.a.playbackRate = rate;
        this.ui.audio.b.playbackRate = rate;
    };

    setTimeout(async () => {
      for (let rate = 1.0; rate > 0.40; rate -= 0.1) {
        playbackRate(rate);
        await this.sleep(10);
      }
    }, 0);
    
    setTimeout(() => {
      this.gameOver();
    }, 1500);
  }

  gameOver() {

    this.state.scene = "lose";

    this.uiGameOver();

    setTimeout(() => {
      this.resetGame();
    }, 5000);
  }

  uiTitleScreen() {

    this.ui.header.className = "title-screen";
    this.ui.main.className = "title-screen";
    this.ui.footer.className = "title-screen";

    const title = document.createElement('p');
    title.id = "title";
    title.innerHTML = "PARROT PARTY";

    const subtitle = document.createElement('p');
    subtitle.id = "subtitle";
    subtitle.innerHTML = "press P2 to start";
    subtitle.classList.add("neon-glow");

    let curr_color_i = 0;
    setInterval(() => {
      title.style.color = Util.RainbowColorsCSS[curr_color_i + 1];
      curr_color_i++;
      if (curr_color_i >= Util.RainbowColorsCSS.length) {
        curr_color_i = 0;
      }
    }, 50);

    this.ui.main.replaceChildren(title, subtitle);
  }

  uiPromptMove() {

    this.ui.header.className = "prompt-move";
    this.ui.main.className = "prompt-move";
    this.ui.footer.className = "prompt-move";

    // HEADER
    this.ui.header.innerHTML = `Player ${this.state.curr_player}`;
    this.ui.header.style.backgroundColor = Util.colors[this.state.curr_player];

    // MAIN
    const is_first = this.state.memory.length < 1;

    const instruction = document.createElement('p');
    instruction.id = "instruction";
    instruction.innerHTML = is_first ? "What's your first move?" : "What's your next move?";
    instruction.style.color = Util.colors[this.state.curr_player];

    this.ui.main.replaceChildren(instruction);

    // FOOTER
    this.renderFooter();
  }

  uiAddMove() {
    // FOOTER
    this.renderFooter();
  }

  uiGoodMove() {
    this.state.scene = "good-move";

    // FOOTER
    this.renderFooter();
  }

  uiBadMove() {
    this.state.scene = "bad-move";

    // FOOTER
    this.renderFooter();
  }

  uiEchoMoves() {

    this.ui.header.className = "echo";
    this.ui.main.className = "echo";
    this.ui.footer.className = "echo";

    // HEADER
    this.ui.header.innerHTML = `Player ${this.state.curr_player}`;
    this.ui.header.style.backgroundColor = Util.colors[this.state.curr_player];

    // MAIN
    const is_first = this.state.memory.length < 1;

    const instruction = document.createElement('p');
    instruction.id = "instruction";
    instruction.innerHTML = is_first ? "Can you remember the move?" : "Can you remember the moves?";
    instruction.style.color = Util.colors[this.state.curr_player];

    this.ui.main.replaceChildren(instruction);

    // FOOTER
    this.renderFooter();
  }

  renderFooter() {
    //TODO: rethink logic so we're not clearing divs at every scene change,
    // and we can keep async animations alive even with new user input
    // particularly relevant for "good move" scene, but probably important
    // for any type of animation to be separate from the input handling logic

    let boxes = this.ui.moveBoxes;
    
    let i = 0;
    for (const move of this.state.memory) {
      const moveBox = boxes[i];

      const animations = moveBox.getAnimations();
      for (let a of animations) {
        a.cancel();
      }

      const curr_style = getComputedStyle(moveBox);

      const passed = i < this.state.curr_index;

      const frames = [
        { backgroundColor: curr_style.backgroundColor, 
          transform: curr_style.transform, 
          borderColor: curr_style.borderColor, 
          color: curr_style.color
        }, 
        {
          backgroundColor: !passed ? "black" : Util.colors[move.player], 
          transform: "scale(1.0)", 
          borderColor: !passed ? Util.colors[move.player] : "", 
          color: !passed ? Util.colors[move.player] : "black"
        }
      ];

      moveBox.animate(frames,{
        duration: 200, 
        iterations: 1, 
        fill: 'forwards', 
        easing: 'ease' 
      });

      moveBox.innerHTML = passed ? Util.ActionToDisplay[move.input] : '?';

      i++;
    }

    if (this.state.scene === "good-move") {
      const wonBox = boxes[this.state.curr_index];

      let colors = Util.RainbowColorsCSS.slice(1);

      const color = Util.colors[this.state.memory[this.state.curr_index].player];
      setTimeout(() => {

        const frames = [
          {backgroundColor: "black", transform: "scale(0.8)"}, 
          {backgroundColor: colors[0], transform: "scale(0.7)"}, 
          {backgroundColor: colors[1], transform: "scale(0.7)"}, 
          {backgroundColor: colors[2], transform: "scale(1.2)"}, 
          {backgroundColor: colors[3], transform: "scale(0.9)"}, 
          {backgroundColor: colors[4], transform: "scale(0.6)"}, 
          {backgroundColor: colors[5], transform: "scale(1.1)"}, 
          {backgroundColor: color, transform: "scale(1.0)"}
        ];

        wonBox.animate(frames,{
          duration: 500, 
          iterations: 1, 
          fill: 'forwards', 
          easing: 'ease' 
        });
      }, 0);
    }

    if (this.state.scene === "bad-move") {
      const lostBox = boxes[this.state.curr_index];

      lostBox.style.borderColor = "black";
      lostBox.style.color = "black";
      lostBox.innerHTML = "X";

      const framesA = [
        {transform: "scale(0.8)"}, 
        {transform: "scale(1.0)"}
      ];
      const framesB = [
        {backgroundColor: "black"}, 
        {backgroundColor: "red"}
      ];

      lostBox.animate(framesA,{
        duration: 250, 
        iterations: 1, // Loop indefinitely
        fill: 'forwards', // Animate back and forth
        easing: 'ease' // Smooth transition
      });

      lostBox.animate(framesB,{
        duration: 100, 
        iterations: Infinity, // Loop indefinitely
        direction: 'alternate', // Animate back and forth
        easing: 'ease-in-out' // Smooth transition
      });
    }

    if (this.state.scene === "prompt-move") {
      let blankBox = document.createElement("div");
      blankBox.classList.add("moveBox");
      blankBox.style.borderColor = Util.colors[this.state.curr_player];
      blankBox.innerHTML = " ";
      blankBox.animate([{borderColor: Util.colors[this.state.curr_player]}, {borderColor: "black"}],{
        duration: 100, 
        iterations: Infinity, // Loop indefinitely
        direction: 'alternate', // Animate back and forth
        easing: 'ease-in-out' // Smooth transition
      });

      boxes.push(blankBox);
    }

    if (this.state.scene === "add-move") {
      let colors = Util.RainbowColorsCSS.slice(1);
      const added = this.state.memory[this.state.memory.length - 1];
      let filledBox = document.createElement("div");
      filledBox.classList.add("moveBox");
      filledBox.classList.add("fill");
      filledBox.innerHTML = Util.ActionToDisplay[added.input];
      filledBox.animate([
          {backgroundColor: "black", transform: "rotate(10deg) scale(0.8)"}, 
          {backgroundColor: colors[0], transform: "rotate(-5deg) scale(0.7)"}, 
          {backgroundColor: colors[1], transform: "rotate(25deg) scale(0.7)"}, 
          {backgroundColor: colors[2], transform: "rotate(20deg) scale(1.2)"}, 
          {backgroundColor: colors[3], transform: "rotate(-15deg) scale(0.9)"}, 
          {backgroundColor: colors[4], transform: "rotate(0deg) scale(0.6)"}, 
          {backgroundColor: colors[5], transform: "rotate(-25deg) scale(1.1)"}, 
          {backgroundColor: Util.colors[added.player], transform: "rotate(0deg) scale(1.0)"}
      ],{
        duration: 600, 
        iterations: 1, 
        fill: 'forwards', 
        easing: 'ease' 
      });
      
      boxes.pop();
      boxes.push(filledBox);
    }

    this.ui.footer.replaceChildren(...boxes);
  }

  uiScramble() {

    this.ui.header.className = "scramble";
    this.ui.footer.className = "scramble";

    this.ui.header.innerHTML = "heck yea";

    // Blink Header
    let curr_color_i = 0;
    const blinkInterval = setInterval(() => {
      if (!this.ui) return;
      
      const color = Util.RainbowColorsCSS[curr_color_i + 1];

      this.ui.header.style.backgroundColor = color;

      curr_color_i++;
      if (curr_color_i >= Util.RainbowColorsCSS.length) {
        curr_color_i = 0;
      }
    }, 100);

    // Party Parrot GIF
    const party = document.createElement("img");
    party.style.width = "80px";
    party.src = partyParrotURL;

    const lastMove = this.state.memory[this.state.memory.length - 1];

    // Last Move "Rain" Party
    let drops = []
    for (let i = 0; i < 100; i++) {
      const moveDrop = document.createElement("div");
      moveDrop.className = "move-drop";
      moveDrop.innerHTML = Util.ActionToDisplay[lastMove.input];
      moveDrop.style.color = Util.colors[lastMove.player];
      
      // Calculate the maximum left position to keep the element within the viewport
      const maxLeft = window.innerWidth;
      const maxTop = window.innerHeight;

      // Generate a random left position
      const randomLeft = Math.floor(Math.random() * maxLeft);
      const randomTop = Math.floor(Math.random() * maxTop);

      // Apply the random left position
      moveDrop.style.left = `${randomLeft}px`;
      moveDrop.style.top = `${randomTop}px`;

      let keyframes = [];
      switch (lastMove.input) {
        case "Up":
          keyframes = Util.DROP_KEYFRAMES_UP;
          break;
        case "Right":
          keyframes = Util.DROP_KEYFRAMES_RIGHT;
          break;
        case "Left":
          keyframes = Util.DROP_KEYFRAMES_LEFT;
          break;
        default:
          keyframes = Util.DROP_KEYFRAMES_DOWN;
          break;
      }

      const randomDelay = -Math.random() * 1000;

      moveDrop.animate(keyframes, {
            duration: 1000, // 2 seconds
            easing: 'ease-in-out', // Smooth start and end
            delay: randomDelay,
            iterations: Infinity
      });

      drops.push(moveDrop);

    }

    this.ui.main.replaceChildren(party, ...drops);

    setTimeout(() => {
      clearInterval(blinkInterval);
      this.echoMoves();
    }, 1500);
  }

  uiGameOver() {
    
    this.ui.header.className = "lose";
    this.ui.main.className = "lose";
    this.ui.footer.className = "lose";

    this.ui.header.innerHTML = "uh... no. not that.";
    this.ui.header.style.backgroundColor = "black"; // <- 

    // Sad Parrot GIF
    const party = document.createElement("img");
    party.style.width = "80px";
    party.src = sadParrotURL;

    this.ui.main.replaceChildren(party);

    this.ui.footer.innerHTML = "GAME OVER";
    this.ui.footer.classList.add("neon-glow");

  }
}
  
