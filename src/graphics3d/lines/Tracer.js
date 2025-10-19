import { Vector3, Object3D, LineBasicMaterial, BufferGeometry, Line, BufferAttribute } from 'three';
import { darken, hexToRgb, rgbToHex } from '../../utils/ColorUtils';

const SWITCH_TRESHOLD = 0.005;
const vNorm = new Vector3(1, 0, 0);

export default class Tracer {
	constructor(color, nVertices, name) {
		this.name = name;
		this.color = rgbToHex(darken(hexToRgb(color), 0.7));
		this.points = [];
		this.nVertices = nVertices;
		this.lastVertexIdx = this.nVertices - 1;
		this.lastMod = 0;
		this.root = new Object3D();
		this.tracePosition = new Vector3();
	}

	getDisplayObject() {
		return this.root;
	}

	getNew() {
		
		this.detachTrace();

		const material = new LineBasicMaterial({
			color: this.color,
			lineWidth: 4,
		});

		this.geom = new BufferGeometry();
		const vertices = new Float32Array(this.nVertices * 3);
		for (let i = 0; i < this.nVertices; i++) {
			vertices[i * 3] = 0;
			vertices[i * 3 + 1] = 0;
			vertices[i * 3 + 2] = 0;
		}
		this.geom.setAttribute('position', new BufferAttribute(vertices, 3));
		
		this.line = new Line(this.geom, material);
		this.line.frustumCulled = false;
		this.currentVertex = 0;
		this.initCallback = this.changeVertex.bind(this);
		this.attachTrace();
	}

	detachTrace() {
		if (this.line) this.root.remove(this.line);
	}

	attachTrace() {
		if (this.line) this.root.add(this.line);
	}

	setTraceFrom(traceFromBody) {
		if (this.traceFrom !== traceFromBody) this.getNew();
		this.traceFrom = traceFromBody;
		if (!traceFromBody) {
			this.root.position.set(0, 0, 0);
		}
	}

	changeVertex() {
		this.lastPathDirection = null;
		this.switchVertex = this.currentVertex === this.lastVertexIdx;
		if (this.currentVertex < this.lastVertexIdx) this.currentVertex++;
	}

	draw(fromPos) {
		if (!this.geom) return;
		const pos = this.setTracePos(fromPos);
		
		const positionAttribute = this.geom.attributes.position;
		const vertices = positionAttribute.array;
		
		const currentIndex = this.currentVertex * 3;
		if (currentIndex < vertices.length) {
			const distance = Math.sqrt(
				Math.pow(vertices[currentIndex] - pos.x, 2) +
				Math.pow(vertices[currentIndex + 1] - pos.y, 2) +
				Math.pow(vertices[currentIndex + 2] - pos.z, 2)
			);
			
			if (distance === 0) return;
		}
		
		positionAttribute.needsUpdate = true;
		
		if (this.currentVertex < this.lastVertexIdx) {
			for (let i = this.currentVertex; i < this.nVertices; i++) {
				const idx = i * 3;
				vertices[idx] = pos.x;
				vertices[idx + 1] = pos.y;
				vertices[idx + 2] = pos.z;
			}
		} else {
			if (this.switchVertex) {
				for (let i = 0; i < this.lastVertexIdx; i++) {
					const idx1 = i * 3;
					const idx2 = (i + 1) * 3;
					vertices[idx1] = vertices[idx2];
					vertices[idx1 + 1] = vertices[idx2 + 1];
					vertices[idx1 + 2] = vertices[idx2 + 2];
				}
				this.switchVertex = false;
			}
			
			const lastIdx = this.lastVertexIdx * 3;
			vertices[lastIdx] = pos.x;
			vertices[lastIdx + 1] = pos.y;
			vertices[lastIdx + 2] = pos.z;
		}

		const v2Idx = (this.currentVertex - 2) * 3;
		const v1Idx = (this.currentVertex - 1) * 3; 
		const v0Idx = this.currentVertex * 3;
		
		if (v1Idx >= 0 && v2Idx >= 0) {
			if (!this.lastPathDirection) {
				const a = new Vector3(
					vertices[v1Idx] - vertices[v2Idx],
					vertices[v1Idx + 1] - vertices[v2Idx + 1],
					vertices[v1Idx + 2] - vertices[v2Idx + 2]
				);
				this.lastPathDirection = Math.abs(a.angleTo(vNorm));
			}
			
			const curPath = new Vector3(
				pos.x - this.previousPos.x,
				pos.y - this.previousPos.y,
				pos.z - this.previousPos.z
			);
			
			const diff = Math.abs(this.lastPathDirection - Math.abs(curPath.angleTo(vNorm)));
			if (diff > SWITCH_TRESHOLD) {
				this.changeVertex();
			}
		}

		if (v1Idx < 0 || v2Idx < 0) {
			this.changeVertex();
		}
		this.previousPos = pos;
	}

	setTracePos(pos) {
		if (this.traceFrom) {
			this.root.position.copy(this.traceFrom.getPosition());
			pos.sub(this.traceFrom.getPosition());
		}
		return pos;
	}
}