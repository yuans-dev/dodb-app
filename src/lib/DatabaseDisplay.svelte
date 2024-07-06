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
	async function handleAddItem(event) {
		let newResponse = await handleQuery('insert item default');
		dispatch('response', newResponse);
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
					}}
					class="add-button"><i class="fa-solid fa-plus"></i></button
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
			<div class="addItemButton-container">
				<button on:click={handleAddItem} class="add-item-button"
					><i class="fa-solid fa-plus"></i>Add item</button
				>
			</div>
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
	.add-button {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		padding: 0.4rem;
		height: fit-content;
		width: fit-content;
		border: none;
		font-family: monospace;
		border-radius: 0.2rem;

		background-color: var(--accent);
		color: var(--text);

		transition: all 0.3s ease;
	}
	.add-button:hover {
		background-color: var(--text);
		color: var(--accent);
	}

	.addItemButton-container {
		display: table-caption;
		width: 100%;
		text-align: center;
		caption-side: bottom;
		padding: 1rem 2.54rem 1rem 1rem;
	}
	.add-item-button {
		display: flex;
		width: 100%;
		justify-content: center;
		gap: 0.5rem;
		align-items: center;
		border: none;
		background-color: #212021;
		padding-block: 0.5rem;
		border-radius: 0.2rem;
		color: var(--text);
		cursor: pointer;
		font-family: monospace;
		font-weight: bold;
		transition: all 0.3s ease;
	}
	.add-item-button:hover {
		background-color: #2b292b;
	}
</style>
