<script>
	export let value = '';
	export let index = 0;
	export let columns = [];
	import { createEventDispatcher } from 'svelte';
	import { QueryResult } from './queryResult';

	const dispatch = createEventDispatcher();
	let editable = false;
	let input;
	let inputValue;
	$: value && validate();
	function toggleEditable() {
		editable = !editable;
		if (!editable) {
			if (inputValue) {
				value = inputValue;
			} else {
				dispatch('error', {
					queryType: 'rename column',
					type: 'error',
					message: 'Column name cannot be empty.',
					value: null
				});
			}
		} else {
			inputValue = value;
		}
	}
	function init(el) {
		el.focus();
		el.select();
	}
	function handleEnter(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	}
	function validate() {
		let suffix = 0;
		let name = value;
		for (let i = 0; i < columns.length; i++) {
			if (value === columns[i] && i != index) {
				suffix++;
				value = `${name}_${suffix}`;
			}
		}
		dispatch('change');
	}
	function requestDelete() {
		dispatch('requestDelete', { index });
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
