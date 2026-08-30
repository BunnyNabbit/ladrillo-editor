import * as esbuild from "esbuild"

await esbuild.build({
	entryPoints: ["./js/index.js"],
	outdir: "dist",
	bundle: true,
	platform: "browser",
	packages: "bundle",
	external: [],
	treeShaking: true,
	format: "esm",
	keepNames: true, // I kind of want zhings to be hackable
	splitting: true,
	minify: true,
	sourcemap: "linked",
})
