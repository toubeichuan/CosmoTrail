import { BufferGeometry, Sphere, Vector3, Vector2, BufferAttribute } from 'three';

/** A modification of the standard three.js RingGeometry class, but with changes to support 
 * Celestia-like ring textures.
 */
class RingGeometry2 extends BufferGeometry {
  constructor(innerRadius, outerRadius, thetaSegmentsP, phiSegmentsP, thetaStart = 0, thetaLength = Math.PI * 2) {
    super();

    const thetaSegments = thetaSegmentsP !== undefined ? Math.max(3, thetaSegmentsP) : 8;
    const phiSegments = phiSegmentsP !== undefined ? Math.max(3, phiSegmentsP) : 8;
    
    let i;
    let o;
    const vertices = [];
    const uvs = [];
    const indices = [];
    let radius = innerRadius || 0;
    const radiusStep = (((outerRadius || 50) - radius) / phiSegments);
    
    for (i = 0; i <= phiSegments; i++) { //concentric circles inside ring
      for (o = 0; o <= thetaSegments; o++) { //number of segments per circle
        const vertex = new Vector3();
        
        vertex.x = radius * Math.cos(thetaStart + o / thetaSegments * thetaLength);
        vertex.y = -radius * Math.sin(thetaStart + o / thetaSegments * thetaLength);
        
        vertices.push(vertex.x, vertex.y, vertex.z);
        uvs.push((i / phiSegments), (vertex.y / radius + 1) / 2);
      }
      
      radius += radiusStep;
    }
    
    const n = new Vector3(0, 0, 1);
    
    for (i = 0; i < phiSegments; i++) { //concentric circles inside ring
      for (o = 0; o <= thetaSegments; o++) { //number of segments per circle
        let v1;
        let v2;
        let v3;

        v1 = o + (thetaSegments * i) + i;
        v2 = o + (thetaSegments * i) + thetaSegments + i;
        v3 = o + (thetaSegments * i) + thetaSegments + 1 + i;

        indices.push(v1, v2, v3);
        
        v1 = o + (thetaSegments * i) + i;
        v2 = o + (thetaSegments * i) + thetaSegments + 1 + i;
        v3 = o + (thetaSegments * i) + 1 + i;
        
        indices.push(v1, v2, v3);
      }
    }
    
    this.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    this.setIndex(indices);
    
    this.computeVertexNormals();

    this.boundingSphere = new Sphere(new Vector3(), radius); 
  }
}

export default RingGeometry2;