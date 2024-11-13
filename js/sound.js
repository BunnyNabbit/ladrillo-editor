let thrott = 0
setInterval(() => {
	thrott = 0
}, 100)

const debounce = new Set()

// Does the device support flac?
let flacSupported = false
{
	// Create an audio element so we can use the canPlayType method
	const testAudio = document.createElement('audio')
	if (testAudio.canPlayType('audio/flac') === "probably") flacSupported = true
}

function playSound(data) {
	thrott++
	if (thrott > 5) return
	// if (!settingsSound) return
	// if (!soundEnabled) return
	if (data.url.endsWith(".rawr")) {
		if (flacSupported) {
			data.url = data.url.replace(".rawr", ".flac")
		} else {
			data.url = data.url.replace(".rawr", ".wav")
		}
	}
	if (data.url) data.src = data.url
	if (data.debounce) {
		if (debounce.has(data.url)) return thrott--
		debounce.add(data.url)
		setTimeout(() => {
			debounce.delete(data.url)
		}, data.debounce)
	}
	data.volume = 1
	$buzz.play(data)
}

module.exports = {
	playSound
}