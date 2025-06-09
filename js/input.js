const scene = require("./scene.js").scene

const input = {
	pressed: new Set()
}

scene.actionManager = new BABYLON.ActionManager(scene)
currentActions = []
currentActions.push(scene.actionManager.registerAction(
	new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyDownTrigger,
		e => {
			e = e.sourceEvent
			if (!input.pressed.has(e.code)) {
				input.pressed.add(e.code)
			}
		}
	)
))
currentActions.push(scene.actionManager.registerAction(
	new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyUpTrigger,
		e => {
			e = e.sourceEvent
			input.pressed.delete(e.code)
		}
	)
))

module.exports = input
