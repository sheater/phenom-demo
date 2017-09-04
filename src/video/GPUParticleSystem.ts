import * as THREE from 'three';

import * as particleShader from './../shaders/particle';

// @author flimshaw - Charlie Hoey - http://charliehoey.com

export interface IGPUParticleSystemOptions {
	maxParticles?: number;
	containerCount?: number;
	particleNoiseTex?: THREE.Texture;
	particleSpriteTex?: THREE.Texture;
}

export interface IGPUParticleOptions {
	position?: THREE.Vector3;
	positionRandomness?: number;
	velocity?: THREE.Vector3;
	velocityRandomness?: number;
	color?: number;
	colorRandomness?: number;
	turbulence?: number;
	lifetime?: number;
	size?: number;
	sizeRandomness?: number;
	smoothPosition?: boolean;
}

export default class GPUParticleSystem extends THREE.Object3D {
	PARTICLE_COUNT: number;
	PARTICLE_CONTAINERS: number;
	PARTICLE_NOISE_TEXTURE: THREE.Texture;
	PARTICLE_SPRITE_TEXTURE: THREE.Texture;
	PARTICLES_PER_CONTAINER: number;
	PARTICLE_CURSOR: number;

	time: number;
	randomNumbers: Array<number>;
	randomCounter: number;
	particleContainers: Array<any>;
	particleShaderMat: THREE.ShaderMaterial;
	particleNoiseTex: THREE.Texture;
	particleSpriteTex: THREE.Texture;

	constructor(options?: IGPUParticleSystemOptions) {
		super();

		options = options || {};

		// parse options and use defaults

		this.PARTICLE_COUNT = options.maxParticles || 1000000;
		this.PARTICLE_CONTAINERS = options.containerCount || 1;

		this.PARTICLE_NOISE_TEXTURE = options.particleNoiseTex || null;
		this.PARTICLE_SPRITE_TEXTURE = options.particleSpriteTex || null;

		this.PARTICLES_PER_CONTAINER = Math.ceil( this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS );
		this.PARTICLE_CURSOR = 0;
		this.time = 0;
		this.particleContainers = [];
		this.randomNumbers = [];

		for (this.randomCounter = 1e5; this.randomCounter > 0; this.randomCounter--) {
			this.randomNumbers.push( Math.random() - 0.5 );
		}

		var textureLoader = new THREE.TextureLoader();

		this.particleNoiseTex = this.PARTICLE_NOISE_TEXTURE || textureLoader.load( './fx/smoke2.png' );
		this.particleNoiseTex.wrapS = this.particleNoiseTex.wrapT = THREE.RepeatWrapping;

		this.particleSpriteTex = this.PARTICLE_SPRITE_TEXTURE || textureLoader.load( './fx/smoke1.png' );
		this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

		this.particleShaderMat = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				'uTime': {
					value: 0.0
				},
				'uScale': {
					value: 1.0
				},
				'tNoise': {
					value: this.particleNoiseTex
				},
				'tSprite': {
					value: this.particleSpriteTex
				}
			},
			blending: THREE.NormalBlending,//THREE.AdditiveBlending,
			vertexShader: particleShader.vertexShader,
			fragmentShader: particleShader.fragmentShader
		});

		// define defaults for all values

		this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [ 0, 0, 0, 0 ];
		this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [ 0, 0, 0, 0 ];

		this._init();
	}

	random () {
		return ++this.randomCounter >= this.randomNumbers.length ?
			this.randomNumbers[this.randomCounter = 1] :
			this.randomNumbers[this.randomCounter];
		// return Math.random() - 0.5;
	}

	protected _init () {
		for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
			var c = new GPUParticleContainer(this.PARTICLES_PER_CONTAINER, this);
			this.particleContainers.push(c);
			this.add(c);
		}
	}

	spawnParticle (options: IGPUParticleOptions) {
		this.PARTICLE_CURSOR++;

		if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) {
			this.PARTICLE_CURSOR = 1;
		}

		var currentContainer = this.particleContainers[ Math.floor( this.PARTICLE_CURSOR / this.PARTICLES_PER_CONTAINER ) ];

		currentContainer.spawnParticle(options);
	}

	update (delta) {
		for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
			this.particleContainers[ i ].update(delta);
		}
	}

	dispose () {
		this.particleShaderMat.dispose();
		this.particleNoiseTex.dispose();
		this.particleSpriteTex.dispose();

		for (let i = 0; i < this.PARTICLE_CONTAINERS; i ++) {
			this.particleContainers[ i ].dispose();
		}
	}
}

class GPUParticleContainer extends THREE.Object3D {
	PARTICLE_COUNT: number;
	PARTICLE_CURSOR: number;
	time: number;
	offset: number;
	count: number;
	DPR: number;
	particleUpdate: boolean;
	particleShaderGeo: THREE.BufferGeometry;
	_particleShaderMat: THREE.ShaderMaterial;
	_points: THREE.Points;

	constructor (maxParticles: number, protected _particleSystem: GPUParticleSystem) {
		super();

		this.PARTICLE_COUNT = maxParticles || 100000;
		this.PARTICLE_CURSOR = 0;
		this.time = 0;
		this.offset = 0;
		this.count = 0;
		this.DPR = window.devicePixelRatio;
		this.particleUpdate = false;

		this.particleShaderGeo = new THREE.BufferGeometry();

		this.particleShaderGeo.addAttribute('position', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('positionStart', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('startTime', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('velocity', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('turbulence', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('color', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('size', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ));
		this.particleShaderGeo.addAttribute('lifeTime', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ));

		// material

		this._particleShaderMat = this._particleSystem.particleShaderMat;

		var position = new THREE.Vector3();
		var velocity = new THREE.Vector3();
		var color = new THREE.Color();

		this.init();
	}

	spawnParticle (options?: IGPUParticleOptions) {
		var positionStartAttribute: any = this.particleShaderGeo.getAttribute( 'positionStart' );
		var startTimeAttribute: any = this.particleShaderGeo.getAttribute( 'startTime' );
		var velocityAttribute: any = this.particleShaderGeo.getAttribute( 'velocity' );
		var turbulenceAttribute: any = this.particleShaderGeo.getAttribute( 'turbulence' );
		var colorAttribute: any = this.particleShaderGeo.getAttribute( 'color' );
		var sizeAttribute: any = this.particleShaderGeo.getAttribute( 'size' );
		var lifeTimeAttribute: any = this.particleShaderGeo.getAttribute( 'lifeTime' );

		options = options || {};

		const position = options.position !== undefined ? new THREE.Vector3().copy( options.position ) : new THREE.Vector3();
		const velocity = options.velocity !== undefined ? new THREE.Vector3().copy( options.velocity ) : new THREE.Vector3();
		const color = options.color !== undefined ? new THREE.Color().set( options.color ) : new THREE.Color().set( 0xffffff );

		var positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
		var velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0;
		var colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1;
		var turbulence = options.turbulence !== undefined ? options.turbulence : 1;
		var lifetime = options.lifetime !== undefined ? options.lifetime : 5;
		var size = options.size !== undefined ? options.size : 10;
		var sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
		var smoothPosition = options.smoothPosition !== undefined ? options.smoothPosition : false;

		// debugger;

		if ( this.DPR !== undefined ) size *= this.DPR;

		var i = this.PARTICLE_CURSOR;

		// position

		positionStartAttribute.array[ i * 3 + 0 ] = position.x + ( this._particleSystem.random() * positionRandomness );
		positionStartAttribute.array[ i * 3 + 1 ] = position.y + ( this._particleSystem.random() * positionRandomness );
		positionStartAttribute.array[ i * 3 + 2 ] = position.z + ( this._particleSystem.random() * positionRandomness );

		if ( smoothPosition === true ) {

			positionStartAttribute.array[ i * 3 + 0 ] += - ( velocity.x * this._particleSystem.random() );
			positionStartAttribute.array[ i * 3 + 1 ] += - ( velocity.y * this._particleSystem.random() );
			positionStartAttribute.array[ i * 3 + 2 ] += - ( velocity.z * this._particleSystem.random() );

		}

		// velocity

		var maxVel = 2;

		var velX = velocity.x + this._particleSystem.random() * velocityRandomness;
		var velY = velocity.y + this._particleSystem.random() * velocityRandomness;
		var velZ = velocity.z + this._particleSystem.random() * velocityRandomness;

		velX = THREE.Math.clamp( ( velX - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );
		velY = THREE.Math.clamp( ( velY - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );
		velZ = THREE.Math.clamp( ( velZ - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );

		velocityAttribute.array[ i * 3 + 0 ] = velX;
		velocityAttribute.array[ i * 3 + 1 ] = velY;
		velocityAttribute.array[ i * 3 + 2 ] = velZ;

		// color

		color.r = THREE.Math.clamp( color.r + this._particleSystem.random() * colorRandomness, 0, 1 );
		color.g = THREE.Math.clamp( color.g + this._particleSystem.random() * colorRandomness, 0, 1 );
		color.b = THREE.Math.clamp( color.b + this._particleSystem.random() * colorRandomness, 0, 1 );

		colorAttribute.array[ i * 3 + 0 ] = color.r;
		colorAttribute.array[ i * 3 + 1 ] = color.g;
		colorAttribute.array[ i * 3 + 2 ] = color.b;

		// turbulence, size, lifetime and starttime
		turbulenceAttribute.array[ i ] = turbulence;
		sizeAttribute.array[ i ] = size + this._particleSystem.random() * sizeRandomness;
		lifeTimeAttribute.array[ i ] = lifetime;
		startTimeAttribute.array[ i ] = this.time + this._particleSystem.random() * 2e-2;

		// offset
		if ( this.offset === 0 ) {
			this.offset = this.PARTICLE_CURSOR;
		}

		// counter and cursor

		this.count ++;
		this.PARTICLE_CURSOR ++;

		if ( this.PARTICLE_CURSOR >= this.PARTICLE_COUNT ) {
			this.PARTICLE_CURSOR = 0;
		}

		this.particleUpdate = true;
	}

	init () {
		this._points = new THREE.Points( this.particleShaderGeo, this._particleShaderMat );
		this._points.frustumCulled = false;
		this.add( this._points );
	}

	update (delta) {
		this.time = delta;
		this._particleShaderMat.uniforms.uTime.value = delta;

		this.geometryUpdate();
	}

	geometryUpdate () {
		if ( this.particleUpdate === true ) {
			this.particleUpdate = false;

			var positionStartAttribute: any = this.particleShaderGeo.getAttribute( 'positionStart' );
			var startTimeAttribute: any = this.particleShaderGeo.getAttribute( 'startTime' );
			var velocityAttribute: any = this.particleShaderGeo.getAttribute( 'velocity' );
			var turbulenceAttribute: any = this.particleShaderGeo.getAttribute( 'turbulence' );
			var colorAttribute: any = this.particleShaderGeo.getAttribute( 'color' );
			var sizeAttribute: any = this.particleShaderGeo.getAttribute( 'size' );
			var lifeTimeAttribute: any = this.particleShaderGeo.getAttribute( 'lifeTime' );

			if ( this.offset + this.count < this.PARTICLE_COUNT ) {
				positionStartAttribute.updateRange.offset = this.offset * positionStartAttribute.itemSize;
				startTimeAttribute.updateRange.offset = this.offset * startTimeAttribute.itemSize;
				velocityAttribute.updateRange.offset = this.offset * velocityAttribute.itemSize;
				turbulenceAttribute.updateRange.offset = this.offset * turbulenceAttribute.itemSize;
				colorAttribute.updateRange.offset = this.offset * colorAttribute.itemSize;
				sizeAttribute.updateRange.offset = this.offset * sizeAttribute.itemSize;
				lifeTimeAttribute.updateRange.offset = this.offset * lifeTimeAttribute.itemSize;

				positionStartAttribute.updateRange.count = this.count * positionStartAttribute.itemSize;
				startTimeAttribute.updateRange.count = this.count * startTimeAttribute.itemSize;
				velocityAttribute.updateRange.count = this.count * velocityAttribute.itemSize;
				turbulenceAttribute.updateRange.count = this.count * turbulenceAttribute.itemSize;
				colorAttribute.updateRange.count = this.count * colorAttribute.itemSize;
				sizeAttribute.updateRange.count = this.count * sizeAttribute.itemSize;
				lifeTimeAttribute.updateRange.count = this.count * lifeTimeAttribute.itemSize;
			} else {
				positionStartAttribute.updateRange.offset = 0;
				startTimeAttribute.updateRange.offset = 0;
				velocityAttribute.updateRange.offset = 0;
				turbulenceAttribute.updateRange.offset = 0;
				colorAttribute.updateRange.offset = 0;
				sizeAttribute.updateRange.offset = 0;
				lifeTimeAttribute.updateRange.offset = 0;

				// Use -1 to update the entire buffer, see #11476
				positionStartAttribute.updateRange.count = -1;
				startTimeAttribute.updateRange.count = -1;
				velocityAttribute.updateRange.count = -1;
				turbulenceAttribute.updateRange.count = -1;
				colorAttribute.updateRange.count = -1;
				sizeAttribute.updateRange.count = -1;
				lifeTimeAttribute.updateRange.count = -1;
			}

			positionStartAttribute.needsUpdate = true;
			startTimeAttribute.needsUpdate = true;
			velocityAttribute.needsUpdate = true;
			turbulenceAttribute.needsUpdate = true;
			colorAttribute.needsUpdate = true;
			sizeAttribute.needsUpdate = true;
			lifeTimeAttribute.needsUpdate = true;

			this.offset = 0;
			this.count = 0;
		}
	}

	dispose () {
		this.particleShaderGeo.dispose();
	}
}
