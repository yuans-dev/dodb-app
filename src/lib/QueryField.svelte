<script>
	export let value = '';

	export let currentDatabase;
	import { handleQuery } from './handleQuery';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	async function handleEnter(sender) {
		if (sender.key === 'Enter') {
			await submit();
			value = '';
		}
	}
	async function submit() {
		let query = value.split(' ');

		if (query[0] === 'clear') {
			dispatch('clearRequest');

			return;
		}

		let newResponse = await handleQuery(query, currentDatabase);
		if (
			(newResponse.queryType === 'create db' || newResponse.queryType === 'open') &&
			newResponse.type === 'success'
		) {
			currentDatabase = newResponse.value;
		}
		dispatch('response', newResponse);
	}
</script>

<div class="query-field">
	<div class="database-indicator">
		{currentDatabase ? `>> ${currentDatabase}` : 'No database opened'}
	</div>
	<input type="text" bind:value on:keypress={handleEnter} />
</div>

<style>
	.query-field {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		width: 100%;
		font-family: monospace;
		gap: 1rem;
	}
	.database-indicator {
		font-weight: bold;
		font-size: 1rem;
	}
	input {
		width: 100%;
		padding: 0;
		box-sizing: border-box;
		border: none;
		font-size: 1rem;
		font-family: monospace;
		padding: 0.5rem;
		border-radius: 0.4rem;
		outline: none;
		background-color: var(--secondary);
		color: var(--text);
	}
</style>
