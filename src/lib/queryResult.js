export class QueryResult {
	constructor(queryType, type, message, value) {
		this.queryType = queryType;
		this.type = type;
		this.message = message;
		this.value = value;
	}
	queryType;
	type;
	message;
	value;
}
