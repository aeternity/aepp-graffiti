<template>
  <div>
    <h1>Drone Graffiti Teaser</h1>
    <a target="_blank" :href="`https://www.google.com/maps/search/${geolocation}`">{{geolocation}}</a><br/>
    <div v-for="teaser in teaserData">
      <a target="_blank"
         :href="`https://testnet.explorer.aepps.com/#/tx/${teaser.transaction}`">{{teaser.transaction}}</a><br/>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import TeaserUtil from '@/utils/blockchain_teaser_utils'
  import {EpochChain, EpochContract} from '@aeternity/aepp-sdk'

  export default {
    name: 'Admin',
    components: {},
    data() {
      return {
        // TODO change to mainnet as well as in href
        mainnetUrl: "https://sdk-testnet.aepps.com",

        // TODO: real contract hash
        teaserContractAddress: "ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr", //"ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr",

        // TODO: teaserData from contract
        teaserData: [{
          id: 1,
          updatedAt: 34955,
          artworkReference: "QmUXh2fDRJu5PP8wWvtU55VPCeruzFJpbBqWPFBPAKKEXh",
          transaction: null
        }],

        geolocation: null
      }
    },
    computed: {},
    methods: {
      async teaserContractData() {
        const client = await EpochChain.compose(EpochContract)({
          url: `https://sdk-mainnet.aepps.com`,
          internalUrl: `https://sdk-mainnet.aepps.com`,
        })

        const called = await client.contractEpochCall(this.teaserContractAddress, 'sophia-address', 'all_artworks', '()', '')
        const decoded = await client.contractEpochDecodeData(TeaserUtil.artworkListType, called.out)
        return TeaserUtil.artworkListToObject(decoded);
      },

      async teaserContractGeolocation() {
        const client = await EpochChain.compose(EpochContract)({
          url: `https://sdk-mainnet.aepps.com`,
          internalUrl: `https://sdk-mainnet.aepps.com`,
        })

        const called = await client.contractEpochCall(this.teaserContractAddress, 'sophia-address', 'get_geolocation', '()', '')
        const decoded = await client.contractEpochDecodeData(TeaserUtil.geolocationType, called.out)
        return TeaserUtil.geolocationToObject(decoded);
      },

      async transactionHash(height) {
        const block = await axios.get(`${this.mainnetUrl}/v2/generations/height/${height}`)
          .then(x => x.data);
        const microblocks = await Promise.all(
          block.micro_blocks
            .map(microblock => axios.get(`${this.mainnetUrl}/v2/micro-blocks/hash/${microblock}/transactions`)
              .then(x => x.data))
        );
        return microblocks
          .reduce((acc, val) => acc.concat(val.transactions), [])
          .filter(t => t.tx.contract_id && t.tx.contract_id === this.teaserContractAddress)
          .map(t => t.hash)[0];
      }
    },
    async created() {
      //this.teaserData = await this.teaserContractData();

      this.teaserData = await Promise.all(this.teaserData.map(async teaser => {
        teaser.transaction = await this.transactionHash(teaser.updatedAt);
        return teaser;
      }))

      this.geolocation = await this.teaserContractGeolocation();
    }
  }
</script>

<style lang="scss" scoped>

</style>
