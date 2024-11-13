const Mesher = require("./MesherBase.js")

const meshers = new Map()
meshers.set("default", require("./BrickMesher.js")) // TODO: celaria block
meshers.set("cylinder", require("./CylinderMesher.js"))
meshers.set("", require("./BrickMesher.js"))

function getFromName(name) {
   let mesher = meshers.get(name)
   if (mesher) return mesher
   return meshers.get("default")
}

module.exports = { Mesher, getFromName }