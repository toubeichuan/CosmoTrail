
import { Object3D, MeshPhongMaterial, Mesh, SphereGeometry, MeshLambertMaterial, DoubleSide, Euler, Quaternion } from 'three';
import RingGeometry2 from '../three/RingGeometry2';
import ResourceLoader from '../loaders/ResourceLoader';
import Dimensions from './Dimensions';
import { KM, DEG_TO_RAD, QUARTER_CIRCLE } from '../core/constants';


export default class Body3D {

	constructor(celestialBody) {
		this.root = new Object3D();
		this.celestial = celestialBody;
		this.maxDeltaForSiderealDay = this.celestial.siderealDay && this.celestial.siderealDay / 20;

		this.setDisplayObject();

		this.celestial.getBody3D = () => {
			return this;
		};

	}

	getDisplayObject() {
		return this.root;
	}

	setTracer(tracer) {
		this.tracer = tracer;
	}

	setOrbitLines(orbitLines) {
		this.orbitLines = orbitLines;
	}

	getOrbitLines() {
		return this.orbitLines;
	}

	getTraceRelativeToBody() {
		return this.celestial.universe.getBody(this.celestial.traceRelativeTo || this.celestial.relativeTo);
	}

	setDisplayObject() {
		const map = this.celestial.map;
		const matOptions = {};
		let onMaterialReady;
		if (map) {
			onMaterialReady = ResourceLoader.loadTexture(map).then((planetMap) => {
				matOptions.map = planetMap;
				return matOptions;
			});
		} else {
			matOptions.color = this.celestial.color;
			onMaterialReady = Promise.resolve(matOptions);
		}
		this.planet = new Object3D();

		onMaterialReady.then((def) => {
			const mat = Object.assign(new MeshPhongMaterial(def), this.celestial.material || {});
			const radius = this.getPlanetSize();
			const segments = 50;
			const rings = 50;
			const sphere = new Mesh(
				new SphereGeometry(radius, segments, rings),
				mat
			);
			this.planet.add(sphere);
		});

		if (this.celestial.ring) {
			ResourceLoader.loadTexture(this.celestial.ring.map).then(ringMap => {
				const ringSize = [
					Dimensions.getScaled(this.celestial.ring.innerRadius * KM),
					Dimensions.getScaled(this.celestial.ring.outerRadius * KM),
				];
				
				const ringMaterial = new MeshLambertMaterial({
					map: ringMap,
					transparent: true,
					side: DoubleSide,
				});

				const ringGeometry = new RingGeometry2(ringSize[1], ringSize[0], 180, 1, 0, Math.PI * 2);
				ringGeometry.computeFaceNormals();

				const ring = new Mesh(ringGeometry, ringMaterial);
				ring.rotation.x = -Math.PI / 2;
				this.planet.add(ring);
			});
			
		}
		
		this.planet.rotation.copy(this.celestial.getTilt(QUARTER_CIRCLE));

		this.root.add(this.planet);
		return this.planet;
	}

	setScale(scaleVal) {
		if (this.maxScale && this.maxScale < scaleVal) return;
		this.scale = scaleVal;
		this.planet.scale.set(this.scale, this.scale, this.scale);
	}

	getPlanetSize() {
		return Dimensions.getScaled(this.celestial.radius * KM);
	}

	getPlanetStageSize() {
		return this.getPlanetSize() * (this.scale || 1);
	}

	addCamera(name, camera) {
		
		this.root.add(camera);
		this.cameras = this.cameras || {};
		this.cameras[name] = camera;
	}

	getCamera(name) {
		return this.cameras && this.cameras[name];
	}
	
	draw() {
		const pos = this.getPosition();
		this.root.position.copy(pos);

		if (this.celestial.siderealDay) {
			const qTilt = new Quaternion().setFromEuler(this.celestial.getTilt(QUARTER_CIRCLE));
			const qRot = new Quaternion().setFromEuler(new Euler(0, (this.celestial.baseMapRotation || 0) + this.celestial.getCurrentRotation()), 0, 'XYZ');
			const q = new Quaternion().multiplyQuaternions(qTilt, qRot);
			this.planet.setRotationFromQuaternion(q);
		}

		if (this.tracer) this.tracer.draw(pos);
		if (this.orbitLines) this.orbitLines.draw(Dimensions.getScaled(this.celestial.getRelativePosition()));
		return pos;
	}

	getScreenSizeRatio(camPos, fov) {
		const sz = this.getPlanetStageSize();
		const dist = this.getPosition().sub(camPos).length();

		const height = 2 * Math.tan((fov * DEG_TO_RAD) / 2) * dist;
		return sz / height;
	}

	getPosition(pos) {
		const curPosition = (pos && pos.clone()) || this.celestial.getPosition(this.maxPrecision);
		return Dimensions.getScaled(curPosition);
	}

	getName() {
		return this.celestial.name;
	}

}
