import * as $ from 'jquery';

import Player from './../game/Player';
import { BASE_BORDER_RADIUS } from './consts';

const PLAYER_HEALTH_LOW = 15;
const PLAYER_AMMO_LOW = 50;

const HUD_COLOR_PRIMARY = '#fff';
const HUD_COLOR_SECONDARY = '#aaa';
const HUD_COLOR_LOW = '#f33';
const HUD_COLOR_BACKGROUND = '#111';
const HUD_FONT_SIZE_BASE = '4vw';
const HUD_FONT_FAMILY_BASE = 'arial';

const BASE_GAUGE_WRAPPER_CSS = {
	position: 'fixed',
	fontFamily: HUD_FONT_FAMILY_BASE,
	fontSize: HUD_FONT_SIZE_BASE,
	bottom: '5%',
	display: 'flex',
	alignItems: 'center',
	boxShadow: `0 0 30px ${HUD_COLOR_BACKGROUND}`,
	borderRadius: BASE_BORDER_RADIUS,
	backgroundColor: HUD_COLOR_BACKGROUND,
	opacity: '0.7',
};

const BASE_GAUGE_ICON_CSS = {
	fontSize: '5vw',
	color: HUD_COLOR_SECONDARY,
	padding: '0 15px',
};

const BASE_GAUGE_LABEL_CSS = {
	color: HUD_COLOR_PRIMARY,
	padding: '0 15px',
};

export default class Hud {
	private rootElem;

	private healthValueElem;
	private ammoValueElem;
	private scoreValueElem;

	private painCoverElem;
	private muzzleFlashElem;

	private player: Player

	registerPlayer (player) {
		this.player = player;
		this.redraw();
	}

	redraw () {
		const { health, ammo, score } = this.player;

		this.healthValueElem.text(this.player.health);
		if (health < PLAYER_HEALTH_LOW) {
			this.healthValueElem.css({ color: HUD_COLOR_LOW });
		}
		else {
			this.healthValueElem.css({ color: HUD_COLOR_PRIMARY });
		}

		this.ammoValueElem.text(this.player.ammo);
		if (ammo < PLAYER_AMMO_LOW) {
			this.ammoValueElem.css({ color: HUD_COLOR_LOW });
		}
		else {
			this.ammoValueElem.css({ color: HUD_COLOR_PRIMARY });
		}

		this.scoreValueElem.text(this.player.score);
	}

	constructor () {
		this.createRoot();

		this.createHealthGauge();
		this.createAmmoGauge();
		this.createScoreGauge();
		this.createCrosshair();
		this.createMuzzleFlash();
		this.createPainCover();
	}

	private createRoot () {
		this.rootElem = $('<div></div>').css({});

		$(document.body).append(this.rootElem);
	}

	public muzzleFlashEffect () {
		this.muzzleFlashElem.css({ opacity: 0.6 }).animate({ opacity: 0 }, 10);
	}

	private createMuzzleFlash () {
		this.muzzleFlashElem = $('<img src="./fx/muzzle-flash.png" />')
			.css({ position: 'fixed', top: '40%', left: '40%', opacity: 0 });

		this.rootElem.append(this.muzzleFlashElem);
	}

	private createPainCover () {
		this.painCoverElem = $('<div></div>').css({
			position: 'fixed',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 10,
			opacity: 0,
		});

		this.rootElem.append(this.painCoverElem);
	}

	public painEffect (intensity) { // 0 to 1 (1 = death)
		this.painCoverElem.css({
			background: `radial-gradient(rgba(128, 0, 0, ${0.4 * intensity}), rgba(220, 0, 0, ${0.6 * intensity}))`,
			opacity: 1,
		}).animate({ opacity: 0 }, 800 * intensity);
	}

	private createHealthGauge () {
		const wrapper = $('<div></div>').css({ ...BASE_GAUGE_WRAPPER_CSS, left: '5%' });
		const icon = $('<span>&hearts;</span>').css(BASE_GAUGE_ICON_CSS);
		const label = this.healthValueElem = $('<span></span>').css(BASE_GAUGE_LABEL_CSS);

		wrapper
			.append(icon)
			.append(label);

		this.rootElem.append(wrapper);
	}

	private createAmmoGauge () {
		const wrapper = $('<div></div>').css({ ...BASE_GAUGE_WRAPPER_CSS, right: '5%' });
		const icon = $('<span>&empty;</span>').css(BASE_GAUGE_ICON_CSS);
		const label = this.ammoValueElem = $('<span></span>').css(BASE_GAUGE_LABEL_CSS);

		wrapper
			.append(icon)
			.append(label);

		this.rootElem.append(wrapper);
	}

	private createScoreGauge () {
		const wrapper = $('<div></div>').css({ ...BASE_GAUGE_WRAPPER_CSS, bottom: 'auto', top: '5%', left: '5%' });
		const icon = $('<span>kills</span>').css(BASE_GAUGE_ICON_CSS);
		const label = this.scoreValueElem = $('<span></span>').css(BASE_GAUGE_LABEL_CSS);

		wrapper
			.append(icon)
			.append(label);

		this.rootElem.append(wrapper);
	}

	private createCrosshair () {
		const crosshairElem = $('<div>+</div>').css({
			color: '#fff',
			position: 'fixed',
			top: '50%',
			left: '50%',
			fontSize: '40px',
			transform: 'translate(-50%,-50%)',
		});

		this.rootElem.append(crosshairElem);
	}
}
