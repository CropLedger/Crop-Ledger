<template>
  <div class="profile-page">
    <div class="page-header">
      <div>
        <el-button text @click="router.push('/dashboard')">← Dashboard</el-button>
        <h2>Profile</h2>
      </div>
      <el-button @click="handleLogout">Logout</el-button>
    </div>

    <el-card v-loading="loading" style="max-width: 640px">
      <el-form :model="form" label-width="140px">
        <el-form-item label="Email">
          <el-input :model-value="account?.email" disabled />
        </el-form-item>
        <el-form-item label="Account Type">
          <el-input :model-value="account?.type" disabled />
        </el-form-item>
        <el-form-item label="First Name">
          <el-input v-model="form.firstName" />
        </el-form-item>
        <el-form-item label="Last Name">
          <el-input v-model="form.lastName" />
        </el-form-item>
        <el-form-item label="Phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Stellar Address">
          <el-input v-model="form.stellarAddress" placeholder="G..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">Save Changes</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Account } from '~/types/api'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const { fetchProfile, updateProfile, logout } = useAuth()

const loading = ref(false)
const saving = ref(false)
const account = ref<Account | null>(null)
const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  stellarAddress: '',
})

onMounted(async () => {
  loading.value = true
  try {
    const profile = await fetchProfile()
    account.value = profile
    form.value = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      stellarAddress: profile.stellarAddress || '',
    }
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Failed to load profile'))
  } finally {
    loading.value = false
  }
})

const save = async () => {
  saving.value = true
  try {
    account.value = await updateProfile({
      firstName: form.value.firstName || undefined,
      lastName: form.value.lastName || undefined,
      phone: form.value.phone || undefined,
      stellarAddress: form.value.stellarAddress || undefined,
    })
    ElMessage.success('Profile updated')
  } catch (error) {
    ElMessage.error(apiErrorMessage(error, 'Profile update failed'))
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await logout()
  ElMessage.success('Logged out successfully')
  router.push('/')
}
</script>

<style scoped>
.profile-page {
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
</style>
