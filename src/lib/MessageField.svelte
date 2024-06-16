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
	}
	.error {
		color: red;
	}
</style>
