<template>
  <div class="analytics-page">
    <h2>Analytics</h2>

    <el-row :gutter="20" class="stats-row" v-loading="loading">
      <el-col :span="6" v-for="stat in statCards" :key="stat.label">
        <el-card class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row" v-if="!loading">
      <el-col :span="12">
        <el-card>
          <template #header><span>Contract Status Distribution</span></template>
          <div class="chart-placeholder">
            <el-progress
              v-for="item in statusBreakdown" :key="item.label"
              :percentage="item.pct"
              :status="item.status"
              :stroke-width="18"
              style="margin-bottom: 12px"
            >
              <template #default>
                <span class="progress-label">{{ item.label }} ({{ item.count }})</span>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>Platform Summary</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Total Contracts">{{ stats.totalContracts }}</el-descriptions-item>
            <el-descriptions-item label="Total Value (USD)">${{ Number(stats.totalValue).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="Active Contracts">{{ stats.activeContracts }}</el-descriptions-item>
            <el-descriptions-item label="Completed Contracts">{{ stats.completedContracts }}</el-descriptions-item>
            <el-descriptions-item label="Pending Contracts">{{ stats.pendingContracts }}</el-descriptions-item>
            <el-descriptions-item label="Total Accounts">{{ stats.totalAccounts }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const { getStats } = useAnalytics()
const loading = ref(false)
const stats = ref({
  totalContracts: 0,
  totalValue: 0,
  pendingContracts: 0,
  completedContracts: 0,
  activeContracts: 0,
  totalAccounts: 0,
})

onMounted(async () => {
  loading.value = true
  try {
    const data: any = await getStats()
    if (data) Object.assign(stats.value, data)
  } catch {
    ElMessage.error('Failed to load analytics')
  } finally {
    loading.value = false
  }
})

const statCards = computed(() => [
  { label: 'Total Contracts', value: stats.value.totalContracts },
  { label: 'Total Value (USD)', value: `$${Number(stats.value.totalValue).toLocaleString()}` },
  { label: 'Active', value: stats.value.activeContracts },
  { label: 'Completed', value: stats.value.completedContracts },
])

const statusBreakdown = computed(() => {
  const total = stats.value.totalContracts || 1
  return [
    { label: 'Pending', count: stats.value.pendingContracts, pct: Math.round(stats.value.pendingContracts / total * 100), status: 'warning' },
    { label: 'Active', count: stats.value.activeContracts, pct: Math.round(stats.value.activeContracts / total * 100), status: undefined },
    { label: 'Completed', count: stats.value.completedContracts, pct: Math.round(stats.value.completedContracts / total * 100), status: 'success' },
  ]
})
</script>

<style scoped>
.analytics-page { padding: 24px; }
.analytics-page h2 { margin: 0 0 20px; }
.stats-row { margin-bottom: 24px; }
.stat-card { text-align: center; }
.stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
.stat-label { font-size: 13px; color: #888; margin-top: 6px; }
.charts-row { margin-top: 8px; }
.chart-placeholder { padding: 8px 0; }
.progress-label { font-size: 12px; white-space: nowrap; }
</style>
