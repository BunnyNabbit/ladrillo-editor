class Cluster extends BABYLON.SolidParticleSystem {
	constructor(scene, world, positionKey) {
		super("cluster", scene, { expandable: true })
		this.bricks = []
		this.pendingBricks = []
		this.scene = scene
		this.world = world
		this.positionKey = positionKey
		this.offset = new BABYLON.Vector3(0, 0, 0)
		console.log("new cluster added")

		this.refresh()
	}
	addBricks(bricks) {
		this.setParticles(bricks, true)
	}
	removeBricks(bricks) {
		// https://stackoverflow.com/a/44204227
		const original = this.bricks
		const toRemove = new Set(bricks)
		const difference = original.filter(x => !toRemove.has(x))
		this.bricks = difference

		if (!this.bricks.length) {
			this.mesh.dispose()
			this.sps.dispose()
			if (this.world) {
				console.log("removed cluster")
				this.world.removeCluster(this)
			}
			return
		}

		bricks.forEach(brickParticle => {
			const idx = brickParticle.particle.idx
			this.sps.removeParticles(idx, idx)
		})
		this.sps.buildMesh()
		this.sps.setParticles()
		this.sps.refreshVisibleSize()
	}
	setParticles(bricks, add) {
		// prepare shapes

		const oldCont = this.sps.nbParticles
		bricks.forEach(brick => {
			const mesh = brick.createMesh()
			this.sps.addShape(mesh, 1)
			mesh.dispose()
		})
		this.sps.buildMesh()

		bricks.forEach((brick, index) => {
			if (add) this.bricks.push(brick)
			const particle = this.sps.particles[oldCont + index]
			particle.position = new BABYLON.Vector3(brick.position.x - this.offset.x, brick.position.y - this.offset.y, brick.position.z - this.offset.z)
			particle.scaling = new BABYLON.Vector3(1, 1, 1)
			particle.color = brick.color
			particle.brick = brick
			brick.particle = particle
		})

		this.sps.setParticles()
		this.sps.refreshVisibleSize()
	}
	refresh() {
		if (this.sps) {
			this.mesh.dispose()
			this.sps.dispose()
		}
		let pickable = true
		if (!this.world) pickable = false
		this.sps = new BABYLON.SolidParticleSystem("cluster", this.scene, { isPickable: pickable, expandable: true })
		this.mesh = this.sps.buildMesh()
		this.mesh.sps = this.sps

		this.setParticles(this.bricks, false)

		if (!this.world) {
			this.scene.hl.addMesh(this.mesh, BABYLON.Color3.Yellow())
			this.mesh.visibility = 0.5
			this.mesh.isPickable = false
		}
	}
	flushChanges() {
		this.addBricks(this.pendingBricks)
		this.pendingBricks = []
	}
}

module.exports = Cluster