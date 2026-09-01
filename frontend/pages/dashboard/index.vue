<template>
  <div class="dashboard">
    <el-container>
      <el-aside width="250px">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><Odometer /></el-icon>
            <span>Overview</span>
          </el-menu-item>
          <el-menu-item index="contracts">
            <el-icon><Document /></el-icon>
            <span>Contracts</span>
          </el-menu-item>
          <el-menu-item index="vaults">
            <el-icon><Wallet /></el-icon>
            <span>Vaults</span>
          </el-menu-item>
          <el-menu-item index="analytics">
            <el-icon><TrendCharts /></el-icon>
            <span>Analytics</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <div class="dashboard-header">
          <h2>Dashboard Overview</h2>
          <el-button type="primary" @click="handleNewContract">
            <el-icon><Plus /></el-icon>
            New Contract
          </el-button>
        </div>
        
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalContracts }}</div>
                <div class="stat-label">Total Contracts</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">${{ stats.totalValue.toLocaleString() }}</div>
                <div class="stat-label">Total Value</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.pendingContracts }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ stats.completedContracts }}</div>
                <div class="stat-label">Completed</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="content-row">
          <el-col :span="16">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>Recent Contracts</span>
                  <el-button text @click="viewAllContracts">View All</el-button>
                </div>
              </template>
              <el-table :data="recentContracts" style="width: 100%">
                <el-table-column prop="contractNumber" label="Contract #" width="150" />
                <el-table-column prop="cropType" label="Crop Type" />
                <el-table-column prop="quantity" label="Quantity" />
                <el-table-column prop="totalPrice" label="Total Price" />
                <el-table-column prop="status" label="Status">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>Quick Actions</span>
              </template>
              <div class="quick-actions">
                <el-button type="primary" @click="handleNewContract">
                  <el-icon><Plus /></el-icon>
                  Create Contract
                </el-button>
                <el-button @click="handleDeposit">
                  <el-icon><Wallet /></el-icon>
                  Deposit to Vault
                </el-button>
                <el-button @click="handleWithdraw">
                  <el-icon><Download /></el-icon>
                  Withdraw
                </el-button>
                <el-button @click="handleAnalytics">
                  <el-icon><TrendCharts /></el-icon>
                  View Analytics
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Odometer, Document, Wallet, TrendCharts, Setting, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const { list: listContracts } = useContracts()
const { getStats } = useAnalytics()
const activeMenu = ref('overview')
const loading = ref(true)

const stats = ref({
  totalContracts: 0,
  totalValue: 0,
  pendingContracts: 0,
  completedContracts: 0,
})

const recentContracts = ref([])

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const [contractsData, statsData] = await Promise.all([
      listContracts({ limit: 5 }),
      getStats(),
    ])
    
    recentContracts.value = contractsData.contracts || contractsData || []
    
    if (statsData) {
      stats.value = {
        totalContracts: statsData.totalContracts || 0,
        totalValue: statsData.totalValue || 0,
        pendingContracts: statsData.pendingContracts || 0,
        completedContracts: statsData.completedContracts || 0,
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch dashboard data:', error)
    ElMessage.error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const handleNewContract = () => {
  router.push('/contracts/new')
}

const handleDeposit = () => {
  router.push('/vaults/deposit')
}

const handleWithdraw = () => {
  router.push('/vaults/withdraw')
}

const handleAnalytics = () => {
  router.push('/analytics')
}

const viewAllContracts = () => {
  router.push('/contracts')
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger',
    CANCELLED: 'info',
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.el-aside {
  background-color: white;
  border-right: 1px solid var(--border-color);
}

.sidebar-menu {
  border: none;
  height: 100vh;
}

.el-main {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 5px;
}

.content-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  justify-content: flex-start;
}
</style>
