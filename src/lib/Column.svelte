<script>
	export let value = '';
	import { createEventDispatcher } from 'svelte';
	import { handleQuery } from './query';
	import ContentEditable from './ContentEditable.svelte';
	import { table } from './store';

	const dispatch = createEventDispatcher();

	async function requestRename(event) {
		let newResponse = await handleQuery(
			`rename column (${event.detail.old}) to (${event.detail.new})`
		);
		dispatch('response', newResponse);
	}
	function requestDelete() {
		dispatch('requestDelete', { value });
	}
	console.log(value !== $table.metadata.primaryKey);
</script>

<div class="column">
	<button on:click={requestDelete} class="delete-button"><i class="fa-solid fa-trash"></i></button>
	<ContentEditable bind:value on:change={requestRename}></ContentEditable>
</div>

<style>
	.column {
		display: flex;
		height: fit-content;
		align-items: center;
		padding: 0.2rem 0.4rem 0.2rem 0.2rem;
		background-color: var(--accent);
		border-radius: 0.2rem;
		gap: 0.1rem;
	}
	.delete-button {
		display: flex;
		justify-content: center;
		align-items: center;
		height: fit-content;
		width: fit-content;
		border: none;
		font-family: monospace;
		border-radius: 0.2rem;
		padding: 0.2rem 0.2rem;
		background-color: transparent;
		color: var(--text);
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	.delete-button {
		padding: 0.2rem 0.2rem;
	}
	.delete-button:hover {
		background-color: var(--text);
		color: var(--accent);
	}
	@keyframes peek {
		0% {
			transform: translateX(-100%);
			max-width: 0;
		}
		100% {
			transform: translateX(0%);
			max-width: 1000px;
		}
	}
</style>
