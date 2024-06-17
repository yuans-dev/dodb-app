<script>
	import { onDestroy } from 'svelte';
	import { currentlyEditing } from './store';
	import Column from './Column.svelte';
	import { createEventDispatcher } from 'svelte';
	import { save } from './handleQuery';
	const dispatch = createEventDispatcher();

	export let currentDatabase = null;
	let table;
	const unsubscribe = currentlyEditing.subscribe((value) => {
		table = value;
	});
	onDestroy(unsubscribe);

	function addColumn(name) {
		table.metadata.columns = [...table.metadata.columns, name];
		handleChange();
	}
	function handleError(event) {
		dispatch('response', event.detail);
	}
	function handleChange() {
		currentlyEditing.set(table);
		save(currentDatabase, $currentlyEditing);
	}
	function handleDelete(event) {
		let index = event.detail.index;
		table.metadata.columns = table.metadata.columns.toSpliced(index, 1);
		handleChange();
	}
</script>

<div class="table-display">
	{#if table}
		<span>{table ? table.metadata.name : 'Display'}</span>
		<div class="table">
			<div class="columns">
				{#each table.metadata.columns as column, i}
					<Column
						columns={table.metadata.columns}
						index={i}
						on:requestDelete={handleDelete}
						on:change={handleChange}
						on:error={handleError}
						bind:value={column}
					></Column>
				{/each}
				<button
					on:click={() => {
						addColumn('new column');
					}}>+</button
				>
			</div>
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
		display: flex;
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
</style>
