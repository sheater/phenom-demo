import * as $ from 'jquery';

declare const document: any; // hack for mozPointerLockElement & webkitPointerLockElement

export default class Mouse {
    public pointerLockEnabled = false;
    private element = document.body;

    constructor() {
        const havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if (havePointerLock) {
            let cameraLook = false;

            var pointerlockchange = (event: any) => {
                if ( document.pointerLockElement === this.element ||
                    document.mozPointerLockElement === this.element ||
                    document.webkitPointerLockElement === this.element ) {

                    this.pointerLockEnabled = true;
                } else {
                    this.pointerLockEnabled = false;
                }
            };

            var pointerlockerror = function ( event: any ) {
                console.error('pointerlockerror', event);
            };

            // // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
        }
        else {
            console.error('Your browser doesn\'t seem to support Pointer Lock API');
        }
    }

    addMouseMoveListener(onMouseMove: (relativeX: number, relativeY: number) => void) {
        const mouseMoveHandler = (event: MouseEvent) => {
            if (!this.pointerLockEnabled) return;

            const relativeX = event.movementX || event['mozMovementX'] || event['webkitMovementX'] || 0;
            const relativeY = event.movementY || event['mozMovementY'] || event['webkitMovementY'] || 0;

            onMouseMove(relativeX, relativeY);
        };

        document.addEventListener('mousemove', mouseMoveHandler, false);
    }

    addMousePressListener(onMousePress: (pressed: boolean) => void) {
        $(document).on('mousedown', () => this.pointerLockEnabled && onMousePress(true));
        $(document).on('mouseup', () => this.pointerLockEnabled && onMousePress(false));
    }

    requestPointerLock() {
        this.element.requestPointerLock =
            this.element.requestPointerLock ||
            this.element.mozRequestPointerLock ||
            this.element.webkitRequestPointerLock;

        if (/Firefox/i.test(navigator.userAgent)) {
            var fullscreenchange = function (event: any) {
                if (document.fullscreenElement === this.element ||
                    document.mozFullscreenElement === this.element ||
                    document.mozFullScreenElement === this.element) {

                    document.removeEventListener('fullscreenchange', fullscreenchange);
                    document.removeEventListener('mozfullscreenchange', fullscreenchange);

                    this.element.requestPointerLock();
                }
            };

            document.addEventListener('fullscreenchange', fullscreenchange, false);
            document.addEventListener('mozfullscreenchange', fullscreenchange, false);

            this.element.requestFullscreen = this.element.requestFullscreen ||
                this.element.mozRequestFullscreen ||
                this.element.mozRequestFullScreen ||
                this.element.webkitRequestFullscreen;

            this.element.requestFullscreen();
        } else {
            this.element.requestPointerLock();
        }
    }
}
