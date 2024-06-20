<script>
	import DatabaseDisplay from '../lib/DatabaseDisplay.svelte';
	import MessageField from '../lib/MessageField.svelte';
	import QueryField from '../lib/QueryField.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	let responses = [];
	function handleResponse(event) {
		responses = [event.detail, ...responses];
	}
	function clearResponses() {
		responses = [];
	}
</script>

<div class="app-proper">
	<div class="display-section">
		<DatabaseDisplay on:response={handleResponse}></DatabaseDisplay>
	</div>

	<div class="query-section">
		<MessageField {responses}></MessageField>
		<QueryField on:clearRequest={clearResponses} on:response={handleResponse}
		></QueryField>
	</div>
</div>

<style>
	@import '../styles/main.css';
	.app-proper {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		width: 100%;
		height: 100%;
		padding: 1rem;
	}
	.app-proper > * {
		display: flex;
		flex-direction: column;
		height: 50%;
	}
	.query-section {
		align-items: flex-start;
		justify-content: flex-end;
		overflow: hidden;
		gap: 1rem;
	}
</style>
