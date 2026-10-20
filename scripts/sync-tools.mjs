#!/usr/bin/env node
// Refreshes nodes/SourceGeek/tools.json, the tool catalog the node builds
// its actions from, from SourceGeek's tool API (GET /api/v1/tools).
//
//   SOURCEGEEK_API_KEY=sgk_... npm run sync-tools
//   SOURCEGEEK_BASE_URL=https://sourcegeek-frontend-pr-123.<account>.workers.dev  (optional)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const baseUrl = (process.env.SOURCEGEEK_BASE_URL || 'https://chat.sourcegeek.com').replace(
	/\/+$/,
	'',
);
const apiKey = process.env.SOURCEGEEK_API_KEY;
if (!apiKey) {
	console.error('Set SOURCEGEEK_API_KEY (Settings → Connected apps → API keys in SourceGeek).');
	process.exit(1);
}

const response = await fetch(`${baseUrl}/api/v1/tools`, {
	headers: { Accept: 'application/json', Authorization: `Bearer ${apiKey}` },
});
if (!response.ok) {
	console.error(`GET ${baseUrl}/api/v1/tools: ${response.status} ${await response.text()}`);
	process.exit(1);
}
const { tools } = await response.json();
const file = join(import.meta.dirname, '..', 'nodes', 'SourceGeek', 'tools.json');
writeFileSync(file, `${JSON.stringify({ tools }, null, 2)}\n`);
console.log(`Wrote ${tools.length} tools to ${file}`);
