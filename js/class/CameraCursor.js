const pressed = require("../input.js").pressed
const { scene } = require("../scene.js")

class CameraCursor {
	constructor(scene) {
		this.mesh = BABYLON.MeshBuilder.CreateLines("", {
			points: [new BABYLON.Vector3(0, -1, 0), new BABYLON.Vector3(0, 1, 0), new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(-1, 0, 0), new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, 1)]
		}, scene)
		this.mesh.isPickable = false

		this.camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 3, null, scene)
		this.camera.parent = this.mesh // target? nah, this tends to be better, somehow.
		this.camera.lowerRadiusLimit = 1
		this.camera.upperRadiusLimit = 1500
		this.camera.wheelDeltaPercentage = 0.01
		this.camera.inertia = 0.8
		this.camera.inputs.attached.pointers.buttons = [2] // right click only
		this.camera.panningSensibility = 0
		this.speed = 0.02
	}

	handleMovement() {
		let deltaTime = (scene.deltaTime ?? 0) * this.speed
		let dir = this.camera.getForwardRay().direction
		let normal_dir = new BABYLON.Vector2(dir.x, dir.z).normalize()
		let z_movement = 0
		let y_movement = 0
		let x_movement = 0
		if (pressed.has("KeyA")) x_movement -= 1
		if (pressed.has("KeyD")) x_movement += 1
		if (pressed.has("KeyW")) z_movement += 1
		if (pressed.has("KeyS")) z_movement -= 1

		if (pressed.has("KeyE")) {
			y_movement = 1
		} else if (pressed.has("KeyQ")) {
			y_movement = -1
		}

		let normal_move = new BABYLON.Vector2(x_movement, z_movement).normalize().scale(1)
		this.mesh.position.addInPlace(new BABYLON.Vector3(
			normal_move.y * normal_dir.x + normal_move.x * normal_dir.y,
			y_movement,
			normal_move.y * normal_dir.y - normal_move.x * normal_dir.x
		).multiplyByFloats(deltaTime, deltaTime, deltaTime))
	}
}

module.exports = CameraCursor