const {readFile, writeFile} = require('fs').promises;
const fetch = require('node-fetch');
const yaml = require('js-yaml');

const fetchOptions = {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + Buffer.from('plibither8:'+process.env.GITHUB_TOKEN).toString('base64')
	}
};

const getRepoDetails = async repo => {
	const response = await fetch(`https://api.github.com/repos/${repo}`, fetchOptions)
		.then(res => res.json());
	return {
		stars: response.stargazers_count,
		updated: new Date(response.pushed_at).getTime(),
		created: new Date(response.created_at).getTime(),
		language: response.language
	};
}

const main = async () => {
	const yamlText = await readFile('index.yaml');
	const data = yaml.safeLoad(yamlText);

	for (const [heading1, items1] of Object.entries(data)) {
		console.log(heading1+':');
		if (Array.isArray(items1)) {
			for (const [index, item] of items1.entries()) {
				if (item.skipDetails) continue;
				data[heading1][index].details = await getRepoDetails(item.repo);
				console.info('✔️ ', item.repo);
			}
			continue;
		}

		for (const [heading2, items2] of Object.entries(items1)) {
			console.log('  '+heading2+':');
			for (const [index, item] of items2.entries()) {
				if (item.skipDetails) continue;
				data[heading1][heading2][index].details = await getRepoDetails(item.repo);
				console.info('  ✔️ ', item.repo);
			}
		}
	}

	const updatedYaml = yaml.safeDump(data);
	await writeFile('index.yaml', updatedYaml);
}

(async () => await main())();
