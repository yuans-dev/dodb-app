import { QueryResult } from './queryResult';
import { createDir, BaseDirectory, exists, writeTextFile } from '@tauri-apps/api/fs';

const baseDir = 'DoDB Databases';

export async function handleQuery(query, database) {
	let queryType = 'null';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';
	switch (query[0].toLowerCase()) {
		case 'create':
			if (!query[1]) {
				break;
			}
			switch (query[1].toLowerCase()) {
				case 'table':
					queryType = 'create table';
					if (!database) {
						message = 'No database opened.';
					}
					if (query[2]) {
						let operation = await createTable(database, query[2]);
						message = operation.message;
						type = operation.type;
					}
					break;
				case 'db':
					queryType = 'create db';
					if (query[2]) {
						let operation = await createDatabase(query[2]);
						message = operation.message;
						type = operation.type;
						value = query[2];
					}
					break;
			}
			break;
		case 'open':
			queryType = 'open';
			if (query[1]) {
				let check = await databaseExists(query[1]);
				if (check.valueOf()) {
					message = `Opened database "${query[1]}."`;
					type = 'success';
					value = query[1];
				} else {
					message = `Database "${query[1]}" does not exist.`;
					type = 'error';
				}
			} else {
			}
			break;
	}
	return new QueryResult(queryType, type, message, value);
}

async function createDatabase(name) {
	let check = await exists(`${baseDir}\\${name}`, {
		dir: BaseDirectory.Document
	});
	if (check.valueOf()) {
		return { type: 'error', message: `Database "${name}" already exists.` };
	} else {
		await createDir(`${baseDir}\\${name}`, {
			dir: BaseDirectory.Document,
			recursive: true
		});
		return { type: 'success', message: `Created database "${name}."` };
	}
}
async function createTable(database, name) {
	let check = exists(`${baseDir}\\${database}\\${name}.json`, {
		dir: BaseDirectory.Document
	});
	if ((await check).valueOf()) {
		return { type: 'error', message: `Table "${name}" already exists in database "${database}."` };
	} else {
		await writeTextFile(`${baseDir}\\${database}\\${name}.json`, {
			dir: BaseDirectory.Document
		});
		return { type: 'success', message: `Create table "${name}" in database "${database}."` };
	}
}
async function databaseExists(name) {
	let check = await exists(`${baseDir}\\${name}`, {
		dir: BaseDirectory.Document
	});
	return check.valueOf();
}
