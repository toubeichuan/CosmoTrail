import { Vector3 } from 'three';

export default {
	scale: 1,

	setLargestDimension(dim) {
		this.scale = 1000 / dim;
	},

	getScaled(obj) {
		if (obj instanceof Vector3) {
			return obj.multiplyScalar(this.scale);
		} 
		return obj * this.scale;
	},
	
};
