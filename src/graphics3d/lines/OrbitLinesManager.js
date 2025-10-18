import BodyOrbitLines from './BodyOrbitLines';

export default class OrbitLinesManager {
	constructor(isForceSolidLines) {
		this.isForceSolidLines = isForceSolidLines;
		this.orbits = [];
	}

	hideAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.hideOrbit();
		});
	}
	
	showAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.showOrbit();
		});
	}
	
	hideAllEcliptics() {
		this.orbits.forEach(orbit => {
			orbit.hideEcliptic();
		});
	}

	findOrbitIndex(name) {
		return this.orbits.findIndex(testOrbit => testOrbit.getName() === name);
	}

	getOrbitFromName(name) {
		const idx = this.findOrbitIndex(name);
		return ~idx ? this.orbits[idx] : null;
	}

	addBody(body3d) {
		const orbit = new BodyOrbitLines(body3d, this.isForceSolidLines);
		body3d.setOrbitLines(orbit);
		const idx = this.findOrbitIndex(body3d.getName());
		if (!~idx) {
			this.orbits.push(orbit);
		} else {
			this.orbits[idx] = orbit;
		}
	}
	
	onCameraChange(lookFromBody, lookAtBody) {

		const lookFromBodyOrbit = lookFromBody && this.getOrbitFromName(lookFromBody.getName());
		const lookAtBodyOrbit = lookAtBody && this.getOrbitFromName(lookAtBody.getName());

		if (lookFromBodyOrbit) {
			this.hideAllOrbits();
			this.hideAllEcliptics();
			
			lookFromBodyOrbit.showEcliptic();

			if (lookAtBodyOrbit && lookAtBody.celestial.isOrbitAround(lookFromBody.celestial) && !lookAtBody.celestial.maxPrecision) {
				lookAtBodyOrbit.showOrbit();
			}

		} else {
			this.resetAllOrbits();
			this.showAllOrbits();
			this.hideAllEcliptics();
		}
	}

	resetAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.recalculateOrbitLine(true);
		});
	}

	kill() {
		this.orbits.forEach(orbit => {
			orbit.kill();
		});
	}
};
