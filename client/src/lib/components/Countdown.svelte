<script lang="ts">
	import { ParseDate } from "$lib/utils";
	import { onMount } from "svelte";

    export let end_date: string;
    export let message: string;

    let end_date_obj: Date;
    let days: number;
    let hours: number;
    let minutes: number;
    let seconds: number;

    onMount(() => {
        end_date_obj = ParseDate(end_date);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = end_date_obj.getTime() - now.getTime();

            if (diff < 0)
            {
                clearInterval(interval);
                return;
            }

            days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days < 10)
            {
                days = parseInt('0' + days);
            }
            
            hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
            if (hours < 10)
            {
                hours = parseInt('0' + hours);
            }

            minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (minutes < 10)
            {
                minutes = parseInt('0' + minutes);
            }

            seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (seconds < 10)
            {
                seconds = parseInt('0' + seconds);
            }

        }, 1000);

    });

</script>

<p class="text-center text-xl font-semibold mb-1">{message}</p>
{#if message != 'Enigma ended'}
    <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
        <div class="flex flex-col">
            <span class="countdown font-mono text-3xl">
                <span style={`--value:${days};`}></span>
            </span>
            days
        </div> 
        <div class="flex flex-col">
            <span class="countdown font-mono text-3xl">
                <span style={`--value:${hours};`}></span>
            </span>
            hours
        </div> 
        <div class="flex flex-col">
            <span class="countdown font-mono text-3xl">
                <span style={`--value:${minutes};`}></span>
            </span>
            min
        </div> 
        <div class="flex flex-col">
            <span class="countdown font-mono text-3xl">
                <span style={`--value:${seconds};`}></span>
            </span>
            sec
        </div>
    </div>
{/if}