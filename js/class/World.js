const BrickMesher = require("./mesher/BrickMesher.js")
const Brick = require("./Brick.js")
const Cluster = require("./Cluster.js")

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
function getRandomUUID() {
	return randomIntFromInterval(0, Number.MAX_SAFE_INTEGER)
}

class World { // Cluster manager
	constructor(scene) {
		this.scene = scene
		this.clusters = new Map() // SPS
		this.referenceUUID = new Map() // uuid:brick
		this.baseplate = null
		this.setBaseplate(100, new BABYLON.Color3(1, 1, 1))
		this.net = null
	}
	addBricks(bricks, networked = false) {
		const map = new Map()

		bricks.forEach(brick => {
			if (this.net && !brick.uuid) brick.uuid = getRandomUUID()
			if (brick.uuid) this.referenceUUID.set(brick.uuid, brick)
			let cluster = null
			getCluster: {
				const key = brick.getClusterKey()
				if (map.has(key)) {
					cluster = map.get(key)
					break getCluster
				}
				if (this.clusters.has(key)) {
					cluster = this.clusters.get(key)
					map.set(key, cluster)
					break getCluster
				}
				cluster = new Cluster(this.scene, this, key)
				map.set(key, cluster)
				this.clusters.set(key, cluster)
			}

			cluster.pendingBricks.push(brick)
		})

		map.forEach(cluster => {
			cluster.flushChanges()
		})
	}
	removeBricks(bricks, networked = false) {
		const map = new Map()

		bricks.forEach(brick => {
			if (this.net) this.referenceUUID.delete(brick.uuid)
			let element = null
			getCluster: {
				const key = brick.getClusterKey()
				if (map.has(key)) {
					element = map.get(key)
					break getCluster
				}
				if (this.clusters.has(key)) {
					element = { cluster: this.clusters.get(key), bricks: [] }
					map.set(key, element)
					break getCluster
				}
			}
			element.bricks.push(brick)
		})

		map.forEach(element => {
			element.cluster.removeBricks(element.bricks)
		})
	}
	removeCluster(cluster) { // ⚠: this doesn't dispose the cluster, just removes it from the world index
		this.clusters.delete(cluster.positionKey)
	}
	getAllBricks() {
		const bricks = []
		this.clusters.forEach(cluster => {
			cluster.bricks.forEach(brick => bricks.push(brick))
		})
		return bricks
	}
	setBaseplate(size, color) {
		const brick = new Brick()
		brick.scale.x = size
		brick.scale.z = size
		this.baseplate = BrickMesher.createMesh(brick)
		this.baseplate.isPickable = false
		this.baseplate.scene = this.scene
		// this.baseplate.position.x = 0.5
		this.baseplate.position.y = -0.5
	}
}

module.exports = World