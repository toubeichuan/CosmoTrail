import $ from 'jquery';
import Gui, { SCENARIO_ID} from '../gui/Gui';
import Universe from './Universe';
import Preloader from '../gui/Preloader';
import ScenarioLoader from '../scenario/Loader';

function getInitialSettings() {
	const parts = window.location.search.substr(1).split('&');
	const qstr = parts.reduce((carry, part) => {
		const pair = part.split('=');
		carry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		return carry;
	}, (window.CosmoTrail && window.CosmoTrail.defaults) || {});

	if (typeof qstr.cx !== 'undefined') {
		qstr.cameraSettings = {
			x: qstr.cx,
			y: qstr.cy,
			z: qstr.cz,
			fov: qstr.fov,
		};
	} 

	return qstr;
}


export default class CosmoTrail {
	constructor(rootElementId) {
		this.rootElement = (rootElementId && document.getElementById(rootElementId)) || document.body;
		this.preloader = new Preloader(this.rootElement);

		this.preloader.remove();
		this.gui = new Gui();

		const defaultParams = Object.assign({}, getInitialSettings());
		this.gui.setDefaults(defaultParams);

		const scenarios = ScenarioLoader.getList();
		const scenarioChanger = this.gui.addDropdown(SCENARIO_ID, () => {
			this.preloader.show();
			this.loadScenarioFromName(scenarioChanger.getValue());
			console.log(scenarioChanger)
		}, false);

		const defaultScenario = scenarios.reduce((carry, scenario, idx) => {
			//find ID of loaded scenario
			if (defaultParams.scenario && scenario.name === defaultParams.scenario) {
				return idx;
			}
			return carry;
		}, 0);	

		//add scenarios to dropdown. Last param prevents callback from being executed on ready, as we already have the correct scenario loaded as default, we don't need to auto reload it when assets are ready.
		scenarios.forEach((scenario, idx) => {
			scenarioChanger.addOption(scenario.title, scenario.name, idx === defaultScenario, false);
		});

		this.loadDefaultScenario = () => {
			this.loadScenarioFromName(scenarios[defaultScenario].name, defaultParams);
		}

		
	}

	loadScenarioFromName(name, defaultParams) {
		if (this.activeScenario && name === this.activeScenario.name) {
			this.preloader.remove();
			return;
		}
		const scenarioConfig = ScenarioLoader.get(name);
		this.loadScenario(scenarioConfig, defaultParams);
	}

	loadScenario(scenarioConfig, defaultParams) {
		if (this.activeScenario) {
			this.activeScenario.kill();
		}
		if (!scenarioConfig) return Promise.resolve(null);
		this.activeScenario = new Universe(this.rootElement, scenarioConfig, defaultParams, this.gui);
		return this.activeScenario.onSceneReady.then(() => this.preloader.remove()).catch((e) => {
			console.log(e);	// eslint-disable-line
		}).then(() => {
			return this.activeScenario;
		});
	}
};
