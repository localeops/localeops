#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

const PACKAGE_VERSION = require("../package.json").version;
const REPO = "localeops/localeops";

const PLATFORMS = {
	"linux-arm64": "localeops-linux-arm64",
	"linux-x64": "localeops-linux-x64",
	"darwin-arm64": "localeops-darwin-arm64",
};

const platform = `${process.platform}-${process.arch}`;
const binaryName = PLATFORMS[platform];

if (!binaryName) {
	console.error(`Unsupported platform: ${platform}`);
	process.exit(1);
}

const binDir = path.join(__dirname, "..", "bin");
const binaryPath = path.join(binDir, "localeops");

const url = `https://github.com/${REPO}/releases/download/v${PACKAGE_VERSION}/${binaryName}`;

if (!fs.existsSync(binDir)) {
	fs.mkdirSync(binDir, { recursive: true });
}

console.log(`Downloading localeops binary for ${platform}...`);

function download(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https
			.get(url, (response) => {
				if (response.statusCode === 302 || response.statusCode === 301) {
					download(response.headers.location, dest).then(resolve).catch(reject);
					return;
				}
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download: ${response.statusCode}`));
					return;
				}
				response.pipe(file);
				file.on("finish", () => {
					file.close();
					resolve();
				});
			})
			.on("error", reject);
	});
}

download(url, binaryPath)
	.then(() => {
		fs.chmodSync(binaryPath, 0o755);
		console.log("localeops installed successfully!");
	})
	.catch((err) => {
		console.error("Failed to download binary:", err.message);
		console.error(`You can manually download from: ${url}`);
		process.exit(1);
	});
