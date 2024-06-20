<script>
	export let value = '';
	import { createEventDispatcher } from 'svelte';
	import {handleQuery} from './query';

	const dispatch = createEventDispatcher();
	let editable = false;
	let input;
	let inputValue;

	async function toggleEditable() {
		editable = !editable;
		if (!editable) {
			let newResponse = await handleQuery(`rename column (${value}) to (${inputValue})`);
			dispatch('response',newResponse);
		} else {
			inputValue = value;
		}
	}
	function init(el) {
		el.focus();
		el.select();
	}
	function handleEnter(e) {
		if (e.code === 'Enter') {
			e.target.blur();
		}
	}

	function requestDelete() {
		dispatch('requestDelete', { value });
	}
</script>

<div class="column">
	<button on:click={requestDelete} class="delete-button"><i class="fa-solid fa-trash"></i></button>
	{#if editable}
		<input
			bind:this={input}
			on:keypress={handleEnter}
			bind:value={inputValue}
			on:blur={toggleEditable}
			use:init
		/>
	{:else}
		<button class="column-button" on:click={toggleEditable}>{value}</button>
	{/if}
</div>

<style>
	.column {
		display: flex;
		height: fit-content;
		align-items: center;
		padding: 0.2rem;
		background-color: var(--accent);
		border-radius: 0.2rem;
		gap: 0.1rem;
	}
	.column-button,
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
	.column-button:hover,
	.delete-button:hover {
		background-color: var(--text);
		color: var(--accent);
	}
	input {
		height: fit-content;
		width: fit-content;
		border: none;
		font-family: monospace;
		border-radius: 0.2rem;
		padding: 0.2rem 0.4rem;
		background-color: var(--text);
		color: var(--accent);
		font-weight: bold;
		outline: none;
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
