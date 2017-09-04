import AINode from './AINode';

export interface IAINodeConnection {
	distanceScore: number;
}

export interface IPathfinderRoute {
	startNode: AINode;
	endNode: AINode;
	items: Array<AINode>;
}
