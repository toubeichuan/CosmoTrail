
import OrbitLine from '../lines/OrbitLine';
import { DAY } from '../../core/constants';

export default class BodyOrbitLines {
			
	constructor(body3d, isForceSolidLines) {
		this.isForceSolidLines = isForceSolidLines;
		this.body3d = body3d;
		this.celestial = body3d.celestial;
		this.setOrbitLines();

		if (this.celestial.useCustomComputation) {
			this.computeVerticesInDeltaT = (n) => {
				const dt = this.celestial.universe.getTickerDeltaT() / DAY;
				const startJd = this.celestial.currentJD - dt;
				const inc = dt / n;
				const v = [];
				for (let i = 0; i < n; i++) {
					const jd = startJd + (i * inc);
					v.push(this.celestial.calculatePosition(jd));
				}
				return v;
			};
		}
	}

	getName() {
		return this.body3d.getName();
	}

	setOrbitLines() {
		const orbitVertices = this.celestial.getOrbitVertices(this.celestial.showSolidOrbit);
		if (orbitVertices) {
			if (!this.orbitLine) {
				this.orbitLine = new OrbitLine(this.celestial.name, this.celestial.color, this.celestial.showSolidOrbit || this.isForceSolidLines);
			}
			this.orbitLine.setLine(orbitVertices);

			const central = this.celestial.universe.getBody();
			if (!this.celestial.relativeTo || this.celestial.relativeTo === central.name) {
				const eclipticVertices = orbitVertices.map(val => val.clone().negate());
				if (!this.eclipticLine) {
					this.eclipticLine = new OrbitLine(this.celestial.name, central.color, true);
				}
				this.eclipticLine.setLine(eclipticVertices);
			}

			if (this.celestial.useCustomComputation && this.celestial.showSolidOrbit) {
				this.celestial.setOnRevolution(() => this.recalculateOrbitLine(false));
			}

		}
	}

	recalculateOrbitLine(isForced) {
		if (!isForced && !this.celestial.useCustomComputation) return;
		const orbitVertices = this.celestial.getOrbitVertices(this.celestial.showSolidOrbit);
		if (orbitVertices) {
			const wasAdded = this.orbitLine.added;
			this.hideOrbit();
			this.orbitLine.setLine(orbitVertices);
			if (wasAdded) {
				this.showOrbit();
			}
		}
	}

	showEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = true;
		this.body3d.getDisplayObject().add(this.eclipticLine.getDisplayObject());
	}

	hideEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = false;
		this.body3d.getDisplayObject().remove(this.eclipticLine.getDisplayObject());
	}

	showOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = true;
		this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
	}

	hideOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = false;
		this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
	}

	getOrbitContainer() {
		const thisCentralBody = this.body3d.getTraceRelativeToBody();
		return (thisCentralBody && thisCentralBody.getBody3D().getDisplayObject()) || this.celestial.universe.getScene().getRoot();
	}

	draw(pos) {
		if (this.orbitLine && this.orbitLine.added && this.orbitLine.isGradient) {
			this.orbitLine.updatePos(pos, this.celestial.getRelativeVelocity(), this.computeVerticesInDeltaT);
		}
	}

	getVertices() {
		return this.orbitLine && this.orbitLine.orbitVertices;
	}

	kill() {
		this.celestial.setOnRevolution(null);
	}

};
