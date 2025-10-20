import { LineBasicMaterial, BufferGeometry, Line, BufferAttribute, VertexColors } from 'three';
import Dimensions from '../Dimensions';
import DebugPoint from '../utils/DebugPoint';
import { darken, hexToRgb, rgbToHex } from '../../utils/ColorUtils';
import {QUARTER_CIRCLE } from '../../core/constants';


export default class OrbitLine {
	constructor(name, color, isSolid) {
		this.name = name;
		this.added = false;
		this.isSolid = isSolid;
		this.isGradient = !isSolid;
		this.color = color;
	}

	createSolidLine(orbitVertices) {
		const material = new LineBasicMaterial({
			color: rgbToHex(darken(hexToRgb(this.color), 0.5)),
		});
		this.orbitVertices = orbitVertices.map(val => Dimensions.getScaled(val.clone()));
		
		const orbitGeom = new BufferGeometry();
		const vertices = new Float32Array(orbitVertices.length * 3);
		this.orbitVertices.forEach((vertex, i) => {
			vertices[i * 3] = vertex.x;
			vertices[i * 3 + 1] = vertex.y;
			vertices[i * 3 + 2] = vertex.z;
		});
		orbitGeom.setAttribute('position', new BufferAttribute(vertices, 3));

		return new Line(orbitGeom, material);
	}

	createGradientLine(orbitVertices) {
		const l = orbitVertices.length;
		this.orbitVertices = orbitVertices.map((val) => {
			return Dimensions.getScaled(val.clone());
		});

		this.nVertices = this.orbitVertices.length;

		const nNumbers = this.nPos = l * 3;

		const pos = this.positions = new Float32Array(3 + nNumbers);
		this.buildPositions();

		pos[nNumbers] = this.orbitVertices[0].x;
		pos[nNumbers + 1] = this.orbitVertices[0].y;
		pos[nNumbers + 2] = this.orbitVertices[0].z;
		

		const origColor = hexToRgb(this.color);
		const colors = orbitVertices.map((v, i) => {
			return darken(origColor, 1 - i / l);
		}).reduce((a, c, i) => {
			const n = i * 3;			
			a[n] = c.r / 255;
			a[n + 1] = c.g / 255;
			a[n + 2] = c.b / 255;
			return a;
		}, new Float32Array(3 + nNumbers));
		
		colors[nNumbers] = origColor.r / 255;
		colors[nNumbers + 1] = origColor.g / 255;
		colors[nNumbers + 2] = origColor.b / 255;

		const material = new LineBasicMaterial({
			vertexColors: true,
		});
		const orbitGeom = this.geometry = new BufferGeometry();

		orbitGeom.setAttribute('position', new BufferAttribute(pos, 3));
		orbitGeom.setAttribute('color', new BufferAttribute(colors, 3));

		return new Line(orbitGeom, material);
	}

	buildPositions() {
		for (let i = 0; i < this.nVertices; i++) {
			const v = this.orbitVertices[i];
			const n = i * 3;
			this.positions[n] = v.x;
			this.positions[n + 1] = v.y;
			this.positions[n + 2] = v.z;
		}
	}

	setLine(orbitVertices) {
		this.line = this.isSolid ? this.createSolidLine(orbitVertices) : this.createGradientLine(orbitVertices);
	}

	showAllVertices() {
		DebugPoint.removeAll();
		this.orbitVertices.forEach(v => DebugPoint.add(v, 0xaaaaaa, 0.01));
	}

	updatePos(pos, vel, getNewVertices) {

		const numberBehind = this.getNVerticesBehindPos(pos, vel);
		this.geometry.attributes.position.needsUpdate = true;
		
		if (numberBehind) {
			const newVertices = getNewVertices && getNewVertices(numberBehind).map(val => Dimensions.getScaled(val));

			const sorted = [];
			let verticesDeck = this.orbitVertices;
			for (let inc = 0, index = numberBehind; inc < this.nVertices; inc++, index++) {
				if (index === this.nVertices) {
					index = 0;
					verticesDeck = newVertices || this.orbitVertices;
				}
				sorted[inc] = verticesDeck[index];
			}
			if (!newVertices) {
				const startVertex = sorted[this.nVertices - 2];
				const dumpedVertex = sorted[this.nVertices - 1];
				const vLen = startVertex.distanceTo(dumpedVertex);
				const newVertex = pos.clone().sub(startVertex).setLength(vLen).add(startVertex);
				sorted[this.nVertices - 1] = newVertex;
			}
		
			this.orbitVertices = sorted;
			this.buildPositions();
		}

		this.positions[this.nPos] = pos.x;
		this.positions[this.nPos + 1] = pos.y;
		this.positions[this.nPos + 2] = pos.z;

	}
	

	getNVerticesBehindPos(pos, vel) {
		const lookAway = vel.negate();

		for (let i = 0; i < this.nVertices; i++) {
			const vertex = this.orbitVertices[i];
			const diff = vertex.clone().sub(pos);
			const angle = diff.angleTo(lookAway);
			if (angle >= QUARTER_CIRCLE) {
				return i;
			}
		}
		return null;
	}

	getDisplayObject() {
		return this.line;
	}

}