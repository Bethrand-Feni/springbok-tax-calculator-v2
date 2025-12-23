<script setup>
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import RadioButton from 'primevue/radiobutton';
import { ref } from 'vue';


const ageGroup = ref(1);
</script>


<template>
    <div class="h-screen w-screen flex flex-col items-center grass-bg">
        <div class="w-full max-w-md text-center p-6">
            <h1 class="chewy-regular text-5xl font-bold text-green-700 ">Springbok Tax Calculator</h1>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center gap-3 mb-20">
            <div class="w-full max-w-md mt-6 flex flex-col gap-2 p-3 md:flex-row ">
                <div class="flex flex-row gap-4">
                    <RadioButton class="radio-brand" v-model="ageGroup" :value="1"/>
                    <label>Under 65</label>
                </div>
                <div class="flex flex-row gap-4">
                    <RadioButton class="radio-brand" v-model="ageGroup" :value="2"/>
                    <label>Between 65 and 75</label>
                </div>
                <div class="flex flex-row gap-4">
                    <RadioButton class="radio-brand" v-model="ageGroup" :value="3"/>
                    <label>Over 75</label>
                </div>        
             </div>
            <Select class="w-full max-w-md mt-6 border !border-green-400 !rounded-lg" placeholder="How often do you get paid?" />
            <InputText class="w-full max-w-md mt-6 p-4 border !border-green-400 !rounded-lg" placeholder="How much do you earn before tax?" />
        </div>


    </div>
</template>