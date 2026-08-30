import MesherBase from "./MesherBase.mjs"
import { scene } from "../../scene.mjs"
const nullUv = new BABYLON.Vector4(0, 0, 0.001, 0.001)
class CylinderMesher extends MesherBase {
	/**/
	constructor() {
		super("cylinder")
	}

	createMesh(brick) {
		const scale = brick.scale
		let x = 1 - scale.x / 1
		let z = 1 - scale.z / 1

		let mesh = BABYLON.MeshBuilder.CreateCylinder("box", { height: scale.y, frontUVs: nullUv, backUVs: nullUv })
		mesh.scaling.x = scale.x
		mesh.scaling.z = scale.z
		mesh.bakeCurrentTransformIntoVertices()
		return mesh
	}
}

export default new CylinderMesher()
