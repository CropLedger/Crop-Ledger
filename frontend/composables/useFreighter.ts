/**
 * Freighter wallet composable.
 *
 * Freighter is loaded via CDN in the browser — it injects
 * `window.freighter` after the extension initialises.
 *
 * To install the Freighter browser extension:
 *   https://www.freighter.app/
 *
 * The @stellar/freighter-api npm package wraps the same API; to use it
 * with Nuxt instead of the CDN shim, run:
 *   npm install @stellar/freighter-api  (in the frontend folder)
 * and replace the `freighter()` helper below with:
 *   import freighterApi from '@stellar/freighter-api'
 */

interface FreighterAPI {
  isConnected(): Promise<{ isConnected: boolean }>
  getPublicKey(): Promise<{ publicKey: string }>
  signTransaction(xdr: string, opts?: { network?: string; networkPassphrase?: string }): Promise<{ signedTransaction: string }>
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>
}

function freighter(): FreighterAPI | null {
  if (import.meta.server) return null
  return (window as any).freighterApi ?? null
}

export const useFreighter = () => {
  const publicKey  = ref<string | null>(null)
  const network    = ref<string | null>(null)
  const connected  = ref(false)
  const error      = ref<string | null>(null)

  const isAvailable = computed(() => {
    if (import.meta.server) return false
    return !!(window as any).freighterApi
  })

  const connect = async () => {
    error.value = null
    const api = freighter()
    if (!api) {
      error.value = 'Freighter extension not found. Install it at freighter.app'
      return false
    }
    try {
      const { isConnected } = await api.isConnected()
      if (!isConnected) {
        error.value = 'Freighter is not connected. Open the extension and unlock it.'
        return false
      }
      const [pkRes, netRes] = await Promise.all([api.getPublicKey(), api.getNetwork()])
      publicKey.value = pkRes.publicKey
      network.value   = netRes.network
      connected.value = true
      return true
    } catch (e: any) {
      error.value = e.message ?? 'Failed to connect to Freighter'
      return false
    }
  }

  /**
   * Ask Freighter to sign an XDR-encoded Stellar transaction.
   * Returns the signed XDR string ready to submit to Horizon,
   * or null if the user rejected or an error occurred.
   */
  const signTransaction = async (xdr: string): Promise<string | null> => {
    error.value = null
    const api = freighter()
    if (!api) {
      error.value = 'Freighter not available'
      return null
    }
    try {
      const networkPassphrase =
        network.value === 'MAINNET'
          ? 'Public Global Stellar Network ; September 2015'
          : 'Test SDF Network ; September 2015'

      const { signedTransaction } = await api.signTransaction(xdr, { networkPassphrase })
      return signedTransaction
    } catch (e: any) {
      // User rejected the signing dialog
      error.value = e.message ?? 'Transaction signing rejected'
      return null
    }
  }

  const disconnect = () => {
    publicKey.value  = null
    network.value    = null
    connected.value  = false
    error.value      = null
  }

  return {
    publicKey,
    network,
    connected,
    error,
    isAvailable,
    connect,
    signTransaction,
    disconnect,
  }
}
