let BABYLON = require('babylonjs')

const { scene, canvas, engine } = require("./scene")

const CameraCursor = require("./class/CameraCursor.js")

const cameraCursor = new CameraCursor(scene)
cameraCursor.camera.attachControl(canvas, false)


// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
	engine.resize()
})
// Render loop
engine.runRenderLoop(function () {
	cameraCursor.handleMovement()
	scene.render()
})

// mousy input

const { positionGizmo, scaleFaker } = require("./gizmos.js")

scene.onPointerObservable.add((pointerInfo) => {
	// if (pointerInfo.event.button == 2) console.log(pointerInfo.type)
	if (pointerInfo.event.button == 2) { // hold
		if (pointerInfo.type == 1) {
			if (canvas.requestPointerLock) {
				canvas.requestPointerLock()
			}
		} else if (pointerInfo.type == 2) { // release
			document.exitPointerLock()
		}
	}
	switch (pointerInfo.type) {
		case BABYLON.PointerEventTypes.POINTERDOWN:
			handleClick(pointerInfo)
			break;
		case 4:
			if (pointerInfo.event.buttons === 3) break
			handleClick(pointerInfo)
			break
	}
})

function handleClick(pointerInfo) {
	if (pointerInfo.event.button == 0) {
		console.log(pointerInfo.event)
		leftClick([pointerInfo.event.ctrlKey, pointerInfo.event.shiftKey], pointerInfo.pickInfo)
		return
	}
}

const World = require("./class/World.js")
const Brick = require("./class/Brick.js")

const world = new World(scene)



function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const bricks = []
const loadBrk = require("./loadBrk.js")
const testData = require("./testData.js")

// loadBrk(testData.mythZone).bricks.forEach(brick => {
// 	const bricc = new Brick()
// 	bricc.position = new BABYLON.Vector3(brick.position.x + (brick.scale.x / 2), brick.position.z + (brick.scale.z / 2), brick.position.y + (brick.scale.y / 2))
// 	bricc.scale = new BABYLON.Vector3(brick.scale.x, brick.scale.z, brick.scale.y)
// 	bricc.color = BABYLON.Color3.FromHexString(brick.color)
// 	bricks.push(bricc)
// })
// world.addBricks(bricks)



// const spread = 64
// for (let i = 0; i < 500; i++) {
// 	const brick = new Brick()
// 	brick.position = new BABYLON.Vector3(randomIntFromInterval(-spread, spread) + 0.5, randomIntFromInterval(-spread, spread) + 0.5, randomIntFromInterval(-spread, spread) + 0.5)
// 	brick.scale = new BABYLON.Vector3(randomIntFromInterval(1, 3), randomIntFromInterval(1, 3), randomIntFromInterval(1, 3))
// 	brick.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random())
// 	bricks.push(brick)
// }

const GIZMO_MOVE = 1
const GIZMO_SIZE = 2
const GIZMO_DRAG = 2
let activeGizmo = GIZMO_MOVE
let activeSelection = null

const { playSound } = require("./sound.js")
const Cluster = require("./class/Cluster.js")


scaleFaker.on("update", (difference, vector) => {
	if (activeSelection) {
		function remark(brick) {
			playSound({
				url: "https://bunnynabbit.com/audio/64err.ogg",
				debounce: 100
			})
		}
		for (let i = 0; i < activeSelection.bricks.length; i++) { // validate scale
			const brick = activeSelection.bricks[i]
			if (brick.scale.x + (difference.x * vector.x) <= 0) return remark(brick)
			if (brick.scale.y + (difference.y * vector.y) <= 0) return remark(brick)
			if (brick.scale.z + (difference.z * vector.z) <= 0) return remark(brick)
		}
		activeSelection.bricks.forEach(brick => { // do it
			brick.position.x += (difference.x * Math.abs(vector.x)) / 2
			brick.position.y += (difference.y * Math.abs(vector.y)) / 2
			brick.position.z += (difference.z * Math.abs(vector.z)) / 2
			brick.scale.x += (difference.x * vector.x)
			brick.scale.y += (difference.y * vector.y)
			brick.scale.z += (difference.z * vector.z)
		})
		refreshSelection()
		playSound({
			url: "https://bunnynabbit.com/audio/camera.ogg",
			debounce: 100
		})
	}
})

let processing = false
function unselect() {
	if (!activeSelection) return false
	activeSelection.bricks.forEach(brick => {
		brick.position.x -= activeSelection.offset.x - activeSelection.mesh.position.x
		brick.position.y -= activeSelection.offset.y - activeSelection.mesh.position.y
		brick.position.z -= activeSelection.offset.z - activeSelection.mesh.position.z
	})
	world.addBricks(activeSelection.bricks)
	activeSelection.removeBricks(activeSelection.bricks)
	activeSelection = null
	scaleFaker.attachToPosition(null)
	positionGizmo.attach(null)
	playSound({
		url: "https://bunnynabbit.com/audio/unselect.ogg"
	})
	propsPanel.classList.add("hidden")
	return true
}
function leftClick(modifiers, pickResult) {
	if (!pickResult.pickedMesh || (activeSelection && !modifiers[0])) {
		if (activeSelection && !modifiers[0]) {
			unselect()
		} else return
	}
	if (pickResult.pickedMesh.name !== "cluster") { return }

	var picked = pickResult.pickedMesh.sps.pickedParticle(pickResult)
	var idx = picked.idx
	var p = pickResult.pickedMesh.sps.particles[idx]
	if (!p.brick) return
	if (!activeSelection) {
		activeSelection = new Cluster(scene)
		activeSelection.offset = new BABYLON.Vector3(p.brick.position.x, p.brick.position.y, p.brick.position.z)
		activeSelection.mesh.position = new BABYLON.Vector3(activeSelection.offset.x, activeSelection.offset.y, activeSelection.offset.z)
	}
	if (activeSelection.bricks.includes(p.brick)) return
	processing = true
	processingSound.volume = 0.1
	processingSound.currentTime = 0
	processingSound.play()
	world.removeBricks([p.brick])
	p.brick.position.x += activeSelection.offset.x - activeSelection.mesh.position.x
	p.brick.position.y += activeSelection.offset.y - activeSelection.mesh.position.y
	p.brick.position.z += activeSelection.offset.z - activeSelection.mesh.position.z
	activeSelection.addBricks([p.brick])
	console.log(activeSelection.offset.x, activeSelection.mesh.position.x, activeSelection.offset.x - activeSelection.mesh.position.x)
	console.log(activeSelection.offset.y, activeSelection.mesh.position.y, activeSelection.offset.y - activeSelection.mesh.position.y)
	console.log(activeSelection.offset.z, activeSelection.mesh.position.z, activeSelection.offset.z - activeSelection.mesh.position.z)
	// activeSelection.bricks.forEach(brick => {
	// 	brick.position.x -= activeSelection.offset.x - activeSelection.mesh.position.x
	// 	brick.position.y -= activeSelection.offset.y - activeSelection.mesh.position.y
	// 	brick.position.z -= activeSelection.offset.z - activeSelection.mesh.position.z
	// })
	// activeSelection.mesh.position = new BABYLON.Vector3(activeSelection.offset.x, activeSelection.offset.y, activeSelection.offset.z)
	positionGizmo.attach(activeSelection.mesh)
	scaleFaker.attachToPosition(activeSelection.offset)
	propsPanel.classList.remove("hidden")
	playSound({
		url: "https://bunnynabbit.com/audio/pick.ogg"
	})
	processingSound.volume = 0
}
window.addEventListener("keydown", (e) => {
	if (e.key === "Escape") unselect()
	if (e.key === "Delete") deleteSelection()
});

let currentShape = ""
// console.log(scaleFaker)
addBrick.onclick = () => {
	const pos = cameraCursor.mesh.position
	const brick = new Brick({ shape: currentShape, color: currentColor })
	brick.position = new BABYLON.Vector3(Math.round(pos.x - 0.5) + 0.5, Math.round(pos.y - 0.5) + 0.5, Math.round(pos.z - 0.5) + 0.5)
	world.addBricks([brick])
	playSound({
		url: "https://bunnynabbit.com/audio/spawnobj.ogg"
	})
}

updateGizmos(GIZMO_MOVE)

moveTool.onclick = () => {
	updateGizmos(GIZMO_MOVE)
}
sizeTool.onclick = () => {
	updateGizmos(GIZMO_SIZE)
}
cloneSelection.onclick = () => {
	if (activeSelection) {
		let clones = []
		activeSelection.bricks.forEach(brick => {
			const clone = brick.clone()
			clones.push(clone)
			clone.position.x -= activeSelection.offset.x - activeSelection.mesh.position.x
			clone.position.y -= activeSelection.offset.y - activeSelection.mesh.position.y
			clone.position.z -= activeSelection.offset.z - activeSelection.mesh.position.z
		})
		world.addBricks(clones)
		playSound({
			url: "https://bunnynabbit.com/audio/dolly.ogg"
		})
	} else {
		playSound({
			url: "https://bunnynabbit.com/audio/64err.ogg",
			debounce: 100
		})
	}
}

function updateGizmos(gizmo) {
	activeGizmo = gizmo
	if (activeSelection) {
		activeSelection.bricks.forEach(brick => {
			brick.position.x -= activeSelection.offset.x - activeSelection.mesh.position.x
			brick.position.y -= activeSelection.offset.y - activeSelection.mesh.position.y
			brick.position.z -= activeSelection.offset.z - activeSelection.mesh.position.z
		})
		activeSelection.offset.x = activeSelection.mesh.position.x
		activeSelection.offset.y = activeSelection.mesh.position.y
		activeSelection.offset.z = activeSelection.mesh.position.z
	}
	if (gizmo === GIZMO_MOVE) {
		positionGizmo.setActive(true)
	} else {
		positionGizmo.setActive(false)
	}
	if (gizmo === GIZMO_SIZE) {
		scaleFaker.setActive(true)
	} else {
		scaleFaker.setActive(false)
	}
}
let currentColor = BABYLON.Color3.FromHexString("#ff0000")
const propsPanel = document.getElementById("propsPanel")
const colorPropInput = document.getElementById("propColor")
colorPropInput.onchange = () => {
	currentColor = BABYLON.Color3.FromHexString(colorPropInput.value)
	if (activeSelection) {
		activeSelection.bricks.forEach(brick => {
			brick.color = currentColor
		})
		const oldPosition = activeSelection.mesh.position
		activeSelection.refresh()
		activeSelection.mesh.position = oldPosition
		positionGizmo.attach(activeSelection.mesh)
		playSound({
			url: "https://bunnynabbit.com/audio/navigate.rawr"
		})
	}
}

function refreshSelection() {
	activeSelection.refresh()
	activeSelection.mesh.position = new BABYLON.Vector3(activeSelection.offset.x, activeSelection.offset.y, activeSelection.offset.z)
	positionGizmo.attach(activeSelection.mesh)
}


const fileInput = document.createElement("input")
fileInput.type = "file"
fileInput.accept = ".brk"
fileInput.addEventListener('change', async (event) => {
	alert("Warning: When you import bricks to Ladrillo, please keep in mind that not all features of the .BRK file may be supported. Expect data loss if you export the file back!")
	const files = event.target.files
	if (files.length) {
		diskSound.volume = 0.1
		diskSound.currentTime = 0
		diskSound.play()
		const data = await event.target.files[0].text()
		loadBrk(data).bricks.forEach(brick => {
			const bricc = new Brick({ shape: brick.shape })
			bricc.position = new BABYLON.Vector3(brick.position.y + (brick.scale.y / 2), brick.position.z + (brick.scale.z / 2), brick.position.x + (brick.scale.x / 2))
			bricc.scale = new BABYLON.Vector3(brick.scale.y, brick.scale.z, brick.scale.x)
			bricc.color = BABYLON.Color3.FromHexString(brick.color)
			bricks.push(bricc)
		})
		world.addBricks(bricks)
		diskSound.volume = 0
	}
})
const loadButton = document.getElementById("loadButton")
loadButton.onclick = () => {
	fileInput.click()
}

function deleteSelection() {
	if (activeSelection) {
		let deadSelection = activeSelection
		activeSelection = null
		scaleFaker.attachToPosition(null)
		positionGizmo.attach(null)
		playSound({
			url: "https://bunnynabbit.com/audio/remove_brick.ogg"
		})
		deadSelection.isPickable = false
		const speed = 1.5;
		const gravity = -0.01;
		for (let p = 0; p < deadSelection.sps.nbParticles; p++) {
			const particle = deadSelection.sps.particles[p]
			particle.velocity.x = BABYLON.Scalar.RandomRange(-0.5 * speed, 0.5 * speed);
			particle.velocity.y = BABYLON.Scalar.RandomRange(0.25 * speed, speed);
			particle.velocity.z = BABYLON.Scalar.RandomRange(-0.5 * speed, 0.5 * speed);
		}
		deadSelection.sps.updateParticle = (particle) => {
			particle.velocity.y += gravity;                  // apply gravity to y
			particle.position.addInPlace(particle.velocity); // update particle new position

			const direction = Math.sin(particle.idx * 0.2); //rotation direction +/- 1 depends on particle index in particles array           // rotation sign and new value
			particle.rotation.z += 0.1 * direction;
			particle.rotation.x += 0.05 * direction;
			particle.rotation.y += 0.008 * direction;
		}
		const afterRender = scene.onAfterRenderObservable.add(() => {
			deadSelection.sps.setParticles()
		})
		deadSelection.bricks.forEach(brick => {
			brick.velocity = new BABYLON.Vector3(Math.random(), Math.random(), Math.random())
		})
		setTimeout(() => {
			deadSelection.removeBricks(deadSelection.bricks)
			scene.onAfterRenderObservable.remove(afterRender)
		}, 30000)
	}
}
deleteSelectedBricks.onclick = () => {
	deleteSelection()
}
destroyEverything.onclick = () => {
	if (confirm("Are you sure you want to do that?")) {
		processing = true
		processingSound.volume = 0.1
		processingSound.currentTime = 0
		processingSound.play()
		if (!activeSelection) {
			activeSelection = new Cluster(scene)
			activeSelection.offset = new BABYLON.Vector3(0, 0, 0)
		}
		const bricks = world.getAllBricks()
		world.removeBricks(bricks)
		activeSelection.addBricks(bricks)
		playSound({
			url: "https://bunnynabbit.com/audio/doomgemgameover.ogg"
		})
		deleteSelection()
		processingSound.volume = 0
	}
}

const processingSound = new Audio("https://bunnynabbit.com/audio/64processing.flac")
processingSound.loop = true
processingSound.play()
processingSound.volume = 0
const diskSound = new Audio("https://bunnynabbit.com/audio/disk.flac")
diskSound.loop = true
diskSound.play()
diskSound.volume = 0