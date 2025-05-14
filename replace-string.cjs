const { Case } = require('change-case-all')
const replace = require('replace-in-file')
const fs = require('fs')
const path = require('path')

function getVersionFromPluginPhp() {
	const pluginPhpPath = path.join(__dirname, 'plugin.php')

	try {
		const pluginPhpContent = fs.readFileSync(pluginPhpPath, 'utf-8')
		const versionLine = pluginPhpContent
			.split('\n')
			.find((line) => line.includes('* Version:'))

		if (versionLine) {
			const version = versionLine.split(':')[1].trim()
			return version
		}
		throw new Error('Version line not found in plugin.php')
	} catch (err) {
		console.error(`Error reading plugin.php: ${err.message}`)
		return null
	}
}

const projectName = process?.argv?.[2] || ''

function replaceString(str) {
	// regex example   /^(AAA|BBB|CCC)$/

	const capital = Case.capital(str)
	const pascalName = Case.pascal(str)
	const camelName = Case.camel(str)
	const snakeName = Case.snake(str)
	const kebabName = Case.kebab(str)

	replace.sync({
		files: [
			'./plugin.php',
		],
		from: /My Plugin/g,
		to: capital,
	})

	replace.sync({
		files: [
			'./plugin.php',
		],
		from: /my-plugin/g,
		to: kebabName,
	})

	replace.sync({
		files: [
			'./plugin.php',
			'./inc/class/utils/class-base.php',
			'./inc/class/front-end/class-entry.php',
		],
		from: /my_plugin/g,
		to: snakeName,
	})

	replace.sync({
		files: [
			'./composer.json',
			'./plugin.php',
			'./inc/classes/Bootstrap.php',
			'./inc/classes/FrontEnd/Entry.php',
			'./inc/classes/Utils/Base.php',
		],
		from: /WpPlugin/g,
		to: pascalName,
	})

	replace.sync({
		files: [
			'./composer.json',
			'./package.json',
			'./plugin.php',
		],
		from: /wp-plugin/g,
		to: kebabName,
	})

	replace.sync({
		files: [
			'./plugin.php',
		],
		from: /wp_plugin/g,
		to: snakeName,
	})

	const version = getVersionFromPluginPhp()

	const textMap = [
		{
			from: version,
			to: '0.0.1',
		},
		{
			from: "'https://github.com/j7-dev/wp-plugin',",
			to: "'', // change to your github repo url",
		},
		{
			from: 'My Plugin (DEV) | 我的 WordPress 外掛',
			to: capital,
		},
		{
			from: '這是一個 WordPress 外掛的範本，可以用來開發新的外掛。',
			to: 'your description',
		},
		{
			from: 'Tags:',
			to: 'Tags: your tags',
		},
		{
			from: '* Author:            J7',
			to: '* Author:            Your Name',
		},
		{
			from: 'https://github.com/j7-dev',
			to: '[YOUR GITHUB URL]',
		},
	]

	textMap.forEach(({ from, to }) => {
		const regex = new RegExp(
			from.replace(/([(){}[\]\\|?*+.,^$])/g, '\\$1'),
			'g',
		)
		replace.sync({
			files: [
				'./plugin.php',
			],
			from: regex,
			to,
		})
	})
}

replaceString(projectName)
