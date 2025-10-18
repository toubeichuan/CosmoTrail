import { Scene, WebGLRenderer, AmbientLight } from 'three';
import Body3D from './Body3d';
import MilkyWay from './MilkyWayParticles';
import CameraManager from './CameraManager';
import OrbitLinesManager from './lines/OrbitLinesManager';
import TracerManager from './lines/TracerManager';
import DebugPoint from './utils/DebugPoint';
import Dimensions from './Dimensions';
import { ExternalSun } from './Sun';
import Labels from '../graphics2d/Labels';
import { PLANET_SCALE_ID } from '../gui/Gui';
import { DEG_TO_RAD, KM } from '../core/constants';
import InfoManager from '../gui/InfoManager';		

let stats;
let renderer;

function drawBody(b) {
	b.draw();
}

export default class CosmoTrailScene {
	createStage(rootDomEl, scenario, gui, universe) {
		this.width = (scenario.sceneSize && scenario.sceneSize.width) || rootDomEl.offsetWidth;
		this.height = (scenario.sceneSize && scenario.sceneSize.height) || rootDomEl.offsetHeight;

		this.universe = universe;
		
		this.bodies3d = [];
		this.bodyScale = 1;
		this.domEl = document.createElement('div');
		this.domEl.id = 'universe';
		this.domEl.style.width = `${this.width}px`;
		this.domEl.style.height = `${this.height}px`;
		rootDomEl.appendChild(this.domEl);


		this.root = new Scene();
		DebugPoint.setContainer(this.root);

		renderer = renderer || new WebGLRenderer({
			antialias: true,
			preserveDrawingBuffer: true,
			alpha: true,
		});

		renderer.setSize(this.width, this.height);
		renderer.setPixelRatio(window.devicePixelRatio);

		const light = new AmbientLight(0x202020);
		this.root.add(light);/**/

		if (!stats) {
			// stats = new Stats();
			// const st = stats.domElement.style;
			// st.top = 'auto';
			// st.bottom = 0;
			// $('body').append(stats.domElement);
		}

		this.domEl.appendChild(renderer.domElement);
		
		gui.addSlider(PLANET_SCALE_ID, { min: 1, max: 100, initial: (scenario.forcedGuiSettings && scenario.forcedGuiSettings.scale) || 10 }, val => {
			this.bodies3d.forEach(body3d => {
				body3d.setScale(val);
			});
			this.bodyScale = val;
			this.draw();
		});

		this.orbitLinesManager = new OrbitLinesManager(scenario.usePhysics);
		this.tracerManager = new TracerManager(this.root);

		this.cameraManager = new CameraManager(this, this.width / this.height, scenario.fov, this.stageSize, this.domEl, universe, this.orbitLinesManager, this.tracerManager, gui);
		this.labels = new Labels(this.domEl, this.cameraManager);

		this.infoManager = new InfoManager(gui, universe);

		this.setMilkyway();

	}

	setCameraDefaults(settings) {
		this.cameraManager.putDefaults(settings);
	}

	setMilkyway() {
		const milkyway = this.milkyway = new MilkyWay(this.stageSize * 6);
		this.root.add(milkyway.getDisplayObject());
	}

	setDimension(largestSMA, smallestSMA, sceneSize) {

		Dimensions.setLargestDimension(largestSMA);
		this.stageSize = Dimensions.getScaled(largestSMA);
		this.smallestSMA = smallestSMA;
	}

	draw() {
		this.bodies3d.forEach(drawBody);

		this.cameraManager.updateCameraMatrix();
		const camPos = this.cameraManager.getCameraPosition();

		this.tracerManager.draw(camPos);

		if (this.milkyway) this.milkyway.setPosition(camPos);

		const cam = this.cameraManager.getCamera();
		if (this.sun) this.sun.draw(cam, camPos);

		renderer.render(this.root, cam);

		const radFov = cam.fov * DEG_TO_RAD;
		this.labels.draw(camPos, radFov, this.width, this.height);

		if (stats) stats.update();
	}

	updateCamera() {
		this.cameraManager.updateCamera();
	}

	getCamera() {
		return this.cameraManager.getCamera();
	}

	onDateReset() {
		this.updateCamera();
		this.orbitLinesManager.resetAllOrbits();
		this.tracerManager.resetTrace();
		this.draw();
	}


	addBody(celestialBody) {

		let body3d;
		if (celestialBody.createCustomDisplayObject) {
			body3d = celestialBody.createCustomDisplayObject();
		} else {
			body3d = new Body3D(celestialBody);
		}

		this.labels.addPlanetLabel(celestialBody.title || celestialBody.name, body3d);

		this.bodies3d.push(body3d);
		this.root.add(body3d.getDisplayObject());

		this.orbitLinesManager.addBody(body3d);
		this.tracerManager.addBody(body3d);
		this.cameraManager.addBody(body3d);

	}

	addEventLabel(tx, pos, relativeTo) {
		this.labels.addEventLabel(tx, pos, relativeTo);	
	}

	getRoot() {
		return this.root;
	}

	getDomEl() {
		return this.domEl;
	}

	getSize() {
		return this.stageSize;
	}

	getAspectRatio() {
		return this.width / this.height;
	}


	setCentralBody(centralBody) {
		this.centralBody = centralBody;
		const central3d = centralBody.getBody3D();
		central3d.maxScale = (this.smallestSMA / (centralBody.radius * KM)) * 0.2;
		central3d.maxScale = central3d.maxScale < 1 ? 1 : central3d.maxScale;

		const maxDim = central3d.maxScale * centralBody.radius * KM;
		let maxScaleVal = 0;
		this.bodies3d.forEach(body3d => {
			body3d.maxScale = (maxDim / (body3d.celestial.radius * KM));
			maxScaleVal = maxScaleVal > body3d.maxScale ? maxScaleVal : body3d.maxScale;
		});

		if (this.centralBody.name === 'sun') {
			this.sun = central3d;
		} else {
			this.sun = new ExternalSun(centralBody, this.universe, this.getAspectRatio(), this.stageSize);
			this.root.add(this.sun.getDisplayObject());
		}

	}

	kill() {
		this.cameraManager.kill();
		this.orbitLinesManager.kill();
		this.tracerManager.kill();
		this.labels.kill();
		this.domEl.remove();
	}

};
