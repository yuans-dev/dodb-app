<script>
	import { onDestroy } from 'svelte';
	import { table, database } from './store';
	import Column from './Column.svelte';
	import { createEventDispatcher } from 'svelte';
	import { handleQuery, save } from './query';
	import ContentEditable from './ContentEditable.svelte';
	const dispatch = createEventDispatcher();

	async function addColumn() {
		let newResponse = await handleQuery('insert column (new)');
		dispatch('response', newResponse);
	}
	function handleError(event) {
		dispatch('response', event.detail);
	}
	async function handleAttributeChange(event, item, property) {
		let newResponse = await handleQuery(
			`assign value (${event.detail.new}) to (${property}) of item (${$table.metadata.primaryKey}=${item[$table.metadata.primaryKey]})`
		);
		dispatch('response', newResponse);
	}
	async function handleDelete(event) {
		let newResponse = await handleQuery(`remove column (${event.detail.value})`);
		dispatch('response', newResponse);
	}
	function handleResponse(event) {
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
							value={column}
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
			{#key $table.metadata.columns}
				{#each $table.items as item, i}
					<div class="item">
						{#each $table.metadata.columns as column, i}
							<div class="attribute-container">
								<div class="attribute">
									<ContentEditable
										on:change={(event) => {
											handleAttributeChange(event, item, column);
										}}
										bind:value={item[column]}
									></ContentEditable>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			{/key}
		</div>
	{/if}
</div>

<style>
	.table-display {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: monospace;
		height: 100%;
		overflow: auto;
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
		height: fit-content;
	}
	.table {
		display: table;
		width: fit-content;
		flex-direction: column;
	}
	.item {
		display: table-row;
		height: fit-content;
	}
	.attribute-container {
		display: table-cell;
		padding: 0.2rem 1rem;
	}
	.attribute {
		width: 100%;
		display: flex;
		padding: 0.2rem 1.4rem;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		border-radius: 0.2rem;
		background-color: #212021;
	}
</style>
