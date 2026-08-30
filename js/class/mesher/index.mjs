import Mesher from "./MesherBase.mjs"
import BrickMesher from "./BrickMesher.mjs"
import CylinderMesher from "./CylinderMesher.mjs"

const meshers = new Map()
meshers.set("default", BrickMesher) // TODO: celaria block
meshers.set("cylinder", CylinderMesher)
meshers.set("", BrickMesher)

export function getFromName(name) {
	let mesher = meshers.get(name)
	if (mesher) return mesher
	return meshers.get("default")
}

export default { Mesher, getFromName }
