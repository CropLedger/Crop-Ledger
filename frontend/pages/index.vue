<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <h1>CropLedger Enterprise</h1>
          </div>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            class="main-menu"
          >
            <el-menu-item index="1">Dashboard</el-menu-item>
            <el-menu-item index="2">Contracts</el-menu-item>
            <el-menu-item index="3">Vaults</el-menu-item>
            <el-menu-item index="4">Analytics</el-menu-item>
            <el-menu-item index="5">Settings</el-menu-item>
          </el-menu>
          <div class="auth-buttons">
            <el-button type="primary" @click="handleLogin">Login</el-button>
            <el-button @click="handleSignup">Sign Up</el-button>
          </div>
        </div>
      </el-header>
      <el-main>
        <div class="hero-section">
          <h2>Enterprise Agricultural Supply Chain Management</h2>
          <p>Streamline your agricultural operations with blockchain-powered transparency and security</p>
          <div class="cta-buttons">
            <el-button type="primary" size="large">Get Started</el-button>
            <el-button size="large">Learn More</el-button>
          </div>
        </div>
        <div class="features-grid">
          <el-card v-for="feature in features" :key="feature.title" class="feature-card">
            <template #header>
              <div class="card-header">
                <el-icon><component :is="feature.icon" /></el-icon>
                <span>{{ feature.title }}</span>
              </div>
            </template>
            <p>{{ feature.description }}</p>
          </el-card>
        </div>
      </el-main>
      <el-footer>
        <p>&copy; 2025 CropLedger Enterprise. All rights reserved.</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, Wallet, TrendCharts, Lock } from '@element-plus/icons-vue'

const activeMenu = ref('1')

const features = ref([
  {
    title: 'Smart Contracts',
    description: 'Automated escrow payments via Stellar blockchain for secure transactions',
    icon: Document,
  },
  {
    title: 'Digital Vaults',
    description: 'Secure asset management with enterprise-grade vaults and yield farming',
    icon: Wallet,
  },
  {
    title: 'Real-time Analytics',
    description: 'Advanced dashboards with predictive crop yield analytics',
    icon: TrendCharts,
  },
  {
    title: 'Enterprise Security',
    description: 'Multi-tenant architecture with role-based access control',
    icon: Lock,
  },
])

const handleLogin = () => {
  console.log('Login clicked')
}

const handleSignup = () => {
  console.log('Signup clicked')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.el-header {
  background-color: var(--primary-color);
  color: white;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo h1 {
  font-size: 24px;
  margin: 0;
  color: white;
}

.main-menu {
  background-color: transparent;
  border: none;
  flex: 1;
  margin: 0 40px;
}

.main-menu .el-menu-item {
  color: white;
  border-bottom: 2px solid transparent;
}

.main-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-menu .el-menu-item.is-active {
  border-bottom-color: white;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.el-main {
  background-color: var(--bg-secondary);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.hero-section h2 {
  font-size: 48px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.hero-section p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.el-footer {
  background-color: var(--text-primary);
  color: white;
  text-align: center;
  padding: 20px;
}
</style>
