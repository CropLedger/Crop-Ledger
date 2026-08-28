<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <el-button text @click="router.push('/dashboard')">← Dashboard</el-button>
        <h2>Demand Analytics</h2>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card>
          <template #header>
            <span>Generate Forecast</span>
          </template>
          <el-form :model="form" label-width="130px">
            <el-form-item label="Crop Type">
              <el-input v-model="form.cropType" placeholder="e.g. Wheat" />
            </el-form-item>
            <el-form-item label="Region">
              <el-input v-model="form.region" placeholder="e.g. NG" />
            </el-form-item>
            <el-form-item label="Time Horizon">
              <el-input-number v-model="form.timeHorizon" :min="1" :max="365" style="width: 100%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="generating" @click="runForecast">Generate</el-button>
            </el-form-item>
          </el-form>

          <el-descriptions v-if="forecast" :column="1" border data-testid="forecast-result">
            <el-descriptions-item label="Predicted Demand">
              {{ Math.round(forecast.predictedDemand).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="Confidence">
              {{ (forecast.confidence * 100).toFixed(0) }}%
            </el-descriptions-item>
            <el-descriptions-item label="Horizon">{{ forecast.timeHorizon }} days</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card v-loading="loadingHistory">
          <template #header>
            <div class="card-header">
              <span>Historical Demand</span>
              <el-button text @click="loadHistorical">Refresh</el-button>
            </div>
          </template>
          <el-table :data="historicalRows" style="width: 100%" empty-text="No historical data">
            <el-table-column prop="month" label="Month" width="100" />
            <el-table-column label="Forecast Demand">
              <template #default="{ row }">{{ Math.round(row.demand).toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="Actual">
              <template #default="{ row }">{{ Math.round(row.actual).toLocaleString() }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Forecast } from '~/types/api'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const { generate, historical } = useForecast()

const generating = ref(false)
const loadingHistory = ref(false)
const forecast = ref<Forecast | null>(null)
const historicalRows = ref<Array<{ month: number; demand: number; actual: number }>>([])

const form = ref({
  cropType: 'Wheat',
  region: 'NG',
  timeHorizon: 30,
})

const runForecast = async () => {
  generating.value = true
  try {
    forecast.value = await generate(form.value)
    ElMessage.success('Forecast generated')
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Forecast generation failed'))
  } finally {
    generating.value = false
  }
}

const loadHistorical = async () => {
  loadingHistory.value = true
  try {
    const data = await historical({ cropType: form.value.cropType, region: form.value.region })
    historicalRows.value = data.data
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Failed to load historical data'))
  } finally {
    loadingHistory.value = false
  }
}

onMounted(loadHistorical)
</script>

<style scoped>
.analytics-page {
  padding: 24px;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 8px 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
