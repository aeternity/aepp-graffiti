<template>
  <div>
    <ae-loader v-if="loading"/>
    <div v-if="!loading">
      <h2>current height</h2><br>
      <pre>{{height}}</pre>
      <br>
      <h2>slots</h2><br>
      <div class="flex slot-row">
        <div class="w-1/6">Slot Id</div>
        <div class="w-1/6">Time Capacity</div>
        <div class="w-1/6">Bid Time Bounds</div>
        <div class="w-1/6">Block Height Bounds</div>
        <div class="w-1/6">Successful Bids</div>
        <div class="w-1/6">Failed Bids</div>
      </div>
      <hr>
      <div v-for="slot in slots" :key="slot.id">
        <div class="flex slot-row">
          <div class="w-1/6">
            {{slot.id}}
            <ae-badge v-if="slot.timing.active" class="active-badge">active</ae-badge>
            <ae-badge v-if="slot.timing.past">past</ae-badge>
            <ae-badge v-if="slot.timing.future">future</ae-badge>
            <br>
            <ae-button v-if="slot.timing.past" face="round" fill="primary">
              <a :href="slot.downloadLink">
                export
                <ae-icon name="save"/>
              </a>
            </ae-button>
          </div>
          <div class="w-1/6">{{slot.capacityUsed}} min used of {{slot.timeCapacity}} min</div>
          <div class="w-1/6">
            Minimum Time: {{slot.minimumTimePerBid}}<br>
            Maximum Time: {{slot.maximumTimePerBid}}
          </div>
          <div class="w-1/6">
            Start: {{slot.startBlockHeight}}<br>
            <Countdown :initialTime="(slot.startBlockHeight - height) * avgBlockTime"></Countdown>
            <br>
            <br>
            End:&nbsp;&nbsp;{{slot.endBlockHeight}}<br>
            <Countdown :initialTime="(slot.endBlockHeight - height) * avgBlockTime"></Countdown>
            <br>
          </div>
          <div class="w-1/6">
            Count: {{slot.success.bids.length}}<br>
            Total: {{slot.success.amountSum}} AE<br>
            <div v-if="slot.success.bids.length">
              Min: {{Math.min(...slot.success.amountPerTime)}} AE/Min<br>
              Max: {{Math.max(...slot.success.amountPerTime)}} AE/Min
            </div>
            <ae-button v-if="slot.success.bids.length" face="round" fill="primary"
                       @click="showBids(slot.id, 'successful', slot.success.bids)">
              inspect
              <ae-icon name="eye"/>
            </ae-button>
          </div>
          <div class="w-1/6">
            Count: {{slot.failed.bids.length}}<br>
            Total: {{slot.failed.amountSum}} AE<br>
            <div v-if="slot.failed.bids.length">
              Min: {{Math.min(...slot.failed.amountPerTime)}} AE/Min<br>
              Max: {{Math.max(...slot.failed.amountPerTime)}} AE/Min
            </div>
            <ae-button v-if="slot.failed.bids.length" face="round" fill="primary"
                       @click="showBids(slot.id, 'failed', slot.success.bids)">
              inspect
              <ae-icon name="eye"/>
            </ae-button>
          </div>
        </div>
      </div>
      <ae-loader v-if="inspectBidsLoading"/>
      <div v-if="this.inspectBids">
        <h2>{{this.inspectBids.state}} bids Slot {{this.inspectBids.slotId}}</h2>
        <div class="flex slot-row">
          <div class="w-1/2">Data</div>
          <div class="w-1/2">Preview</div>
        </div>
        <div v-for="bid in this.inspectBids.bids" :key="bid.seqId">
          <div class="flex slot-row">
            <div class="w-1/2">
              Sequence: {{bid.seqId}}<br>
              Amount: {{bid.amountAe}} AE<br>
              Time: {{bid.time}} Min<br>
              Amount/Time: {{bid.amountPerTimeAe}} AE/Min<br>
              Bidder: {{bid.user}}<br>
              X:{{bid.data.coordinates.x}} Y:{{bid.data.coordinates.y}}
            </div>
            <div class="w-1/2">
              <img :src='bid.image' v-if="bid.image" class="w-full preview-image" alt="Bidding Image">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {EpochChain, EpochContract} from '@aeternity/aepp-sdk';
  import Util from '@/utils/blockchain_util';
  import Countdown from '@/components/Countdown';
  import {AeBadge, AeLoader, AeButton, AeIcon} from '@aeternity/aepp-components'
  import axios from 'axios'

  export default {
    name: 'Canvas',
    components: {AeLoader, AeBadge, AeButton, AeIcon, Countdown},
    data() {
      return {
        slots: [],
        height: 0,
        avgBlockTime: 3 * 60,
        loading: true,
        interval: null,
        inspectBidsLoading: false,
        inspectBids: null
      }
    },
    methods: {
      async loadData() {
        const client = await EpochChain.compose(EpochContract)({
          url: `https://ae-art-testnet.piwo.app`,
          internalUrl: `https://ae-art-testnet.piwo.app`,
        }).catch(console.error);

        this.height = await client.height();

        const called = await client.contractEpochCall(this.$store.state.blockchainSettings.contractAddress, 'sophia-address', 'all_auction_slots', '()').catch(console.error);
        const decoded = await client.contractEpochDecodeData(Util.auctionSlotListType, called.out).catch(console.error);
        this.slots = Util.auctionSlotListToObject(decoded)
          .sort((a, b) => a.endBlockHeight - b.endBlockHeight)
          .map(slot => {
            return {
              id: slot.id,
              downloadLink: `${this.$store.state.apiUrl}/slots/${slot.id}`,
              timing: {
                past: slot.startBlockHeight < this.height && slot.endBlockHeight <= this.height,
                active: slot.startBlockHeight < this.height && slot.endBlockHeight > this.height,
                future: slot.startBlockHeight >= this.height && slot.endBlockHeight > this.height
              },
              timeCapacity: slot.timeCapacity,
              minimumTimePerBid: slot.minimumTimePerBid,
              maximumTimePerBid: slot.maximumTimePerBid,
              startBlockHeight: slot.startBlockHeight,
              endBlockHeight: slot.endBlockHeight,
              capacityUsed: slot.successfulBids.reduce((acc, x) => Number(x.time) + acc, 0),
              success: {
                bids: slot.successfulBids.sort((a, b) => a.seqId - b.seqId),
                amountSum: Util.atomsToAe(slot.successfulBids.reduce((acc, x) => Number(x.amount) + acc, 0)),
                amountPerTime: slot.successfulBids.map(x => Number(x.amountPerTime)).map(x => Util.atomsToAe(x).toFixed(4))
              },
              failed: {
                bids: slot.failedBids.sort((a, b) => a.seqId - b.seqId),
                amountSum: Util.atomsToAe(slot.failedBids.reduce((acc, x) => Number(x.amount) + acc, 0)),
                amountPerTime: slot.failedBids.map(x => Number(x.amountPerTime)).map(x => Util.atomsToAe(x).toFixed(4))
              },

            }
          });
        this.loading = false;
      },
      async showBids(slotId, state, bids) {
        this.inspectBidsLoading = true;
        bids = await Promise.all(bids.map(async bid => {
          let response = await axios.get(this.$store.state.apiUrl + "/ipfs?hash=" + bid.data.artworkReference);
          bid.image = 'data:image/svg+xml;base64,' + btoa(response.data);
          bid.amountAe = Util.atomsToAe(bid.amount);
          bid.amountPerTimeAe = Util.atomsToAe(bid.amountPerTime).toFixed(4);
          return bid;
        }));
        this.inspectBidsLoading = false;
        this.inspectBids = {slotId: slotId, state: state, bids: bids};
      }
    },
    created() {
      this.loadData();
      this.interval = setInterval(this.loadData, 30000);
    },
    beforeDestroy() {
      clearInterval(this.interval)
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@aeternity/aepp-components/src/styles/variables/colors.scss";

  a {
    color: $color-neutral-maximum;
    text-decoration: none;
  }

  .slot-row {
    padding: 10px;
    border-top: 1px solid lightgray;
  }

  .active-badge {
    background-color: $color-primary;
  }

  .ae-button {
    transform-origin: top left;
    transform: scale(0.7);
  }

  .preview-image {
    max-height: 300px;
  }
</style>
