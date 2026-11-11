<template>
  <div class="contracts-page">
    <div class="page-header">
      <h2>Contracts</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        New Contract
      </el-button>
    </div>

    <el-table :data="contracts" v-loading="loading" style="width: 100%">
      <el-table-column prop="contractNumber" label="Contract #" width="160" />
      <el-table-column prop="cropType" label="Crop Type" />
      <el-table-column prop="quantity" label="Qty" width="100" />
      <el-table-column label="Total Price" width="140">
        <template #default="{ row }">
          ${{ Number(row.totalPrice).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="Delivery" width="130">
        <template #default="{ row }">
          {{ new Date(row.deliveryDate).toLocaleDateString() }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="130">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Escrow" width="120">
        <template #default="{ row }">
          <el-tag :type="escrowType(row.escrowState)" size="small">{{ row.escrowState }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create Contract Dialog -->
    <el-dialog v-model="showCreateDialog" title="New Contract" width="560px">
      <el-form :model="form" label-width="130px" ref="formRef">
        <el-form-item label="Buyer ID" prop="buyerId" required>
          <el-input v-model="form.buyerId" placeholder="Account ID of buyer" />
        </el-form-item>
        <el-form-item label="Seller ID" prop="sellerId" required>
          <el-input v-model="form.sellerId" placeholder="Account ID of seller" />
        </el-form-item>
        <el-form-item label="Crop Type" prop="cropType" required>
          <el-input v-model="form.cropType" placeholder="e.g. Wheat, Corn, Soybeans" />
        </el-form-item>
        <el-form-item label="Quantity (kg)" prop="quantity" required>
          <el-input-number v-model="form.quantity" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="Unit Price (USD)" prop="unitPrice" required>
          <el-input-number v-model="form.unitPrice" :min="0.01" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="Delivery Date" prop="deliveryDate" required>
          <el-date-picker v-model="form.deliveryDate" type="date" style="width:100%" />
        </el-form-item>
        <el-form-item label="Delivery Location">
          <el-input v-model="form.deliveryLocation" placeholder="Optional" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { list, create } = useContracts()
const contracts = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)

const form = ref({
  buyerId: '',
  sellerId: '',
  cropType: '',
  quantity: 1000,
  unitPrice: 0.5,
  deliveryDate: null as Date | null,
  deliveryLocation: '',
})

const statusType = (s: string) => ({ PENDING: 'warning', ACTIVE: 'primary', COMPLETED: 'success', CANCELLED: 'info', DISPUTED: 'danger' }[s] ?? 'info')
const escrowType = (s: string) => ({ LOCKED: 'warning', RELEASED: 'success', REFUNDED: 'info' }[s] ?? 'info')

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await list()
    contracts.value = res.contracts ?? []
  } catch {
    ElMessage.error('Failed to load contracts')
  } finally {
    loading.value = false
  }
})

const handleCreate = async () => {
  if (!form.value.deliveryDate) return ElMessage.warning('Select a delivery date')
  submitting.value = true
  try {
    await create({
      buyerId: form.value.buyerId,
      sellerId: form.value.sellerId,
      cropType: form.value.cropType,
      quantity: form.value.quantity,
      unitPrice: form.value.unitPrice,
      totalPrice: form.value.quantity * form.value.unitPrice,
      deliveryDate: form.value.deliveryDate.toISOString(),
      deliveryLocation: form.value.deliveryLocation || undefined,
    } as any)
    ElMessage.success('Contract created')
    showCreateDialog.value = false
    const res: any = await list()
    contracts.value = res.contracts ?? []
  } catch (err: any) {
    ElMessage.error(err.data?.error || 'Failed to create contract')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contracts-page { padding: 24px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 { margin: 0; }
</style>
