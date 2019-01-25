<template>
  <div>
    <InfoLayer>
      <h2>Slots</h2>
      <p class="p-4 pb-0">
        The bidding slots are fixed length auctions. While a slot is open, meaning the maximum block
        height is not reached, you may add your bid. Once the maximum block height is reached by the network the smart
        contract will take all top bids and send them to the drones to paint.
      </p>
    </InfoLayer>
    <WhiteHeader title="Auction Slots" :back="back"></WhiteHeader>


    <div class="w-full p-8 pb-6">
      <div class="flex justify-center flex-col">
        <h1 class="text-center mb-2">Dronetime Auctions</h1>
        <span class="text-xl text-center leading-normal text-grey-darker">
          Bid in an auction for your artwork to be sprayed on the wall
        </span>
      </div>
    </div>

    <div class="w-full p-8 flex justify-center items-center" v-if="isLoadingState">
      <div>
        <BiggerLoader></BiggerLoader>
      </div>
    </div>

    <div v-if="isEmptyListState" class="w-full">
      <swiper :options="swiperOption" ref="mySwiper" @slideChange="slideChange">
        <swiper-slide class="ae-max-width">
          <div class="mt-2 mb-2">
            <ae-card>
              <div class="flex flex-col relative w-full">
                <div>
                  <h2 class="text-black">Currently no open Auction Slots</h2>
                </div>
                <ae-divider></ae-divider>
                <div v-if="nextSlotAtHeight" class="flex flex-col text-black text-base mt-2">
                  <span>
                    Next Auction Slot opens in
                  </span>
                  <span class="font-mono text-black text-xl">
                    <Countdown :initialTime="(nextSlotAtHeight - height) * 180"></Countdown>
                  </span>
                </div>
                <div v-else class="flex flex-col text-black text-base mt-2">
                   <span>
                    no more Auction Slots planned
                  </span>
                </div>
              </div>
            </ae-card>
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <div v-if="isShowListState" class="w-full">

      <swiper :options="swiperOption" ref="mySwiper" @slideChange="slideChange">
        <swiper-slide v-for="slot in slots" :key="slot.id" class="ae-max-width">
          <div class="mt-2 mb-2">
            <ae-card>
              <div class="flex flex-col relative w-full">
                <div>
                  <h2 class="text-black">Slot {{slot.id}} ({{slot.successfulBids.length}} Bids)</h2>
                </div>
                <div class="flex flex-col text-black text-base mt-2">
                <span>
                  Slot will be open for estimated
                </span>
                  <span class="font-mono text-black text-xl">
                  <Countdown :initialTime="(slot.endBlockHeight - height) * 180"></Countdown>
                </span>
                </div>

                <ae-divider></ae-divider>
                <div class="flex flex-col text-black text-base mt-2">
                <span>
                 current minimum bid AE / Minute
                </span>
                  <span class="font-mono text-black text-xl" v-if="slot.successfulBids.length > 0">
                  {{slot.minimumBid.toFixed(5)}} AE
                </span>
                  <span class="font-mono text-black text-xl" v-else>
                  0 AE (No Bids)
                </span>
                </div>

                <ae-divider></ae-divider>
                <div class="flex flex-col text-black text-base mt-2">
                <span>
                  {{slot.remainingDronetime}} of {{slot.timeCapacity}} Minutes remaining Dronetime without minimum Bid
                </span>
                </div>

                <div v-if="slot.artworkToBig || slot.artworkToSmall">
                  <ae-divider></ae-divider>
                  <div class="flex flex-col mt-2">
                <span class="font-mono text-red text-lg" v-if="slot.artworkToBig">
                  Your artwork takes to much Dronetime for this slot. Consider making it smaller.
                </span>
                    <span class="font-mono text-red text-lg" v-if="slot.artworkToSmall">
                  Your artwork takes to less Dronetime for this slot. Consider making it larger.
                </span>
                  </div>
                </div>
              </div>
            </ae-card>
          </div>
        </swiper-slide>
      </swiper>
      <div class="w-full mt-6 flex justify-center">
        <ae-button class="ae-max-width" face="round" fill="primary" @click="next" extend>Bid on this slot</ae-button>
      </div>
    </div>
  </div>
</template>

<script>
  import InfoLayer from '@/components/InfoLayer'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Util from '@/utils/blockchain_util';
  import BiggerLoader from '@/components/BiggerLoader'
  import Countdown from '@/components/Countdown'
  import {AeButton, AeCard, AeDivider} from '@aeternity/aepp-components'
  import WhiteHeader from '@/components/WhiteHeader'
  import 'swiper/dist/css/swiper.css'

  import {swiper, swiperSlide} from 'vue-awesome-swiper'

  const SHOW_LIST = 1, EMPTY_LIST = 2, LOADING = 3;

  export default {
    name: 'Slots',
    components: {AeDivider, WhiteHeader, AeButton, AeCard, Countdown, BiggerLoader, InfoLayer, swiper, swiperSlide},
    data() {
      return {
        state: LOADING,
        bids: [],
        slots: [],
        client: null,
        height: 0,
        nextSlotAtHeight: null,
        choice: null,
        swiperOption: {
          slidesPerView: 'auto',
          spaceBetween: 35,
          centeredSlides: true
        }
      }
    },
    computed: {
      isLoadingState() {
        return this.state === LOADING
      },
      isShowListState() {
        return this.state === SHOW_LIST
      },
      isEmptyListState() {
        return this.state === EMPTY_LIST
      },
      blockchainSettings() {
        return this.$store.state.blockchainSettings
      },
      transformedImage() {
        return this.$store.state.transformedImage
      }
    },
    methods: {
      slideChange() {
        const realIndex = this.$refs.mySwiper.swiper.realIndex;
        this.choice = this.slots.find(slot => slot.index === realIndex).id
      },
      async updateMyBids() {
        const calledAllBids = await this.client.contractEpochCall(String(this.blockchainSettings.contractAddress), 'sophia-address', 'all_auction_slots', '()', '').catch(e => console.error(e));
        const decodedAllBids = await this.client.contractEpochDecodeData(Util.auctionSlotListType, calledAllBids.out).catch(e => console.error(e));

        let slotIndex = 0;
        const slots = Util.auctionSlotListToObject(decodedAllBids);

        const nextSlots = slots
          .filter(slot => Util.slotIsFuture(slot, this.height))
          .sort((a, b) => a.startBlockHeight - b.startBlockHeight);

        if (nextSlots.length) this.nextSlotAtHeight = nextSlots[0].startBlockHeight;

        this.slots = slots
          .filter(slot => Util.slotIsActive(slot, this.height))
          .map(slot => {
            slot.index = slotIndex++;
            slot.minimumBid = Math.min.apply(Math, slot.successfulBids.map(function (bid) {
              return bid.amountPerTime
            }));
            slot.minimumBid = slot.successfulBids.length === 0 ? 0 : Util.atomsToAe(slot.minimumBid);
            slot.remainingDronetime = Util.slotCapacityRemaining(slot);
            slot.artworkToBig = slot.maximumTimePerBid < this.transformedImage.dronetime;
            slot.artworkToSmall = slot.minimumTimePerBid > this.transformedImage.dronetime;
            return slot
          });

        if (this.slots.length > 0) this.state = SHOW_LIST;
        else return this.state = EMPTY_LIST;

        this.choice = this.slots[0].id
      },
      next() {
        this.$store.dispatch('updateBidding', {
          slot: this.choice
        });
        this.$router.push('amount')
      },
      back() {
        this.$router.push('positioning')
      }
    },
    created() {
      Aepp().then(async ae => {
        this.client = ae;
        this.height = await this.client.height();
        await this.updateMyBids()
      })
    }
  }
</script>

<style scoped lang="scss">
  .ae-max-width {
    width: 75%;
    max-width: 75%;
  }
</style>
