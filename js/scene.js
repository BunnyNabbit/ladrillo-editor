
let BABYLON = require('babylonjs')

const canvas = document.getElementById("renderCanvas") // Get the canvas element

const engine = new BABYLON.Engine(canvas, true) // Generate the BABYLON 3D engine

const createScene = () => {
   // Create a basic BJS Scene object.
   var scene = new BABYLON.Scene(engine)
   scene.autoClear = true // Color buffer
   scene.autoClearDepthAndStencil = true

   var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0.3, 1, 0.3), scene)

   return scene
}
const scene = createScene()

const testData = require("./testData.js")

scene.defaultMaterial.bumpTexture = new BABYLON.Texture.CreateFromBase64String("data:image/png;base64," + testData.numpsTexture)

scene.hl = new BABYLON.HighlightLayer("hl1", scene)

canvas.addEventListener("onclick", () => {
   $buzz.context().resume()
})

module.exports = {
   scene,
   canvas,
   engine
}
