<script>
	export let value = '';
	export let editable = true;
	let unique = {};
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	if (!value) {
		value = '-';
	}
	function handleKeyPress(e) {
		if (e.code === 'Enter') {
			e.target.blur();
		}
	}
	function handleBlur(e) {
		if (e.target.innerText && editable) {
			dispatch('change', { old: value, new: e.target.innerText });
			unique = {};
		} else {
			e.target.innerText = value;
		}
	}
	function handleFocus(e) {
		selectAllText(e.target);
	}
	function selectAllText(contentEle) {
		const range = document.createRange();
		range.selectNodeContents(contentEle);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
</script>

{#key unique}
	<div
		role="textbox"
		tabindex="0"
		on:blur={handleBlur}
		on:focus={handleFocus}
		on:keypress={handleKeyPress}
		contenteditable={editable}
	>
		{value}
	</div>
{/key}

<style>
	div {
		outline: none;
		cursor: text;
		min-width: 10px;
	}
	div::selection {
		background-color: var(--text);
		color: var(--accent);
	}
</style>
