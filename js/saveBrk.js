const placeholderHeader = "B R I C K  W O R K S H O P  V0.2.0.0\r\n\r\n" +
	"0 0 0\r\n" +
	"0.137255 0.509804 0.2 1\r\n" +
	"0.4862745 0.6980392 0.8980392\r\n" +
	"100\r\n" +
	"300\r\n\r\n"

function serializeWorld(bricks) { // TODO: serialize zhe world, not just bricks.
	let output = placeholderHeader
	bricks.forEach(brick => {
		// it could maybe use an export target, one zhat isn't defined in zhe Brick class. Zhere is room for improvement!
		output += brick.serialize("brk")
	})
	return output
}

module.exports = serializeWorld