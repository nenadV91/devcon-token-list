import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const DIR = "results";

async function fetchCoingeckoTop(limit, page) {
	const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&category=ethereum-ecosystem`;
	const res = await fetch(url);
	const json = await res.json();
	return json;
}

async function fetchCowList() {
	const url = "https://token-list.cow.eth.link/";
	const res = await fetch(url);
	const json = await res.json();
	return json;
}

async function fetchCoingeckoAll() {
	const url = "https://tokens.coingecko.com/uniswap/all.json";
	const res = await fetch(url);
	const json = await res.json();
	return json;
}

async function dlFile(filename, data) {
	fs.writeFile(`${DIR}/${filename}`, data, function (err) {
		if (err) {
			return console.log(err);
		}
		console.log(`File ${filename} saved`);
	});
}

function createSortMap(tokens) {
	return tokens.reduce((r, e, i) => {
		r[e.symbol.toLowerCase()] = i;
		return r;
	}, {});
}

async function dlTokens() {
	try {
		const page = 1;

		const top = await fetchCoingeckoTop(50, page);
		const all = await fetchCoingeckoAll();

		const filtered = all.tokens.filter((c) =>
			top.some((t) => t.symbol.toLowerCase() === c.symbol.toLowerCase())
		);

		const sortMap = createSortMap(top);
		const sorted = filtered.sort(
			(a, b) =>
				sortMap[a.symbol.toLowerCase()] - sortMap[b.symbol.toLowerCase()]
		);

		dlFile(`tokens-${page}.json`, JSON.stringify(sorted, 0, 4));
	} catch (err) {
		console.log(err);
	}
}

async function combineTokens() {
	const output = [];

	const jsonsInDir = fs
		.readdirSync("./results")
		.filter((file) => path.extname(file) === ".json");

	jsonsInDir.forEach((file) => {
		const fileData = fs.readFileSync(path.join("./results", file));
		const json = JSON.parse(fileData.toString());
		output.push(...json);
	});

	dlFile("all.json", JSON.stringify(output, 0, 4));
}

// dlTokens();
combineTokens();
