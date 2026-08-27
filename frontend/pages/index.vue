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
            @select="handleMenuSelect"
          >
            <el-menu-item index="1">Dashboard</el-menu-item>
            <el-menu-item index="2">Contracts</el-menu-item>
            <el-menu-item index="3">Vaults</el-menu-item>
            <el-menu-item index="4">Analytics</el-menu-item>
            <el-menu-item index="5">Settings</el-menu-item>
          </el-menu>
          <div class="auth-buttons" v-if="!isAuthenticated">
            <el-button type="primary" @click="showLoginDialog = true">Login</el-button>
            <el-button @click="showSignupDialog = true">Sign Up</el-button>
          </div>
          <div class="auth-buttons" v-else>
            <el-dropdown @command="handleUserMenu">
              <el-button type="primary">
                {{ user?.firstName || 'Account' }} <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">Profile</el-dropdown-item>
                  <el-dropdown-item command="logout">Logout</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <div class="hero-section">
          <h2>Enterprise Agricultural Supply Chain Management</h2>
          <p>Streamline your agricultural operations with blockchain-powered transparency and security</p>
          <div class="cta-buttons">
            <el-button type="primary" size="large" @click="showSignupDialog = true">Get Started</el-button>
            <el-button size="large" @click="scrollToFeatures">Learn More</el-button>
          </div>
        </div>
        <div class="features-grid" ref="featuresSection">
          <el-card v-for="feature in features" :key="feature.title" class="feature-card" :body-style="{ padding: '20px' }">
            <template #header>
              <div class="card-header">
                <el-icon :size="28"><component :is="feature.icon" /></el-icon>
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

    <!-- Login Dialog -->
    <el-dialog v-model="showLoginDialog" title="Login" width="400px">
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="Email">
          <el-input v-model="loginForm.email" type="email" placeholder="Enter your email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="loginForm.password" type="password" placeholder="Enter your password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLoginDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleLogin" :loading="loading">Login</el-button>
      </template>
    </el-dialog>

    <!-- Signup Dialog -->
    <el-dialog v-model="showSignupDialog" title="Sign Up" width="500px">
      <el-form :model="signupForm" label-width="100px">
        <el-form-item label="Email">
          <el-input v-model="signupForm.email" type="email" placeholder="Enter your email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="signupForm.password" type="password" placeholder="Create a password" />
        </el-form-item>
        <el-form-item label="First Name">
          <el-input v-model="signupForm.firstName" placeholder="Enter your first name" />
        </el-form-item>
        <el-form-item label="Last Name">
          <el-input v-model="signupForm.lastName" placeholder="Enter your last name" />
        </el-form-item>
        <el-form-item label="Account Type">
          <el-select v-model="signupForm.type" placeholder="Select account type" style="width: 100%">
            <el-option label="Enterprise" value="ENTERPRISE" />
            <el-option label="Cooperative" value="COOPERATIVE" />
            <el-option label="Inspector" value="INSPECTOR" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSignupDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleSignup" :loading="loading">Sign Up</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Wallet, TrendCharts, Lock, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeMenu = ref('1')
const showLoginDialog = ref(false)
const showSignupDialog = ref(false)
const loading = ref(false)
const featuresSection = ref<HTMLElement | null>(null)

const loginForm = ref({
  email: '',
  password: '',
})

const signupForm = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  type: 'ENTERPRISE',
})

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

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  ElMessage.info(`Navigating to menu item ${index}`)
}

const handleLogin = async () => {
  loading.value = true
  try {
    // Simulate login - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Login successful!')
    showLoginDialog.value = false
  } catch (error) {
    ElMessage.error('Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  loading.value = true
  try {
    // Simulate signup - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Account created successfully!')
    showSignupDialog.value = false
  } catch (error) {
    ElMessage.error('Signup failed. Please try again.')
  } finally {
    loading.value = false
  }
}

const handleUserMenu = (command: string) => {
  if (command === 'logout') {
    ElMessage.success('Logged out successfully')
  } else if (command === 'profile') {
    ElMessage.info('Profile page coming soon')
  }
}

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// Mock auth state
const isAuthenticated = ref(false)
const user = ref<{ firstName?: string } | null>(null)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.el-header {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  font-weight: 700;
  background: linear-gradient(90deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  font-weight: 500;
}

.main-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-menu .el-menu-item.is-active {
  border-bottom-color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.el-main {
  background-color: transparent;
  padding: 60px 20px;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;
  color: white;
}

.hero-section h2 {
  font-size: 56px;
  margin-bottom: 24px;
  color: white;
  font-weight: 800;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-section p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.cta-buttons .el-button {
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 600;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.card-header .el-icon {
  color: #667eea;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  font-size: 15px;
}

.el-footer {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 24px;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
