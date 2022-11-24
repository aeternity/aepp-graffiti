import { RpcAepp, Node } from '@aeternity/aepp-sdk/es';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';
import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import aeternity from './aeternityNetwork';
import {EventBus} from "./eventBus";
import config from '../config'

// Send wallet connection info to Aepp through content script

export const wallet = {
  client: null,
  height: null,
  pub: null,
  balance: null,
  walletName: null,

  async disconnect () {
    await this.client.disconnectWallet();
    this.walletName = null;
    this.pub = null;
    this.balance = null;
    await this.scanForWallets();
  },

  async getReverseWindow () {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://base.aepps.com/';
    //iframe.src = 'https://localhost:8080/';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    return iframe.contentWindow;
  },
  async scanForWallets (successCallback) {
    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' },
    });
    const detector = await Detector({ connection: scannerConnection });
    const handleWallets = async function ({ wallets, newWallet }) {
      detector.stopScan();
      const connected = await this.client.connectToWallet(await newWallet.getConnection());
      this.client.selectNode(connected.networkId); // connected.networkId needs to be defined as node in RpcAepp
      await this.client.subscribeAddress('subscribe', 'current');
      aeternity.client = this.client;
      aeternity.static = false;
      await aeternity.initProvider();
      successCallback();
    };

    detector.scan(handleWallets.bind(this));
  },
  async init (successCallback) {
    // Open iframe with Wallet if run in top window
    // window !== window.parent || await this.getReverseWindow();

    this.client = await RpcAepp({
      name: 'AEPP',
      nodes: [
        {name: 'ae_mainnet', instance: await Node({url: config.nodeUrl.ae_mainnet})},
        {name: 'ae_uat', instance: await Node({url: config.nodeUrl.ae_uat})}
      ],
      compilerUrl: config.compilerUrl,
      onNetworkChange (params) {
        this.selectNode(params.networkId); // params.networkId needs to be defined as node in RpcAepp
        aeternity.initProvider();
      },
      onAddressChange(addresses) {
        if(!addresses.current[aeternity.address])
          EventBus.$emit('addressChange');
      }
    });

    this.height = await this.client.height();
    await this.scanForWallets(successCallback);
  },
};
