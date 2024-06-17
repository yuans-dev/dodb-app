import { QueryResult } from './queryResult';
import { createDir, readTextFile, BaseDirectory, exists, writeTextFile } from '@tauri-apps/api/fs';
import { currentlyEditing } from './store';
const baseDir = 'DoDB Databases';

export async function save(database, table) {
	let check = await exists(`${baseDir}\\${database}\\${table.metadata.name}.json`, {
		dir: BaseDirectory.Document
	});
	if (check.valueOf()) {
		const jsonString = JSON.stringify(table);
		await writeTextFile(`${baseDir}\\${database}\\${table.metadata.name}.json`, jsonString, {
			dir: BaseDirectory.Document
		});
	} else {
		return {
			type: 'error',
			message: `Table "${table.metadata.name}" does not exist in database "${database}."`
		};
	}
}
export async function handleQuery(query, database) {
	let queryType = 'null';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';
	switch (query[0].toLowerCase()) {
		case 'create':
			queryType = 'create';
			if (!query[1]) {
				break;
			}
			switch (query[1].toLowerCase()) {
				case 'table':
					queryType = 'create table';
					if (!database) {
						message = 'No database opened.';
						break;
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
		case 'exit':
			queryType = 'open';
			if (database) {
				message = `Exited out of database "${database}."`;
				type = 'success';
				value = '';
			}

			break;
		case 'edit':
			queryType = 'edit';
			if (!database) {
				message = 'No database opened.';
				break;
			}
			if (query[1]) {
				let check = await tableExists(database, query[1]);
				if (check.valueOf()) {
					let table = JSON.parse(await fetchTable(database, query[1]));
					console.log(table);
					currentlyEditing.set(table);
					message = `Editing ${query[1]}...`;
					type = 'success';
				} else {
					message = `Table "${query[1]}" does not exist in "${database}."`;
				}
			}
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
		const template = { metadata: { name, columns: ['id'], primaryKey: 'id' }, items: [] };
		const jsonString = JSON.stringify(template);
		await writeTextFile(`${baseDir}\\${database}\\${name}.json`, jsonString, {
			dir: BaseDirectory.Document
		});
		return { type: 'success', message: `Created table "${name}" in database "${database}."` };
	}
}
async function databaseExists(name) {
	let check = await exists(`${baseDir}\\${name}`, {
		dir: BaseDirectory.Document
	});
	return check.valueOf();
}
async function tableExists(database, name) {
	let check = await exists(`${baseDir}\\${database}\\${name}.json`, {
		dir: BaseDirectory.Document
	});
	return check.valueOf();
}
async function fetchTable(database, name) {
	const contents = await readTextFile(`${baseDir}\\${database}\\${name}.json`, {
		dir: BaseDirectory.Document
	});
	return contents;
}
