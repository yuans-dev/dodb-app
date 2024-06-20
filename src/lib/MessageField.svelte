<script>
	export let responses = [];
</script>

<div class="message-field">
	{#each responses as response}
	<div class="response">
		<span class="{response.type}">> {response.type === "success"? "OK" : "ERROR"}</span><span class={response.type}>{response.message}</span>
	</div>
		
	{/each}
</div>

<style>
	.message-field {
		display: flex;
		flex-direction: column-reverse;
		font-size: 1rem;
		overflow: auto;
		width: 100%;
		background-color: rgb(12, 12, 12);
		padding: 0.5rem 0.2rem;
		border: 2px inset #888;
		border-radius: 0.4rem 0 0 0.4rem;
	}
	.message-field::-webkit-scrollbar{
		max-width: 0px;
		transition: all 0.3s ease;
	}
	.message-field:hover::-webkit-scrollbar{
		max-width: 5px;
	}
	.response{
		display: flex;

	}
	.response > span:first-child{
		padding-right: 1rem;
		width: 90px;
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
