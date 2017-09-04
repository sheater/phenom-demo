import * as $ from 'jquery';

import { BASE_BORDER_RADIUS } from './consts';

const PRESS_TO_PLAY_MIN_SIZE = '32px';
const PRESS_TO_PLAY_MAX_SIZE = '40px';
const PRESS_TO_PLAY_INTERVAL = 1200;

export default class Splash {
	private rootElem = null;
	private backdropElem = null;
	private logoElem = null;
	private proclaimerElem = null;
	private creditsElem = null;
	private playElem = null;
	private playInterval = null;

	constructor () {
		this.createRoot();
		this.createBackdrop();
		this.createLogo();
		this.createProclaimer();
		this.createCredits();
		this.createPressToPlay();
	}

	public show () {
		this.rootElem.show();

		this.playElem.css({ fontSize: '32px' });

		this.playInterval = setInterval(() => {
			this.playElem.animate({ fontSize: PRESS_TO_PLAY_MAX_SIZE }, PRESS_TO_PLAY_INTERVAL * 0.5, () => {
				this.playElem.animate({ fontSize: PRESS_TO_PLAY_MIN_SIZE }, PRESS_TO_PLAY_INTERVAL * 0.5);
			});
		}, PRESS_TO_PLAY_INTERVAL);
	}

	public hide () {
		clearInterval(this.playElem);

		this.rootElem.hide();
	}

	private createRoot () {
		this.rootElem = $('<div></div>').css({
			position: 'fixed',
			width: '480px',
			height: '520px',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			left: '50%',
			zIndex: 1000,
		}).hide();

		$(document.body).append(this.rootElem);
	}

	private createBackdrop () {
		this.backdropElem = $('<div></div>').css({
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: '#000',
			borderRadius: BASE_BORDER_RADIUS,
			opacity: 0.8,
			zIndex: -10,
		});

		this.rootElem.append(this.backdropElem);
	}

	private createLogo () {
		this.logoElem = $('<div></div>').css({
			width: '90%',
			margin: '20px auto',
			height: '70px',
			backgroundImage: 'url("./images/logo.png")',
			backgroundSize: 'cover',
		});

		this.rootElem.append(this.logoElem);
	}

	private createProclaimer () {
		this.proclaimerElem = $('<p>This is not a game, this is tech demo, but... you can kick some asses anyway 😎</p>').css({
			position: 'absolute',
			bottom: '100px',
			fontFamily: 'arial',
			fontSize: '16px',
			// fontWeight: 'bold',
			// textAlign: 'center',
			left: '5%',
			width: '90%',
			margin: '0 auto',
			color: '#fff',
		});

		this.rootElem.append(this.proclaimerElem);
	}

	private createCredits () {
		this.creditsElem = $('<p>code and music with <span style="color: #f00">❤</span> by <strong>Štěpán Skovajsa</strong></p>').css({
			position: 'absolute',
			bottom: '20px',
			fontFamily: 'arial',
			fontSize: '16px',
			// fontWeight: 'bold',
			textAlign: 'center',
			width: '100%',
			// margin: '0 100px',
			color: '#fff',
		});

		this.rootElem.append(this.creditsElem);
	}

	private createPressToPlay () {
		this.playElem = $('<div>Click to play</div>').css({
			position: 'absolute',
			width: '100%',
			top: '40%',
			transform: 'translateY(-50%)',
			textAlign: 'center',
			fontFamily: 'arial',
			fontSize: PRESS_TO_PLAY_MIN_SIZE,
			lineHeight: PRESS_TO_PLAY_MAX_SIZE,
			color: '#fff',
		});

		this.rootElem.append(this.playElem);
	}
}
