// Convert RGB to hex
function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Converts RGB from OpenGL format to proper format (e.g. [0, 0, 1] => [0, 0, 255])
function convertRGB(r, g, b) {
	r = Number(r)
	g = Number(g)
	b = Number(b)
	r *= 255, g *= 255, b *= 255
	return [Math.ceil(r), Math.ceil(g), Math.ceil(b)]
}

class Vector3 {

	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}
}

class Brick {

	constructor(position, scale, color) {
		this.position = position
		this.scale = scale
		this.color = color
	}
}

function loadBrk(brkString) {
	const FILE = brkString

	const LINES = FILE.split("\n")

	let totalLines = 0

	const bricks = []

	const spawns = []

	// const tools = []

	// const teams = []

	const environment = {}

	let currentBrick = -1

	let scriptRemark = false

	for (let line of LINES) {

		totalLines++

		line = line.trim()

		// Set up environment details
		switch (totalLines) {
			case 1: {
				if (line !== "B R I C K  W O R K S H O P  V0.2.0.0") {
					console.error("ERROR: This set was created using an incompatible version of Brick Hill.")
					return process.exit(0)
				}
				continue
			}
			case 3: {
				const glColor = line.split(" ")
				const RGB = convertRGB(glColor[0], glColor[1], glColor[2])
				environment["ambient"] = rgbToHex(RGB[0], RGB[1], RGB[2])
				continue
			}
			case 4: {
				const glColor = line.split(" ")
				const RGB = convertRGB(glColor[0], glColor[1], glColor[2])
				environment["baseColor"] = rgbToHex(RGB[0], RGB[1], RGB[2])
				continue
			}
			case 5: {
				const glColor = line.split(" ")
				const RGB = convertRGB(glColor[0], glColor[1], glColor[2])
				environment["skyColor"] = rgbToHex(RGB[0], RGB[1], RGB[2])
				continue
			}
			case 6: {
				environment["baseSize"] = Number(line)
				continue
			}
			case 7: {
				environment["sunIntensity"] = Number(line)
				continue
			}
		}

		const DATA = line.split(" ")

		const ATTRIBUTE = DATA[0].replace("+", "")

		const VALUE = DATA.slice(1).join(" ")

		switch (ATTRIBUTE) {
			case "NAME": {
				bricks[currentBrick].name = VALUE
				continue
			}
			case "ROT": {
				bricks[currentBrick].rotation = Number(VALUE)
				continue
			}
			case "SHAPE": {
				bricks[currentBrick].shape = VALUE
				if (VALUE === "spawnpoint")
					spawns.push(bricks[currentBrick])
				continue
			}
			case "MODEL": {
				bricks[currentBrick].model = Number(VALUE)
				continue
			}
			case "NOCOLLISION": {
				bricks[currentBrick].collision = false
				continue
			}
			case "COLOR": {
				// const colors = VALUE.split(" ")
				// const color = convertRGB(colors[0], colors[1], colors[2])
				// const team = new Team(
				//    teams[teams.length - 1],
				//    rgbToHex(
				//       color[0],
				//       color[1],
				//       color[2]
				//    )
				// )
				// teams[teams.length - 1] = team
				continue
			}
			case "LIGHT": {
				const colors = VALUE.split(' ')
				const lightRange = colors[3]
				const RGB = convertRGB(colors[0], colors[1], colors[2])
				bricks[currentBrick].lightEnabled = true
				bricks[currentBrick].lightRange = lightRange
				bricks[currentBrick].lightColor = rgbToHex(RGB[0], RGB[1], RGB[2])
				continue
			}
			case "SCRIPT": {
				if (scriptRemark) continue
				scriptRemark = true
				console.warn("WARNING: This set contains scripts. Scripts are incompatible with node-hill so they will not be loaded.")
				continue
			}
		}

		if (DATA.length === 10) {
			const RGB = convertRGB(DATA[6], DATA[7], DATA[8]), // Convert to OpenGL colour format
				xPos = Number(DATA[0]),
				yPos = Number(DATA[1]),
				zPos = Number(DATA[2]),
				xScale = Number(DATA[3]),
				yScale = Number(DATA[4]),
				zScale = Number(DATA[5]),
				color = rgbToHex(
					RGB[0],
					RGB[1],
					RGB[2]
				),
				transparency = Number(DATA[9])

			const newBrick = new Brick(
				new Vector3(xPos, yPos, zPos),
				new Vector3(xScale, yScale, zScale),
				color
			)

			newBrick.visibility = transparency

			bricks.push(newBrick)

			currentBrick++
		}

		// if (DATA[0] && DATA[0] === ">TEAM")
		//    teams.push(VALUE)

		// if (DATA[0] && DATA[0] === ">SLOT")
		//    tools.push(new Tool(VALUE))
	}

	return {
		// teams: teams,
		// tools: tools,
		bricks: bricks,
		environment: environment,
		spawns: spawns
	}
}

module.exports = loadBrk
