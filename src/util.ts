// const RCadeBindings = {
//     "ArrowUp": "P1Up",
//     "ArrowDown": "P1Down",
//     "ArrowLeft": "P1Left",
//     "ArrowRight": "P1Right",
//     "ControlLeft": "P1Button1",
//     "AltLeft": "P1Button2",
//     "KeyR": "P2Up",
//     "KeyF": "P2Down",
//     "KeyD": "P2Left",
//     "KeyG": "P2Right",
//     "KeyA": "P2Button1",
//     "KeyS": "P2Button2"
//   };
// const KeyboardBindings = {
//     "KeyW": "P1Up",
//     "KeyS": "P1Down",
//     "KeyA": "P1Left",
//     "KeyD": "P1Right",
//     "KeyF": "P1Button1",
//     "KeyG": "P1Button2",
//     "KeyO": "P2Up",
//     "KeyL": "P2Down",
//     "KeyK": "P2Left",
//     "Semicolon": "P2Right",
//     "Quote": "P2Button1",
//     "Enter": "P2Button2"
//   };
  
export const ActionToDisplay = {
    "Up": "↑",
    "Down": "↓",
    "Left": "←",
    "Right": "→",
    "A": "A",
    "B": "B"
  }

export const colors = {
    "P1": "yellow",
    "P2": "cyan"
  }
  
export const RainbowColorsCSS = [
    "rgb(255, 0, 102)",
    "rgb(255, 102, 0)",
    "rgb(255, 255, 102)",
    "rgb(0, 255, 102)",
    "rgb(102, 255, 255)",
    "rgb(102, 0, 255)",
    "rgb(255, 0, 255)"
  ]


  export   const DROP_KEYFRAMES_UP = [
        {transform: 'translate(-50%, calc(100vh + 50px))'},
        {transform: 'translate(-50%, calc(0vh - 500px))'}
    ];

  export   const DROP_KEYFRAMES_DOWN = [
        {transform: 'translate(-50%, calc(0vh - 500px))'}, 
        {transform: 'translate(-50%, calc(100vh + 50px))'}
    ];

   export  const DROP_KEYFRAMES_RIGHT = [
        {transform: 'translate(calc(0vw - 500px)), 0'}, 
        {transform: 'translate(calc(100vw + 50px)), 0)'}
    ];

  export  const DROP_KEYFRAMES_LEFT = [
        {transform: 'translate(calc(100vw + 50px)), 0)'},
        {transform: 'translate(calc(0vw - 500px)), 0'}
    ];