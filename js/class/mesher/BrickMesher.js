const MesherBase = require("./MesherBase.js")
const { scene } = require("../../scene.js")
class BrickMesher extends MesherBase {
	constructor() {
		super("")
	}
	createMesh(brick) {
		const scale = brick.scale
		let x = 1 - (scale.x / 1)
		let z = 1 - (scale.z / 1)
		let faceUV = []
		faceUV[0] = new BABYLON.Vector4(0.001, 0.001, 0.002, 0.002) // x, y, 1, 1 //0.001, 0.001, 0.002, 0.002
		faceUV[1] = new BABYLON.Vector4(0.001, 0.001, 0.002, 0.002) // x, y, 1, 1 //0.001, 0.001, 0.002, 0.002
		faceUV[2] = new BABYLON.Vector4(0.001, 0.001, 0.002, 0.002) // y, z, 1, 1 //0.001, 0.001, 0.002, 0.002
		faceUV[3] = new BABYLON.Vector4(0.001, 0.001, 0.002, 0.002) // y, z, 1, 1 //0.001, 0.001, 0.002, 0.002
		faceUV[4] = new BABYLON.Vector4(z, x, 1, 1) // z, x, 1, 1 
		faceUV[5] = new BABYLON.Vector4(z, x, 1, 1) // z, x, 1, 1 

		let box = BABYLON.MeshBuilder.CreateBox("box", { height: scale.y, width: scale.x, depth: scale.z, faceUV: faceUV }, null);
		return box
	}
}

module.exports = new BrickMesher()