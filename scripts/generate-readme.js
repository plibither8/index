const {readFile, writeFile} = require('fs').promises
const path = require('path')

const yaml = require('js-yaml')

const sourceFile = path.join(__dirname, '../index.yaml')
const targetFile = path.join(__dirname, '../README.md')

let fileContent = `# 📂 index

![Build Status](https://github.com/plibither8/fitbit-heart-rate/workflows/Index%20Update%20Bot/badge.svg)

All my public repositories and projects I have worked on, indexed.<br>
_Repetitions are allowed :P_

> ❗️: Project is unmaintained/abandoned/archived.

`;


const main = async () => {
	const yamlText = await readFile(sourceFile)
	const data = yaml.safeLoad(yamlText)

	const listString = item =>
		`* [${item.name}](https://github.com/${item.repo}) - ${item.description}${item.archived ? ' ❗️' : ''}\n`;

	for (const [headingLvl1, itemsLvl1] of Object.entries(data)) {
		fileContent += `## ${headingLvl1}\n\n`

		if (Array.isArray(itemsLvl1)) {
			for (const item of itemsLvl1) {
				fileContent += listString(item)
			}
			fileContent += '\n'
		}

		else {
			for (const [headingLvl2, itemsLvl2] of Object.entries(itemsLvl1)) {
				fileContent += `### ${headingLvl2}\n\n`
				for (const item of itemsLvl2) {
					fileContent += listString(item)
				}
				fileContent += '\n'
			}
		}
	}

	fileContent = fileContent.slice(0, -1) // Remove extra newline

	await writeFile(targetFile, fileContent)
}

(async() => {
	await main()
})()
