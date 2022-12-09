<script lang="ts">
    import { goto } from "$app/navigation";
</script>


<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3">
    <div class="hero min-h-screen bg-base-200">
        <div class="hero-content flex-col lg:flex-row-reverse">
          <img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl" alt=""/>
          <div>
            <h1 class="text-5xl font-bold">Enigma maker</h1>
            <p class="py-6">Make your enigmas ideas come to life !</p>
            <button on:click={() => goto('/login')} class="btn btn-primary">Get Started</button>
          </div>
        </div>
    </div>
  </div>
</div>