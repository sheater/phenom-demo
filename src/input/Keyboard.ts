export class KeyboardState {
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
}

export default class Keyboard {
    state = new KeyboardState();

    constructor () {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    this.state.moveForward = true;
                    break;

                case 37: // left
                case 65: // a
                    this.state.moveLeft = true;
                    break;

                case 40: // down
                case 83: // s
                    this.state.moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    this.state.moveRight = true;
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    this.state.moveForward = false;
                    break;

                case 37: // left
                case 65: // a
                    this.state.moveLeft = false;
                    break;

                case 40: // down
                case 83: // s
                    this.state.moveBackward = false;
                    break;

                case 39: // right
                case 68: // d
                    this.state.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
    }
}
