<script>
	import MessageField from '../lib/MessageField.svelte';
	import QueryField from '../lib/QueryField.svelte';

	let responses;
	let currentDatabase = null;
</script>

<div class="app-proper">
	<QueryField bind:responses bind:currentDatabase></QueryField>
	<MessageField {responses}></MessageField>
</div>

<style>
	@import '../styles/main.css';
	.app-proper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}
</style>
