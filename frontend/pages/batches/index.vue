<template>
  <div class="batches-page">
    <div class="page-header">
      <h2>Agricultural Batches</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        New Batch
      </el-button>
    </div>

    <el-table :data="batches" v-loading="loading" style="width: 100%">
      <el-table-column prop="batchNumber" label="Batch #" width="200" />
      <el-table-column prop="cropType" label="Crop" />
      <el-table-column prop="varietyName" label="Variety" />
      <el-table-column label="Qty (kg)" width="110">
        <template #default="{ row }">{{ Number(row.quantityKg).toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="originLocation" label="Origin" />
      <el-table-column label="Harvest" width="120">
        <template #default="{ row }">{{ new Date(row.harvestDate).toLocaleDateString() }}</template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="130">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ row.status.replace('_', ' ') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="130">
        <template #default="{ row }">
          <el-button text size="small" @click="openTimeline(row)">Timeline</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create Batch Dialog -->
    <el-dialog v-model="showCreateDialog" title="New Agricultural Batch" width="540px">
      <el-form :model="form" label-width="140px">
        <el-form-item label="Farmer ID" required>
          <el-input v-model="form.farmerId" placeholder="Account ID of farmer" />
        </el-form-item>
        <el-form-item label="Crop Type" required>
          <el-input v-model="form.cropType" placeholder="e.g. Wheat" />
        </el-form-item>
        <el-form-item label="Variety">
          <el-input v-model="form.varietyName" placeholder="Optional" />
        </el-form-item>
        <el-form-item label="Quantity (kg)" required>
          <el-input-number v-model="form.quantityKg" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="Harvest Date" required>
          <el-date-picker v-model="form.harvestDate" type="date" style="width:100%" />
        </el-form-item>
        <el-form-item label="Origin Location" required>
          <el-input v-model="form.originLocation" placeholder="Farm or region" />
        </el-form-item>
        <el-form-item label="Quality Grade">
          <el-select v-model="form.qualityGrade" placeholder="Select" style="width:100%" clearable>
            <el-option label="Grade A" value="A" />
            <el-option label="Grade B" value="B" />
            <el-option label="Grade C" value="C" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">Create Batch</el-button>
      </template>
    </el-dialog>

    <!-- Event Timeline Drawer -->
    <el-drawer v-model="showTimeline" :title="`Timeline: ${selectedBatch?.batchNumber}`" direction="rtl" size="400px">
      <div v-if="eventsLoading" class="timeline-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <el-timeline v-else>
        <el-timeline-item
          v-for="ev in events"
          :key="ev.id"
          :timestamp="new Date(ev.createdAt).toLocaleString()"
          placement="top"
        >
          <el-card shadow="never" class="event-card">
            <div class="event-type">{{ ev.eventType.replace(/_/g, ' ') }}</div>
            <div v-if="ev.location" class="event-detail">📍 {{ ev.location }}</div>
            <div v-if="ev.temperature != null" class="event-detail">🌡 {{ ev.temperature }}°C</div>
            <div v-if="ev.notes" class="event-detail">{{ ev.notes }}</div>
            <div v-if="ev.stellarTxId" class="event-detail tx-id">⛓ {{ ev.stellarTxId.slice(0, 20) }}…</div>
          </el-card>
        </el-timeline-item>
        <el-timeline-item v-if="events.length === 0" timestamp="No events recorded yet" />
      </el-timeline>

      <div class="record-event-form">
        <h4>Record Event</h4>
        <el-form :model="eventForm" label-width="100px" size="small">
          <el-form-item label="Event Type">
            <el-select v-model="eventForm.eventType" style="width:100%">
              <el-option v-for="t in eventTypes" :key="t" :label="t.replace(/_/g, ' ')" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="Actor ID">
            <el-input v-model="eventForm.actorId" placeholder="Account ID" />
          </el-form-item>
          <el-form-item label="Location">
            <el-input v-model="eventForm.location" />
          </el-form-item>
          <el-form-item label="Notes">
            <el-input v-model="eventForm.notes" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" :loading="eventSubmitting" @click="handleRecordEvent">
              Record
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { list, create, getEvents, recordEvent } = useBatches()
const batches = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const showTimeline = ref(false)
const selectedBatch = ref<any>(null)
const events = ref<any[]>([])
const eventsLoading = ref(false)
const eventSubmitting = ref(false)

const eventTypes = ['HARVEST','QUALITY_CHECK','STORAGE','TRANSPORT_START','TRANSPORT_END','CUSTOMS','DELIVERY','REJECTION']

const form = ref({
  farmerId: '', cropType: '', varietyName: '', quantityKg: 1000,
  harvestDate: null as Date | null, originLocation: '', qualityGrade: '',
})

const eventForm = ref({ eventType: 'QUALITY_CHECK', actorId: '', location: '', notes: '' })

const statusType = (s: string) => ({
  CREATED: 'info', IN_TRANSIT: 'warning', INSPECTED: 'primary',
  DELIVERED: 'success', REJECTED: 'danger',
}[s] ?? 'info')

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await list()
    batches.value = res.batches ?? []
  } catch {
    ElMessage.error('Failed to load batches')
  } finally {
    loading.value = false
  }
})

const handleCreate = async () => {
  if (!form.value.harvestDate) return ElMessage.warning('Select a harvest date')
  submitting.value = true
  try {
    await create({
      farmerId: form.value.farmerId,
      cropType: form.value.cropType,
      varietyName: form.value.varietyName || undefined,
      quantityKg: form.value.quantityKg,
      harvestDate: form.value.harvestDate.toISOString(),
      originLocation: form.value.originLocation,
      qualityGrade: form.value.qualityGrade || undefined,
    } as any)
    ElMessage.success('Batch created')
    showCreateDialog.value = false
    const res: any = await list()
    batches.value = res.batches ?? []
  } catch (err: any) {
    ElMessage.error(err.data?.error || 'Failed to create batch')
  } finally {
    submitting.value = false
  }
}

const openTimeline = async (batch: any) => {
  selectedBatch.value = batch
  showTimeline.value = true
  eventsLoading.value = true
  try {
    const res: any = await getEvents(batch.id)
    events.value = res.events ?? []
  } catch {
    ElMessage.error('Failed to load events')
  } finally {
    eventsLoading.value = false
  }
}

const handleRecordEvent = async () => {
  if (!selectedBatch.value) return
  eventSubmitting.value = true
  try {
    await recordEvent(selectedBatch.value.id, eventForm.value as any)
    ElMessage.success('Event recorded')
    const res: any = await getEvents(selectedBatch.value.id)
    events.value = res.events ?? []
  } catch (err: any) {
    ElMessage.error(err.data?.error || 'Failed to record event')
  } finally {
    eventSubmitting.value = false
  }
}
</script>

<style scoped>
.batches-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; }
.timeline-loading { display: flex; justify-content: center; padding: 40px; font-size: 24px; }
.event-card { margin-bottom: 4px; }
.event-type { font-weight: 600; font-size: 13px; text-transform: capitalize; }
.event-detail { font-size: 12px; color: #666; margin-top: 4px; }
.tx-id { font-family: monospace; }
.record-event-form { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; }
.record-event-form h4 { margin: 0 0 12px; }
</style>
