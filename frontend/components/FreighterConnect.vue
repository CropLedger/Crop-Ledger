<template>
  <div class="freighter-connect">
    <el-tooltip v-if="!isAvailable" content="Install the Freighter browser extension to connect your Stellar wallet" placement="bottom">
      <el-button size="small" disabled>
        <el-icon><WalletFilled /></el-icon>
        Wallet unavailable
      </el-button>
    </el-tooltip>

    <el-button v-else-if="!connected" size="small" type="warning" :loading="connecting" @click="handleConnect">
      <el-icon><WalletFilled /></el-icon>
      Connect Wallet
    </el-button>

    <el-dropdown v-else @command="handleCommand">
      <el-button size="small" type="success">
        <el-icon><WalletFilled /></el-icon>
        {{ shortKey }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="copy">Copy address</el-dropdown-item>
          <el-dropdown-item command="explorer">View on Stellar Expert</el-dropdown-item>
          <el-dropdown-item divided command="disconnect">Disconnect</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="true" @close="error = null" style="margin-top:8px;" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WalletFilled, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { isAvailable, connected, publicKey, error, connect, disconnect } = useFreighter()
const connecting = ref(false)

const shortKey = computed(() =>
  publicKey.value ? `${publicKey.value.slice(0, 6)}…${publicKey.value.slice(-4)}` : ''
)

const handleConnect = async () => {
  connecting.value = true
  await connect()
  connecting.value = false
}

const handleCommand = (cmd: string) => {
  if (cmd === 'copy' && publicKey.value) {
    navigator.clipboard.writeText(publicKey.value).catch(() => {})
    ElMessage.success('Address copied')
  } else if (cmd === 'explorer' && publicKey.value) {
    window.open(`https://stellar.expert/explorer/testnet/account/${publicKey.value}`, '_blank')
  } else if (cmd === 'disconnect') {
    disconnect()
  }
}
</script>

<style scoped>
.freighter-connect { display: inline-flex; flex-direction: column; align-items: flex-end; }
</style>
