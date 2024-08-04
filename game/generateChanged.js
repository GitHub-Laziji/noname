// 通过比对git信息来获取改动的文件列表
// 然后生成zip文件
// 使用 node game/listChangedFiles.js commitHash
// 命令参数是对应commit的SHA
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const JSZip = require("./jszip.js");

const joinRootPath = p => path.join(__dirname, "../", p);

function formatDate(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() 返回的是0-11，所以需要加1
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}${month}${day}`;
}

function collectFilesSync(paths) {
	const fileList = [];

	function collectFilesInDirectory(directoryPath) {
		try {
			const entries = fs.readdirSync(directoryPath, {
				withFileTypes: true,
			});

			for (const entry of entries) {
				const fullPath = path.join(directoryPath, entry.name);

				if (entry.isDirectory()) {
					// 如果是目录，则递归进入
					collectFilesInDirectory(fullPath);
				} else {
					// 如果是文件，则添加到文件列表中
					fileList.push(fullPath);
				}
			}
		} catch (error) {
			console.error(`Error processing directory ${directoryPath}:`, error);
		}
	}

	for (const item of paths) {
		if (fs.existsSync(item)) {
			const stats = fs.lstatSync(item);

			if (stats.isDirectory()) {
				// 如果是目录，则递归收集文件
				collectFilesInDirectory(item);
			} else {
				// 如果是文件，则直接添加到列表中
				fileList.push(item);
			}
		} else {
			console.error(`The path ${item} does not exist.`);
		}
	}

	return fileList.map(v => v.slice(path.join(__dirname, "..").length + 1));
}

function compareFilesWithCommit(commitHash = "HEAD") {
	console.log(`exec git diff --name-only ${commitHash}`);
	exec(`git diff --name-only ${commitHash}`, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}

		const zip = new JSZip();

		let filesArray = stdout.split("\n").filter(v => {
			const filePath = path.join(__dirname, "../", v);
			if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
				return true;
			}
			return false;
		});

		filesArray.push(...collectFilesSync([joinRootPath("card"), joinRootPath("character"), joinRootPath("extension"), joinRootPath("game"), joinRootPath("layout"), joinRootPath("mode"), joinRootPath("noname"), joinRootPath("theme"), joinRootPath("index.html"), joinRootPath("LICENSE"), joinRootPath("noname-compatible.js"), joinRootPath("noname.js"), joinRootPath("README.md"), joinRootPath("service-worker.js"), joinRootPath("tsconfig.json")]));

		filesArray = [...new Set(filesArray)]
			.sort((a, b) => {
				if (a > b) return 1;
				if (a < b) return -1;
				return 0;
			})
			.map(v => path.normalize(v));

		// fs.writeFileSync(path.join(__dirname, "filesArray.txt"), filesArray.join('\n'));

		filesArray.forEach(v => {
			const filePath = path.join(__dirname, "../", v);
			if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
				zip.folder(v);
				return;
			}
			if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
				if (zip.file(v) === null) {
					zip.file(v, fs.readFileSync(filePath));
				}
			}
		});

		const result = zip.generate({ type: "nodebuffer" });
		fs.writeFileSync(path.join(__dirname, `测试包-${formatDate()}.zip`), result);
	});
}

if (process.argv[2]) {
	compareFilesWithCommit(process.argv[2]);
}
