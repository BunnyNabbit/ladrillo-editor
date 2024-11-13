const { scene } = require("./scene")
const BrickMesher = require("./class/mesher/BrickMesher.js")
// Create utility layer the gizmos will be rendered on
const utilLayer = new BABYLON.UtilityLayerRenderer(scene)
// Create the gizmo
const positionGizmo = new BABYLON.PositionGizmo(utilLayer, 8)
const EventEmitter = require('events')

// scale gizmo (is actually several single axis gizmos)
class ScaleFaker extends EventEmitter {
	constructor(scene) {
		super()
		const vectors = [
			[new BABYLON.Vector3(1, 0, 0), "#00b894"],
			[new BABYLON.Vector3(-1, 0, 0), "#00b894"],
			[new BABYLON.Vector3(0, 1, 0), "#00b894"],
			[new BABYLON.Vector3(0, -1, 0), "#00b894"],
			[new BABYLON.Vector3(0, 0, 1), "#00b894"],
			[new BABYLON.Vector3(0, 0, -1), "#00b894"],
		]
		this.gizmos = []
		this.forcedPosition = new BABYLON.Vector3(0, 0, 0)
		this.targetMesh = new BABYLON.Mesh("scaleFaker", scene)
		this.targetMesh.isPickable = false
		this.currentAttached = null
		this.active = false

		vectors.forEach(datum => {
			const vector = datum[0]
			const color = datum[1]
			var gizmo = new BABYLON.AxisDragGizmo(vector, BABYLON.Color3.FromHexString(color), utilLayer, null, 8)
			gizmo.attachedMesh = null
			gizmo.snapDistance = 1
			gizmo.updateGizmoRotationToMatchAttachedMesh = false
			gizmo.updateGizmoPositionToMatchAttachedMesh = true
			gizmo.onSnapObservable.add((event) => {
				setTimeout(() => { // very pitiful. i have to do this because the mesh is updated after this function is fired
					const differenceVector3 = this.targetMesh.position.subtract(this.forcedPosition)
					this.forcedPosition = new BABYLON.Vector3(this.targetMesh.position.x, this.targetMesh.position.y, this.targetMesh.position.z)
					// this.targetMesh.position = new BABYLON.Vector3(this.forcedPosition.x, this.forcedPosition.y, this.forcedPosition.z)
					this.emit("update", differenceVector3, vector)
				}, 0)
			})
			this.gizmos.push(gizmo)
		})
	}
	attachToPosition(vec3) {
		let target = this.targetMesh
		if (!vec3) {
			target = null
		} else {
			this.forcedPosition = new BABYLON.Vector3(vec3.x, vec3.y, vec3.z)
			this.targetMesh.position = new BABYLON.Vector3(vec3.x, vec3.y, vec3.z)
		}
		this.currentAttached = target
		this.updateAttachedMesh()
	}
	updateAttachedMesh() {
		let target = this.currentAttached
		if (!this.active) target = null
		this.gizmos.forEach(gizmo => {
			gizmo.attachedMesh = target
		})
	}
	setActive(bool) {
		this.active = bool
		this.updateAttachedMesh()
	}
}
const scaleFaker = new ScaleFaker(scene)

// const scaleGizmo = new BABYLON.ScaleGizmo(utilLayer, 8)
// scaleGizmo.snapDistance = 1
// scaleGizmo.updateGizmoPositionToMatchAttachedMesh = true
// scaleGizmo.attachedMesh = null
// scaleGizmo.uniformScaleGizmo.isEnabled = false
// scaleGizmo.sensitivity = 5
// const scaleFaker = new BABYLON.Mesh("scaleFaker", scene)
// scaleFaker.scaling = new BABYLON.Vector3(1, 1, 1)
// const scaleFaker = BrickMesher.createMesh({scale: new BABYLON.Vector3(0.01, 0.01, 0.01)})
// scaleFaker.scaling = new BABYLON.Vector3(1000, 1000, 1000)


// positionGizmo.planarGizmoEnabled = true // sadly, this doesn't behave well with snapDistance
positionGizmo.attachedMesh = null

// Keep the gizmo fixed to world rotation
positionGizmo.updateGizmoRotationToMatchAttachedMesh = false
positionGizmo.updateGizmoPositionToMatchAttachedMesh = true
positionGizmo.snapDistance = 1
positionGizmo.active = false
positionGizmo.updateAttachedMesh = function () {
	if (positionGizmo.active) positionGizmo.attachedMesh = positionGizmo._attached
}
positionGizmo.attach = function (mesh) {
	positionGizmo._attached = mesh
	positionGizmo.updateAttachedMesh()
}
positionGizmo.setActive = function (bool) {
	positionGizmo.active = bool
	if (bool) {
		positionGizmo.updateAttachedMesh()
	} else {
		positionGizmo.attachedMesh = null
	}
}

module.exports = {
	positionGizmo,
	// scaleGizmo,
	utilLayer,
	scaleFaker
}