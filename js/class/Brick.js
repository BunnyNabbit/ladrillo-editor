const BABYLON = require("babylonjs")
const BrickMesher = require("./mesher/BrickMesher.js")
const meshers = require("./mesher/index.js")

class Brick {

	constructor(data = {}) {
		this.position = data.position ?? new BABYLON.Vector3(0, 0, 0)
		this.rotation = data.rotation ?? 0
		this.scale = data.scale ?? new BABYLON.Vector3(1, 1, 1)
		this.color = data.color ?? new BABYLON.Color3(0.5, 0.5, 0.5)
		this.alpha = 1
		this.mesher = meshers.getFromName(data.shape)
		this.name = data.name = ""
		// this.world = null
	}

	getClusterKey() {
		const pos = this.position
		return `${Math.round(pos.x / 256)} ${Math.round(pos.y / 256)} ${Math.round(pos.z / 256)}`
	}

	createMesh() {
		return this.mesher.createMesh(this)
	}

	clone() {
		return new Brick({
			position: this.position.clone(),
			rotation: this.rotation,
			scale: this.scale.clone(),
			color: this.color.clone(),
			alpha: this.alpha,
			mesher: this.mesher
		})
	}

	serialize(format = "brk") {
		if (format === "brk") {
			let string = `${this.position.x - (this.scale.x / 2)} ${this.position.z - (this.scale.z / 2)} ${this.position.y - (this.scale.y / 2)} ${this.scale.x} ${this.scale.z} ${this.scale.y} ${this.color.r} ${this.color.g} ${this.color.b} ${this.alpha}\r\n`
			if (this.name) {
				string += `	+NAME ${this.name}\r\n`
			}
			if (this.rotation) {
				string += `	+ROT ${this.rotation}\r\n`
			}
			return string
		}
	}
}

module.exports = Brick