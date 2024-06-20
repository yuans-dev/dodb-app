import { QueryResult } from './queryResult';
import { createDir, readTextFile, BaseDirectory, exists, writeTextFile } from '@tauri-apps/api/fs';
import { table, database } from './store';

const baseDir = 'DoDB Databases';

export async function save() {
	let d, t;
	database.subscribe(value => {
		d = value;
	});
	table.subscribe(value => {
		t = value;
	});
	if (!d || !t) {
		return;
	}
	const check = await exists(`${baseDir}\\${d}\\${t.metadata.name}.json`, { dir: BaseDirectory.Document });
	if (check.valueOf()) {
		const jsonString = JSON.stringify(t);
		await writeTextFile(`${baseDir}\\${d}\\${t.metadata.name}.json`, jsonString, { dir: BaseDirectory.Document });
	} else {
		return {
			type: 'error',
			message: `Table "${t.metadata.name}" does not exist in database "${d}."`
		};
	}
}

export async function handleQuery(query) {
	let t, d;
	database.subscribe(value => {
		d = value;
	});
	table.subscribe(value => {
		t = value;
	});
	query = query.split(' ');
	let queryType = 'null';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	switch (query[0].toLowerCase()) {
		case 'create':
			const createResult = await handleCreate(query.slice(1), d);
			queryType = createResult.queryType;
			message = createResult.message;
			type = createResult.type;
			value = createResult.value;
			break;
		case 'open':
			const openResult = await handleOpen(query.slice(1));
			queryType = openResult.queryType;
			message = openResult.message;
			type = openResult.type;
			value = openResult.value;
			break;
		case 'exit':
			const exitResult = handleExit(query.slice(1), d);
			queryType = exitResult.queryType;
			message = exitResult.message;
			type = exitResult.type;
			value = exitResult.value;
			break;
		case 'edit':
			const editResult = await handleEdit(query.slice(1), d, t);
			queryType = editResult.queryType;
			message = editResult.message;
			type = editResult.type;
			value = editResult.value;
			break;
		case 'insert':
			const insertResult = await handleInsert(query.slice(1), t);
			queryType = insertResult.queryType;
			message = insertResult.message;
			type = insertResult.type;
			value = insertResult.value;
			break;
		case 'remove':
			const removeResult = await handleRemove(query.slice(1), t);
			queryType = removeResult.queryType;
			message = removeResult.message;
			type = removeResult.type;
			value = removeResult.value;
			break;
		case 'assign':
        	const assignResult = await handleAssign(query.slice(1), t);
        	queryType = assignResult.queryType;
        	message = assignResult.message;
        	type = assignResult.type;
        	value = assignResult.value;
        break;
		case 'rename':
        	const renameResult = await handleRename(query.slice(1), d, t);
        	queryType = renameResult.queryType;
        	message = renameResult.message;
        	type = renameResult.type;
        	value = renameResult.value;
        break;
	}

	const saveQueryTypes = ['insert', 'remove', 'assign'];
	const shouldSave = saveQueryTypes.includes(queryType) && type === 'success';
	if (shouldSave) {
		await save();
	}

	return new QueryResult(queryType, type, message, value);
}
async function handleAssign(queryParts, t) {
    let queryType = 'assign';
    let message = 'Invalid query.';
    let type = 'error';
    let value = '';

    // Extract the value and the condition
	

    const valueMatch = queryParts.join(' ').match(/value \(([^)]+)\) to \(([^)]+)\) of item/);
    if (!valueMatch) return { queryType, message, type, value };

    const newValue = valueMatch[1].trim();
	const property = valueMatch[2]
	const conditionStr = queryParts.slice(6).join(' ');

	

    // Parse the conditions
    const conditions = parseConditions(`${conditionStr}`);
	
    if (!conditions.length) return { queryType, message, type, value };

    // Find and update the items matching the conditions
    let itemFound = false;
    t.items.forEach(item => {
        if (evaluateConditions(item, conditions)) {
            item[property] = newValue;  // Assuming the attribute to be updated is 'value'
            itemFound = true;
        }
    });

    if (itemFound) {
        table.set(t);
        message = 'Assigned value to item(s).';
        type = 'success';
    } else {
        message = 'No items matched the criteria.';
    }

    return { queryType, message, type, value: newValue };
}


async function handleCreate(queryParts, d) {
	let queryType = 'create';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	if (!queryParts[0]) {
		return { queryType, message, type, value };
	}

	switch (queryParts[0].toLowerCase()) {
		case 'table':
			queryType = 'create table';
			if (!d) {
				message = 'No database opened.';
				break;
			}
			if (queryParts[1]) {
				const operation = await createTable(d, queryParts[1]);
				message = operation.message;
				type = operation.type;
			}
			break;
		case 'db':
			queryType = 'create db';
			if (queryParts[1]) {
				const operation = await createDatabase(queryParts[1]);
				message = operation.message;
				type = operation.type;
				value = queryParts[1];
			}
			break;
	}
	return { queryType, message, type, value };
}

async function handleOpen(queryParts) {
	let queryType = 'open';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	if (queryParts[0]) {
		const check = await databaseExists(queryParts[0]);
		if (check.valueOf()) {
			message = `Opened database "${queryParts[0]}."`;
			type = 'success';
			value = queryParts[0];
		} else {
			message = `Database "${queryParts[0]}" does not exist.`;
			type = 'error';
		}
	}

	return { queryType, message, type, value };
}

function handleExit(queryParts, d) {
	let queryType = 'exit';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	if (queryParts[0]) {
		type = 'error';
		message = `Command "exit" does not take any parameters.`;
	} else if (d) {
		message = `Exited out of database "${d}."`;
		type = 'success';
		value = '';
		database.set(null);
	}

	return { queryType, message, type, value };
}
async function handleRename(queryParts, d, t){
	let queryType = 'rename';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	if(!d){
		message = 'No database opened.';
	}else if(queryParts[1]){
		const valueMatch = queryParts.join(' ').match(/\(([^)]+)\) to \(([^)]+)\)/);
		if (!valueMatch) return { queryType, message, type, value };
	
		const oldProp = valueMatch[1].trim();
		const base = valueMatch[2].trim().replace(/ /g, '_');
		let newProp = base;
		let increment = 1;
		
		while(t.metadata.columns.includes(newProp)){
			newProp = `${base}_${increment}`;
			increment++;
		}
		let index =t.metadata.columns.indexOf(oldProp);
		if(index === -1){
			message = `Column "${oldProp}" does not exist.`;
			return {queryType, message, type, value}
		}
		t.metadata.columns[index] = newProp;
		table.set(t);
		type='success';
		message = `Renamed column "${oldProp}" to "${newProp}."`;
	}
	return {queryType, type, message, value};
}
async function handleEdit(queryParts, d, t) {
	let queryType = 'edit';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	if (!d) {
		message = 'No database opened.';
	} else if (queryParts[0]) {
		const check = await tableExists(d, queryParts[0]);
		if (check.valueOf()) {
			const newTable = JSON.parse(await fetchTable(d, queryParts[0]));
			table.set(newTable);
			message = `Editing ${queryParts[0]}...`;
			type = 'success';
		} else {
			message = `Table "${queryParts[0]}" does not exist in "${d}."`;
		}
	}

	return { queryType, message, type, value };
}

async function handleInsert(queryParts, t) {
	let queryType = 'insert';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	switch (queryParts[0].toLowerCase()) {
		case 'item':

			for (let i = 2; i < queryParts.length; i++) {
				queryParts[1] += queryParts[i];
			}
			if (!queryParts[1] || !queryParts[1].endsWith(')') || !queryParts[1].startsWith('(')) break;

			if (t) {
				const insert = parseInsertValue(queryParts[1]);
				const object = {};
				if (insert.length !== t.metadata.columns.length) {
					message = 'Incorrect number of parameters.';
					break;
				}
				for (let i = 0; i < t.metadata.columns.length; i++) {
					object[t.metadata.columns[i]] = insert[i];
				}

				message = 'Successfully inserted object.';
				type = 'success';
				value = object;
				t.items.push(object);
				table.set(t);
			}
			break;
		case 'column':
			const valueMatch = queryParts.join(' ').match(/column \(([^)]+)\)/);
			if (!valueMatch) return { queryType, message, type, value };

			const base = valueMatch[1].trim().replace(/ /g,'_');
			if (base) {
				let columnName = base;
				let increment = 1;
				while(t.metadata.columns.includes(columnName)){
					columnName = `${base}_${increment}`;
					increment++;
				}
				t.metadata.columns.push(columnName);
				table.set(t);
				message = 'Successfully inserted column.';
				type = 'success';
			}
			break;
	}
	return { queryType, message, type, value };
}

async function handleRemove(queryParts, t) {
	let queryType = 'remove';
	let message = 'Invalid query.';
	let type = 'error';
	let value = '';

	switch (queryParts[0]?.toLowerCase()) {
		case 'item':
			
			const conditions = parseConditions(queryParts.slice(1).join(' '));
			
			if (!conditions.length) break;

			const initialLength = t.items.length;
			t.items = t.items.filter(item => !evaluateConditions(item, conditions));

			if (t.items.length === initialLength) {
				message = 'No items matched the criteria.';
			} else {
				table.set(t);
				message = 'Removed object(s).';
				type = 'success';
			}
			break;
		case 'column':
			const valueMatch = queryParts.join(' ').match(/column \(([^)]+)\)/);
			if (!valueMatch) return { queryType, message, type, value };
			
			const column = valueMatch[1].trim();
	
			if (!column || column === t.metadata.primaryKey) {
				message = `"${column}" is a primary key.`;
				break;
			}

			const columnIndex = t.metadata.columns.indexOf(column);
			if (columnIndex !== -1) {
				t.metadata.columns.splice(columnIndex, 1);
				t.items.forEach(item => delete item[column]);
				table.set(t);
				message = `Removed column "${column}."`;
				type = 'success';
			}
			break;
		default:
			break;
	}

	return { queryType, message, type, value };
}

function parseInsertValue(insert) {
	insert = insert.substring(1, insert.length - 1).split(',').map(s => s.trim());
	return insert;
}

function parseConditions(conditionsStr) {
	const conditions = conditionsStr.split(/(?<=\))\s*(AND|OR)\s*(?=\()/i).map(cond => cond.trim());
	if (conditions.length % 2 === 0) return null; // Invalid conditions

	
	const parsedConditions = [];
	for (let i = 0; i < conditions.length; i++) {
		if (i % 2 === 0) {
			const [property, value] = conditions[i].slice(1, -1).split('=').map(s => s.trim());
			parsedConditions.push({ property, value });
		} else {
			parsedConditions.push(conditions[i].toUpperCase());
		}
	}
	
	return parsedConditions;
}

function evaluateConditions(item, conditions) {
	let result = true;
	let currentLogic = 'AND';

	for (let i = 0; i < conditions.length; i++) {
		if (typeof conditions[i] === 'string') {
			currentLogic = conditions[i];
			
		} else {
			const { property, value } = conditions[i];
			const conditionResult = item[property] === value;
			if (currentLogic === 'AND') {
				result = result && conditionResult;

			} else if (currentLogic === 'OR') {
				result = result || conditionResult;
			}
		}
		
	}

	return result;
}

async function createDatabase(name) {
	const check = await exists(`${baseDir}\\${name}`, { dir: BaseDirectory.Document });
	if (check.valueOf()) {
		return { type: 'error', message: `Database "${name}" already exists.` };
	} else {
		await createDir(`${baseDir}\\${name}`, { dir: BaseDirectory.Document, recursive: true });
		return { type: 'success', message: `Created database "${name}."` };
	}
}

async function createTable(database, name) {
	const check = await exists(`${baseDir}\\${database}\\${name}.json`, { dir: BaseDirectory.Document });
	if (check.valueOf()) {
		return { type: 'error', message: `Table "${name}" already exists in database "${database}."` };
	} else {
		const template = { metadata: { name, columns: ['id'], primaryKey: 'id' }, items: [] };
		const jsonString = JSON.stringify(template);
		await writeTextFile(`${baseDir}\\${database}\\${name}.json`, jsonString, { dir: BaseDirectory.Document });
		return { type: 'success', message: `Created table "${name}" in database "${database}."` };
	}
}

async function databaseExists(name) {
	return (await exists(`${baseDir}\\${name}`, { dir: BaseDirectory.Document })).valueOf();
}

async function tableExists(database, name) {
	return (await exists(`${baseDir}\\${database}\\${name}.json`, { dir: BaseDirectory.Document })).valueOf();
}

async function fetchTable(database, name) {
	return await readTextFile(`${baseDir}\\${database}\\${name}.json`, { dir: BaseDirectory.Document });
}
