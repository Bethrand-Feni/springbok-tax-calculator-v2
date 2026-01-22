<script setup>
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import RadioButton from 'primevue/radiobutton';
import Button from 'primevue/button';
import { ref, computed } from 'vue';
import SelectButton from 'primevue/selectbutton';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import { calculateTax } from '../tax-calculation';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

const ageGroup = ref(1);
const difficulty = ['Simple','Advanced']
const difficultySelected = ref('Simple')
const paymentFrequency = ['Monthly','Yearly']
const paymentFrequencySelected = ref(null)
const showResults = ref(false);
const netIncome = ref(0);
const monthlyTax = ref(0);
const incomeInputted = ref(null);
const showExtraIncomeInfo = ref(false);
const showCalculationInfo = ref(false);
const medicalAid = ref(false);

const options = ref({
    otherIncome: null,
    otherIncomeDeductions: null,
    medicalAid: false,
    medicalDependents: null,
    pensionEmployee: null,
    pensionEmployer: null,
    providentEmployee: null,
    providentEmployer: null,
    retirementAnnuity: null,
})
const optionsBlank = {...options.value}

const calculateResults = () => {
    const tax = calculateTax(
        incomeInputted.value,
        ageGroup.value,
        paymentFrequencySelected.value,
        options.value
    );
    
    monthlyTax.value = tax.monthlyTax;
    netIncome.value = tax.netIncome;
    console.log('Tax calculation:', tax);
    console.log('Breakdown:', tax.breakdown);
    showResults.value = true;
}

const recalculate = () => {
    showResults.value = false
    incomeInputted.value = null;
    paymentFrequencySelected.value = null;
    options.value = {...optionsBlank}
}

const validation = computed(() => {
    if (incomeInputted.value === null || incomeInputted.value <= 0) {
        return false
    }
    if (ageGroup.value < 1 || ageGroup.value > 3) {
        return false
    }
    if (paymentFrequencySelected.value !== 'Monthly' && paymentFrequencySelected.value !== 'Yearly') {
        return false
    }
    return true
})



</script>

<template>
    <div class="min-h-dvh w-full flex flex-col md:items-center grass-bg">
        <div class="w-full max-w-md text-center p-6 mb-10">
            <h1 class="chewy-regular text-5xl font-bold ">
                <span class="text-[#1F2937]">South African </span>
                <span class="text-[#1F2937]">Tax </span>
                <span class="text-[#1F2937]">Calculator</span>
            </h1>
        </div>


        <div class=" flex-1 flex flex-col items-center gap-3 md:w-[700px] md:shadow-2xl md:border md:border-gray-100 md:rounded-lg min-h-0 mb-20 p-6">
            <div class="flex justify-end w-full -translate-y-23 hidden md:block">
                <img src="/make-it-rain.svg" draggable="false" class="w-30 h-30 pointer-events-none">
            </div>
            <div>
                <SelectButton v-model="difficultySelected" @change="recalculate()"  :options="difficulty"/>
            </div>
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
            <Select class="w-full max-w-md mt-6 !rounded-lg" v-model="paymentFrequencySelected" :options="paymentFrequency" placeholder="How often do you get paid?" />
            <InputNumber class="w-full max-w-md mt-6 !rounded-lg" v-model="incomeInputted" mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="How much do you earn before tax?" />

            <div class="mt-6 w-full md:w-[70%] min-h-0" v-if="difficultySelected === 'Advanced'">
                <Accordion class="w-full" value="0"   expandIcon="pi pi-plus" collapseIcon="pi pi-minus">
                    <AccordionPanel value="0">
                        <AccordionHeader>Other income (optional)</AccordionHeader>
                        <AccordionContent>
                            <div class="w-full flex justify-end">
                                <Button class="mb-3 !h-5 !w-5" @click="showExtraIncomeInfo = true" severity="contrast" rounded icon="pi pi-info"/>
                            </div>
                            <div class="flex flex-col md:flex-row gap-2">
                            <InputNumber v-model="options.otherIncome" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Other Income" />
                            <InputNumber v-model="options.otherIncomeDeductions" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Income Deductions" />
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="1">
                        <AccordionHeader>Medical aid (optional)</AccordionHeader>
                        <AccordionContent>
                            <div class="w-full flex flex-col gap-3">
                                <div class="flex flex-row gap-3 items-center">
                                    <Checkbox v-model="options.medicalAid" binary />
                                    <span>Do you have medical aid?</span>
                                </div>
                                <InputNumber v-if="options.medicalAid" v-model="options.medicalDependents" class="w-full max-w-md !rounded-lg" mode="decimal" :min="0" :max="10" fluid placeholder="How many dependants do you have?" />
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="2">
                        <AccordionHeader>Pension fund (optional)</AccordionHeader>
                        <AccordionContent>
                            <div class="flex flex-col gap-2 md:flex-row">
                                <InputNumber v-model="options.pensionEmployee" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Your own contributions" />
                                <InputNumber v-model="options.pensionEmployer" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Employer contributions" />
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="3">
                        <AccordionHeader>Provident fund (optional)</AccordionHeader>
                        <AccordionContent>
                            <div class="flex flex-col md:flex-row gap-2">
                                <InputNumber v-model="options.providentEmployee" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Your own contributions" />
                                <InputNumber v-model="options.providentEmployer" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Employer contributions" />
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="4">
                        <AccordionHeader>Retirement annuity (optional)</AccordionHeader>
                        <AccordionContent>
                            <InputNumber v-model="options.retirementAnnuity" class="w-full max-w-md !rounded-lg"   mode="currency" currency="ZAR" locale="en-ZA" fluid  placeholder="Your own contributions" />
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </div>
            <Button
                v-if="showResults==false"
                severity="contrast"
                icon="pi pi-calculator"
                label="Calculate Tax"
                @click="calculateResults"
                class="!bg-[#1F2937] !text-white mt-4"
                :disabled="!validation"
                />  
            
            <div v-if="showResults" id="results" class="w-full md:w-[90%] mt-6 h-[400px] bg-gray-200 flex flex-col items-center gap-3 p-6">
                <div class="flex flex-row justify-between w-full">
                    <span class="text-gray-700">Calculation information</span>
                    <Button class="mb-3 !h-5 !w-5" @click="showCalculationInfo = true" severity="contrast" rounded icon="pi pi-info"/>
                </div>
                <div class=" gap-2 w-full h-[1px] bg-gray-300"></div>
                <div class=" w-full text-left flex flex-row justify-between mt-3">
                    <span class="text-lg font-bold">Monthly Income Tax</span>
                    <span class="text-lg font-bold">R {{monthlyTax}}</span>
                </div>
                <span class="mb-5"> Note: Results are not fully catered for all scenarios and should be used as an indicator only</span>
                <div class=" gap-2 w-full h-[1px] bg-gray-300"></div>
                <div class="flex flex-row gap-7 md:gap-14 justify-center items-center mt-3">
                    <img src="/wallet.svg" draggable="false" alt="" class="w-25 h-25 pointer-events-none" />
                    <div class="flex flex-col gap-2">
                        <span class="text-sm">Your Income after tax</span>
                        <span class="text-lg font-bold">R {{netIncome}}</span>
                    </div>
                    <Button
                    icon="pi pi-refresh"
                    @click="calculateResults()"
                    class="!bg-[#1F2937] !text-white !border !border-[#1F2937] hover:!bg-[#374151] hover:!border-[#374151]"
                    />               
                 </div>
            </div>
        </div>
        <Dialog v-model:visible="showCalculationInfo" cancelable dismissableMask modal header="How Your Tax is Calculated" :style="{ width: '45rem' }">
            <span> We calculate your income tax by starting with your annual income and subtracting retirement contributions and any other deductions to get your taxable income. This is checked against the current tax threshold, and if tax is payable, the applicable tax rate is applied, followed by any rebates and medical tax credits.</span>
        </Dialog> 
        <Dialog v-model:visible="showExtraIncomeInfo" cancelable dismissableMask modal header="Other Income Info" :style="{ width: '45rem' }">
            <span>This is all your other incomes you make minus any expense to make it (income deductions). An example is if you make R50 000 from a rental property and you spend R10 000 on maintenance, then your net other income would be R50 000 - R10 000 = R40 000.</span>
        </Dialog>   
    </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;         
}
</style>