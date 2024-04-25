<template>
  <div>
    <WhiteHeader title="Auction Slots" :back="back">
      <h2>Auction Slots</h2>
      <p class="p-4 pb-0">
        The bidding slots are fixed length auctions. While a slot is open, meaning the maximum block
        height is not reached, you may add your bid. Once the maximum block height is reached by the network the smart
        contract will take all top paying bids and included them in our collaborative global canvas.
      </p>
    </WhiteHeader>


    <div class="w-full p-8 pt-4 pb-4">
      <div class="flex justify-center flex-col">
        <span class="text-xl text-center leading-normal text-grey-darker">
          Choose an auction slot to place a bid in, for your artwork to be included in our global canvas
        </span>
        <span class="text-xs text-center leading-normal text-gray-600">
          Once a slot is closed, all bids are immutably included in the artwork. When the slot is still open, higher bids can replace lower ones.
        </span>
      </div>
    </div>

    <div class="w-full p-8 flex justify-center items-center" v-if="isLoadingState">
      <div>
        <BiggerLoader></BiggerLoader>
      </div>
    </div>

    <div v-if="isEmptyListState" class="w-full">
      <Swiper :options="swiperOption" ref="mySwiper" @slideChange="slideChange">
        <SwiperSlide class="ae-max-width">
          <div class="mt-2 mb-2">
            <DarkCard>
              <div class="flex flex-col relative w-full">
                <div>
                  <h2>Currently no open Auction Slots</h2>
                </div>
                <ae-divider></ae-divider>
                <div v-if="nextSlotAtHeight" class="flex flex-col text-base mt-2">
                  <span>
                    Next Auction Slot opens in
                  </span>
                  <span class="font-mono text-xl">
                    <Countdown :initialTime="(nextSlotAtHeight - height) * 180"></Countdown>
                  </span>
                </div>
                <div v-else class="flex flex-col text-base mt-2">
                   <span>
                    no more Auction Slots planned
                  </span>
                </div>
              </div>
            </DarkCard>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <div v-if="isShowListState" class="w-full">

      <Swiper :options="swiperOption" ref="mySwiper" @slideChange="slideChange">
        <SwiperSlide v-for="slot in slots" :key="Number(slot.id)" class="ae-max-width">
          <div class="mt-2 mb-2">
            <DarkCard>
              <div class="flex flex-col relative w-full">
                <div>
                  <h2 >Slot {{slot.id}} ({{slot.successful_bids.length + slot.failed_bids.length}}
                    Bids)</h2>
                </div>
                <div class="flex flex-col text-base mt-2">
                <span>
                  Slot will be open for estimated
                </span>
                  <span class="font-mono text-xl">
                  <Countdown :initialTime="(Number(slot.end_block_height) - height) * 180"></Countdown>
                </span>
                </div>

                <ae-divider></ae-divider>
                <div class="flex flex-col text-base mt-2">
                <span>
                 current minimum bid AE / Minute
                </span>

                  <span class="font-mono text-xl" v-if="slot.successful_bids.length === 0">
                    0 AE (No Bids)
                  </span>
                  <span class="font-mono text-xl" v-else>
                    {{slot.minimumBid.toFixed(5)}} AE
                  </span>
                  <span v-if="slot.remainingDrawtime > 0" class="font-sans text-grey-darker text-base">{{slot.remainingDrawtime}} unclaimed Minutes</span>
                </div>


                <div v-if="slot.artworkToBig || slot.artworkToSmall">
                  <ae-divider></ae-divider>
                  <div class="flex flex-col mt-2">
                <span class="text-red-600 text-sm" v-if="slot.artworkToBig">
                  Your artwork takes to much painting time ({{transformedImage.dronetime}} min) for this slot (max: {{slot.maximum_time_per_bid}} min). Consider making it smaller.
                </span>
                    <span class="text-red-600 text-sm" v-if="slot.artworkToSmall">
                  Your artwork takes to less painting time ({{transformedImage.dronetime}} min) for this slot (min: {{slot.maximum_time_per_bid}} min). Consider making it larger.
                </span>
                  </div>
                </div>
              </div>
            </DarkCard>
          </div>
        </SwiperSlide>
      </Swiper>
      <div class="w-full mt-4 mb-8 flex justify-center">
        <transition>
          <ae-button class="ae-max-width" face="round" fill="primary" @click="next" extend v-if="!nextButtonDisabled">
            Choose this slot
          </ae-button>
          <ae-button class="ae-max-width" face="round" fill="neutral" extend disabled v-if="nextButtonDisabled">
            CAN NOT BID ON THIS SLOT
          </ae-button>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  import Util from '~/utils/blockchainUtil'
  import BiggerLoader from '~/components/BiggerLoader'
  import Countdown from '~/components/Countdown'
  import { AeButton, AeDivider } from '@aeternity/aepp-components/src/components'
  import WhiteHeader from '~/components/WhiteHeader'
  import 'swiper/swiper-bundle.css'
  import config from '~/config'
  import aeternity from '~/utils/aeternityNetwork'

  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import DarkCard from '../components/DarkCard'

  const SHOW_LIST = 1, EMPTY_LIST = 2, LOADING = 3

  export default {
    name: 'Slots',
    components: {DarkCard, AeDivider, WhiteHeader, AeButton, Countdown, BiggerLoader, Swiper, SwiperSlide },
    data () {
      return {
        state: LOADING,
        bids: [],
        slots: [],
        nextSlotAtHeight: null,
        choice: null,
        height: 0,
        interval: null,
        swiperOption: {
          slidesPerView: 'auto',
          spaceBetween: 10,
          centeredSlides: true
        },
      }
    },
    computed: {
      isLoadingState () {
        return this.state === LOADING
      },
      isShowListState () {
        return this.state === SHOW_LIST
      },
      isEmptyListState () {
        return this.state === EMPTY_LIST
      },
      blockchainSettings () {
        return config.blockchainSettings
      },
      transformedImage () {
        return this.$store.state.transformedImage
      },
      nextButtonDisabled () {
        let slot = this.slots.find(slot => slot.id === this.choice)
        return !this.choice
          || !this.slots
          || !slot
          || slot.artworkToBig
          || slot.artworkToSmall
          || !Util.slotIsActive(slot, aeternity.height)
      }
    },
    methods: {
      slideChange () {
        const realIndex = this.$refs.mySwiper.$swiper.realIndex
        this.choice = this.slots.find(slot => slot.index === realIndex).id
      },
      async updateSlots () {
        const allSlots = await aeternity.contract.all_auction_slots()

        // For rendering purposes
        this.height = await aeternity.updateHeight()

        let slotIndex = 0

        const nextSlots = allSlots.decodedResult
          .filter(slot => Util.slotIsFuture(slot, aeternity.height))
          .sort((a, b) => Number(a.start_block_height - b.start_block_height))

        if (nextSlots.length) this.nextSlotAtHeight = nextSlots[0].start_block_height

        this.slots = allSlots.decodedResult
          .filter(slot => Util.slotIsActive(slot, aeternity.height))
          .map(slot => {
            slot.index = slotIndex++
            slot.minimumBid = Math.min.apply(Math, slot.successful_bids.map(function (bid) {
              return Number(bid.amount_per_time)
            }))
            slot.minimumBid = slot.successful_bids.length === 0 ? 0 : Util.atomsToAe(slot.minimumBid)
            slot.remainingDrawtime = Util.slotCapacityRemaining(slot)
            slot.artworkToBig = slot.maximum_time_per_bid < this.transformedImage.dronetime
            slot.artworkToSmall = slot.minimum_time_per_bid > this.transformedImage.dronetime
            return slot
          })

        if (this.slots.length > 0) this.state = SHOW_LIST
        else return this.state = EMPTY_LIST

        this.choice = this.slots[0].id
      },
      next () {
        this.$store.dispatch('updateBidding', {
          slotId: this.choice,
          slotObject: this.slots.find(slot => slot.id === this.choice)
        })
        this.$router.push('amount')
      },
      back () {
        this.$router.push('positioning')
      }
    },
    mounted () {
      this.updateSlots()
      this.interval = setInterval(() => {
        this.updateSlots()
      }, 30000)
    },
    beforeDestroy () {
      clearInterval(this.interval)
    }
  }
</script>

<style scoped lang="scss">
  .ae-max-width {
    width: 75%;
    max-width: 75%;
  }
  .ae-card-shadow {
    box-shadow: 0 0 16px rgba(0,33,87,.15);
  }
</style>
