<script>
	export let value = '';
	export let responses = [];
	export let currentDatabase;
	import { handleQuery } from './handleQuery';

	async function handleEnter(sender) {
		if (sender.key === 'Enter') {
			await submit();
			value = '';
		}
	}
	async function submit() {
		let query = value.split(' ');
		let newResponse = await handleQuery(query, currentDatabase);
		if (
			(newResponse.queryType === 'create db' || newResponse.queryType === 'open') &&
			newResponse.type === 'success'
		) {
			currentDatabase = newResponse.value;
		}
		responses = [...responses, newResponse];
	}
</script>

<div class="query-field">
	<div>
		{currentDatabase ? `${currentDatabase}` : 'No database opened'}
	</div>
	<input type="text" bind:value on:keypress={handleEnter} />
</div>

<style>
	.query-field {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
