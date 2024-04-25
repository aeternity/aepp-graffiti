import { BrowserWindowMessageConnection, walletDetector, AeSdkAepp, AeSdk } from '@aeternity/aepp-sdk';
import aeternity, { nodes } from './aeternityNetwork';
import { EventBus } from "./eventBus";
import config from "../config";

// Send wallet connection info to Aepp through content script

export const wallet = {
    walletStatus: 'initial',

    async initWalletOrFallbackStatic() {
        wallet.walletStatus = 'connecting'

        try {
            // try to connect to Superhero Wallet
            aeternity.client = new AeSdkAepp({
                name: 'AEPP',
                nodes,
                onNetworkChange: async (network) => {
                    console.info('onNetworkChange:', network, aeternity.networkId !== network.networkId)
                    await this.aeConnectToNode(network.networkId)
                },
                onAddressChange: async (addresses) => {
                    console.info('onAddressChange:', addresses)
                    await this.aeConnectToNode(aeternity.networkId)
                    EventBus.$emit('addressChange');
                },
            })

            await this.scanForWallets()

            if (wallet.walletStatus === 'fallback_static') {
                aeternity.static = true;
                aeternity.client = new AeSdk({nodes})
                await this.aeConnectToNode(config.defaultNetworkId)
            }
        } catch (error) {
            console.error('initWallet error:', error)
            return false
        }

        return true
    },

    async scanForWallets() {
        wallet.walletStatus = 'scanning'

        const detectedWallet = await Promise.race([new Promise((resolve) => {
            const handleWallets = async () => {
                stopScan()
                resolve(true);
            }

            const scannerConnection = new BrowserWindowMessageConnection()
            const stopScan = walletDetector(scannerConnection, handleWallets)
        }), new Promise((resolve) => setTimeout(() => {
            resolve(false);
        }, 1000))]);

        console.log('scanForWallets detectedWallet:', detectedWallet)

        if (detectedWallet) {
            await new Promise((resolve) => {
                const handleWallets = async ({wallets, newWallet}) => {
                    try {
                        wallet.walletStatus = 'asking_permission'
                        newWallet = newWallet || Object.values(wallets)[0]
                        stopScan()

                        wallet.activeWallet = newWallet

                        const {networkId} = await aeternity.client.connectToWallet(newWallet.getConnection())
                        await aeternity.client.subscribeAddress('subscribe', 'current')

                        await this.aeConnectToNode(networkId);
                        resolve()
                    } catch (error) {
                        console.error('scanForWallets error:', error)
                        wallet.walletStatus = 'fallback_static'
                        resolve()
                    }
                }

                const scannerConnection = new BrowserWindowMessageConnection()
                const stopScan = walletDetector(scannerConnection, handleWallets)
            })
        } else {
            wallet.walletStatus = 'fallback_static'
        }
    },

    async aeConnectToNode(selectedNetworkId) {
        aeternity.client.selectNode(selectedNetworkId)
        await aeternity.initProvider()
    },
};
