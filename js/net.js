const BABYLON = require('babylonjs')
const Brick = require("./class/Brick.js")

module.exports = (world) => {
   world.net = true
   gatheract.init({
      appId: '<anything>',
      events: {
         connected: event => {

         },
         disconnected: event => {

         },
         channelInfo: event => {

         },
         appMessage: (data, from) => {
            console.log(data)
            if (data.type === "addBricks") {
               const processedBricks = []
               data.bricks.forEach(element => {
                  const brick = new Brick({ shape: element.shape })
                  brick.position = new BABYLON.Vector3(element.position[0], element.position[1], element.position[2])
                  brick.scale = new BABYLON.Vector3(element.scale[0], element.scale[1], element.scale[2])
                  brick.color = new BABYLON.Color3(element.color[0], element.color[1], element.color[2])
                  brick.rotation = element.rotation
                  brick.uuid = element.uuid
                  processedBricks.push(brick)
               })
               world.addBricks(processedBricks, true)
            }
            if (data.type === "deleteBricks") {
               const bricks = []
               data.uuids.forEach(uuid => {
                  const brick = world.referenceUUID.get(uuid)
                  if (brick) bricks.push(brick)
               })
               world.removeBricks(bricks, true)
            }
         }
      }
   })
}