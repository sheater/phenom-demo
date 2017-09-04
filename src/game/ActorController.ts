import World from './World';
import { IActorControllerInterface } from './types';

export default class ActorController {
	constructor (protected actor: IActorControllerInterface, protected world: World) {}

	frame (delta: number): void {}
}
