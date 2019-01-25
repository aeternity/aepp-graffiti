<template>
  <div>
    <WhiteHeader :back="back" title="Your Bid"></WhiteHeader>
    <div class="w-full p-8 pb-6">
      <div class="flex justify-center flex-col">
        <h1 class="text-center mb-2">Place your bid</h1>
        <span class="text-xl text-center leading-normal text-grey-darker">
          Your artwork takes the drone <span class="bold-info">{{transformedImage.dronetime}} minutes</span> to paint. How much AE do you want to bid per minute?
        </span>
      </div>
      <div class="mt-8">
        <ae-input type="number" label="Amount per Minute" step="0.01" placeholder="1" min="0" aemount :value="amount" @input="updateData">
          <template slot="header">
            <span class="text-grey">AE</span>
          </template>
          <ae-toolbar slot="footer">
            <div class="w-full flex justify-between">
              <span>{{transformedImage.dronetime}} Minutes</span>
             <span class="bold-info">~{{total.toLocaleString('en-US')}} AE in total</span>
            </div>
          </ae-toolbar>
        </ae-input>
      </div>
      <div class="w-full mt-8 flex justify-center">
        <ae-button face="round" fill="primary" @click="next" extend>Place Bid</ae-button>
      </div>
    </div>
  </div>
</template>

<script>
  import WhiteHeader from '@/components/WhiteHeader'
  import { AeInput, AeToolbar, AeButton } from '@aeternity/aepp-components'

  export default {
    name: 'Amount',
    components: { AeInput, WhiteHeader, AeToolbar, AeButton },
    data () {
      return {
        amount: null,
        total: 0
      }
    },
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      }
    },
    methods: {
      updateData (e) {
        if (e === '') {
          this.amount = null
          this.total = 0
        } else {
          this.amount = e
          this.total = this.amount * this.transformedImage.dronetime
        }
      },
      back () {
        this.$router.push('slots')
      },
      next () {
        this.$store.dispatch('updateBidding', {
          amount: this.total
        })
        this.$router.push('confirm');
      }
    }
  }
</script>

<style scoped>
 .bold-info {
   font-weight: 800;
 }
</style>
