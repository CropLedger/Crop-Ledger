<template>
  <div class="contracts-page">
    <div class="page-header">
      <div>
        <el-button text @click="router.push('/dashboard')">← Dashboard</el-button>
        <h2>Contracts</h2>
      </div>
      <div class="header-actions">
        <el-select
          v-model="statusFilter"
          placeholder="All statuses"
          clearable
          style="width: 180px"
          @change="loadContracts"
        >
          <el-option v-for="status in statuses" :key="status" :label="status" :value="status" />
        </el-select>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          New Contract
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-table :data="contracts" style="width: 100%" empty-text="No contracts yet">
        <el-table-column prop="contractNumber" label="Contract #" width="230" />
        <el-table-column prop="cropType" label="Crop" />
        <el-table-column prop="quantity" label="Quantity" width="100" />
        <el-table-column prop="unitPrice" label="Unit Price" width="110" />
        <el-table-column prop="totalPrice" label="Total" width="110" />
        <el-table-column prop="escrowState" label="Escrow" width="120" />
        <el-table-column prop="status" label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="viewContract(row.id)">View</el-button>
            <el-button
              size="small"
              type="success"
              :disabled="row.status === 'COMPLETED'"
              @click="completeContract(row)"
            >
              Complete
            </el-button>
            <el-button size="small" type="danger" @click="removeContract(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="New Contract" width="520px">
      <el-form :model="form" label-width="140px">
        <el-form-item label="Counterparty">
          <el-select v-model="form.sellerId" placeholder="Select seller" style="width: 100%" filterable>
            <el-option
              v-for="account in counterparties"
              :key="account.id"
              :label="`${account.email} (${account.type})`"
              :value="account.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Crop Type">
          <el-input v-model="form.cropType" placeholder="e.g. Wheat" />
        </el-form-item>
        <el-form-item label="Quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Unit Price">
          <el-input-number v-model="form.unitPrice" :min="0.01" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Delivery Date">
          <el-date-picker v-model="form.deliveryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Delivery Location">
          <el-input v-model="form.deliveryLocation" placeholder="Optional" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createContract">Create</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="Contract Detail" width="520px">
      <el-descriptions v-if="selected" :column="1" border>
        <el-descriptions-item label="Contract #">{{ selected.contractNumber }}</el-descriptions-item>
        <el-descriptions-item label="Crop">{{ selected.cropType }}</el-descriptions-item>
        <el-descriptions-item label="Quantity">{{ selected.quantity }}</el-descriptions-item>
        <el-descriptions-item label="Unit Price">{{ selected.unitPrice }}</el-descriptions-item>
        <el-descriptions-item label="Total">{{ selected.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="Status">{{ selected.status }}</el-descriptions-item>
        <el-descriptions-item label="Escrow">{{ selected.escrowState }}</el-descriptions-item>
        <el-descriptions-item label="Escrow Tx">{{ selected.escrowTxId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="Delivery">
          {{ new Date(selected.deliveryDate).toLocaleDateString() }}
          {{ selected.deliveryLocation ? `· ${selected.deliveryLocation}` : '' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Account, Contract, TransactionStatus } from '~/types/api'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const route = useRoute()
const { list, getById, create, update, remove } = useContracts()
const { user, listAccounts } = useAuth()

const statuses: TransactionStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']

const loading = ref(false)
const saving = ref(false)
const contracts = ref<Contract[]>([])
const counterparties = ref<Account[]>([])
const statusFilter = ref<TransactionStatus | undefined>()
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selected = ref<Contract | null>(null)

const form = ref({
  sellerId: '',
  cropType: '',
  quantity: 100,
  unitPrice: 10,
  deliveryDate: '',
  deliveryLocation: '',
})

const loadContracts = async () => {
  loading.value = true
  try {
    const data = await list(statusFilter.value)
    contracts.value = data.contracts
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Failed to load contracts'))
  } finally {
    loading.value = false
  }
}

const openCreateDialog = async () => {
  showCreateDialog.value = true
  try {
    const accounts = await listAccounts()
    counterparties.value = accounts.filter((account) => account.id !== user.value?.id)
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Failed to load accounts'))
  }
}

const createContract = async () => {
  saving.value = true
  try {
    await create({
      sellerId: form.value.sellerId,
      cropType: form.value.cropType,
      quantity: form.value.quantity,
      unitPrice: form.value.unitPrice,
      deliveryDate: form.value.deliveryDate,
      deliveryLocation: form.value.deliveryLocation || undefined,
    })
    ElMessage.success('Contract created')
    showCreateDialog.value = false
    await loadContracts()
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Contract creation failed'))
  } finally {
    saving.value = false
  }
}

const viewContract = async (id: string) => {
  try {
    selected.value = await getById(id)
    showDetailDialog.value = true
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Failed to load contract'))
  }
}

const completeContract = async (contract: Contract) => {
  try {
    await update(contract.id, { status: 'COMPLETED', escrowState: 'RELEASED' })
    ElMessage.success('Contract completed and escrow released')
    await loadContracts()
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Contract update failed'))
  }
}

const removeContract = async (contract: Contract) => {
  try {
    await ElMessageBox.confirm(`Delete contract ${contract.contractNumber}?`, 'Confirm', { type: 'warning' })
  } catch {
    return
  }

  try {
    await remove(contract.id)
    ElMessage.success('Contract deleted')
    await loadContracts()
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Contract deletion failed'))
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger',
    CANCELLED: 'info',
  }
  return statusMap[status] || 'info'
}

onMounted(async () => {
  await loadContracts()
  if (route.query.new) await openCreateDialog()
})
</script>

<style scoped>
.contracts-page {
  padding: 24px;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 8px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
