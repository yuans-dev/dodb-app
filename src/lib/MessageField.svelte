<script>
	export let responses = [];
</script>

<div>
	{#each responses as response}
		<span class={response.type}>{response.message}</span>
	{/each}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		font-size: 1rem;
	}
	.error {
		color: red;
	}
	span {
		font-family: monospace;
	}
	span::selection{
		background-color: var(--text);
		color:var(--accent);
	}
</style>
