
import Quadratic from './Quadratic';
import { DAY } from '../core/constants';

export default class Ticker {

	constructor() {
		this.calculationsPerTick = 1;
		this.actualCalculationsPerTick = 1;
		this.secondsPerTick = 1;
		this.deltaTIncrement = 1;
		this.bodies = [];
		this.integration = null;
	}

	setDT() {
		if (!this.calculationsPerTick || !this.secondsPerTick) return;
		if (this.secondsPerTick < this.calculationsPerTick) {
			this.actualCalculationsPerTick = this.secondsPerTick;
		} else {
			this.actualCalculationsPerTick = this.calculationsPerTick;
		}
		this.deltaTIncrement = this.secondsPerTick / this.actualCalculationsPerTick;
		this.secondsPerTick = this.deltaTIncrement * this.actualCalculationsPerTick;
	}

	moveByGravity(jd) {
		for (let t = 1; t <= this.actualCalculationsPerTick; t++) {
			this.integration.moveBodies(jd + (t * this.deltaTIncrement) / DAY, this.deltaTIncrement);
		}
	}

	moveByElements(jd) {
		for (let i = 0; i < this.bodies.length; i++) {
			this.bodies[i].setPositionFromJD(jd);
		}
	}
	
	tick(computePhysics, jd) {
		if (computePhysics) {
			this.moveByGravity(jd - (this.secondsPerTick / DAY));
		} else {
			this.moveByElements(jd);
		}

		for (let i = 0; i < this.bodies.length; i++) {
			this.bodies[i].afterTick(this.secondsPerTick, !computePhysics);
		}
		
		return this.secondsPerTick;
	}
	
	setBodies(b) {
		this.bodies = [ 
			...b,
		];
		this.integration = new Quadratic(this.bodies);
	}
	
	setCalculationsPerTick(n) {
		this.calculationsPerTick = n || this.calculationsPerTick;
		this.setDT();
	}
	
	setSecondsPerTick(s) {
		this.secondsPerTick = s;
		this.setDT();
	}

	getDeltaT() {
		return this.secondsPerTick;
	}
};
