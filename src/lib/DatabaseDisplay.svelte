<script>
	import { onDestroy } from 'svelte';
	import { table, database } from './store';
	import Column from './Column.svelte';
	import { createEventDispatcher } from 'svelte';
	import { handleQuery, save } from './query';
	const dispatch = createEventDispatcher();

	async function addColumn() {
		let newResponse = await handleQuery('insert column (new)');
		dispatch('response', newResponse);
	}
	function handleError(event) {
		dispatch('response', event.detail);
	}

	async function handleDelete(event) {
		
		let newResponse = await handleQuery(`remove column (${event.detail.value})`);;
		dispatch('response', newResponse);
	}
	function handleResponse(event){
		console.log(event);
		dispatch('response', event.detail);
	}
</script>

<div class="table-display">
	{#if $table}
		<span>{$table ? $table.metadata.name : 'Display'}</span>
		<div class="table">
			<div class="columns">
				{#each $table.metadata.columns as column, i}
					<div class="column">
						<Column
							on:requestDelete={handleDelete}
							on:error={handleError}
							bind:value={column}
							on:response={handleResponse}
						></Column>
					</div>
				{/each}
				<button
					on:click={() => {
						addColumn();
					}}>+</button
				>
			</div>
			{#each $table.items as item, i}
				<div class="item">
					{#each $table.metadata.columns as column, i}
						<span class="attribute">{item[column]}</span>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	div {
		display: flex;
		height: 100%;
	}
	.table-display {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: monospace;
	}
	.columns {
		display: table-row;
		height: fit-content;
		gap: 0.5rem;
	}
	.columns button {
		height: fit-content;
		width: fit-content;
		border: none;
		font-family: monospace;
		border-radius: 0.2rem;
		padding: 0.2rem 0.4rem;
		background-color: var(--accent);
		color: var(--text);
		font-weight: bold;
	}
	.column {
		display: table-cell;
		padding: 1rem;
		width: fit-content;
	}
	.table {
		display: table;
		flex-direction: column;
	}
	.item {
		display: table-row;
		height: fit-content;
	}
	.attribute {
		display: table-cell;
	}
</style>
