<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'ادمین', to: '/admin' },
          { label: 'مکانیک‌ها' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">مدیریت مکانیک‌ها</h1>
            <p class="mt-2 text-gray-600">مدیریت QR و اطلاعات مکانیک‌ها</p>
          </div>
          <div class="flex space-x-3 rtl:space-x-reverse">
            <div class="flex flex-col space-y-2">
              <button
                @click="showInviteModal = true"
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                دعوت مکانیک جدید
              </button>
              <div class="text-xs text-gray-500 text-center">
                ارسال لینک برای ثبت‌نام توسط مکانیک
              </div>
            </div>
            <NuxtLink 
              to="/admin"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              بازگشت به هاب
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="نام، تلفن یا کد مکانیک..."
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">شهر</label>
            <input
              v-model="state.filters.city"
              type="text"
              placeholder="شهر..."
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">سطح</label>
            <select
              v-model="state.filters.tier"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">همه</option>
              <option value="BASIC">پایه</option>
              <option value="PRO">حرفه‌ای</option>
              <option value="ELITE">نخبه</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت تعلیق</label>
            <select
              v-model="state.filters.suspended"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">همه</option>
              <option value="false">فعال</option>
              <option value="true">تعلیق شده</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت QR</label>
            <select
              v-model="state.filters.qrActive"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="applyFilters"
              :disabled="loading"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading">در حال بارگذاری...</span>
              <span v-else>اعمال فیلتر</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 6" :key="i" class="bg-white shadow rounded-lg p-6 animate-pulse">
          <div class="flex space-x-4">
            <div class="rounded-full bg-gray-200 h-12 w-12"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-800 text-center">
          <p class="text-lg font-medium mb-2">خطا در بارگذاری</p>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Mechanics List -->
      <div v-else-if="mechanics && mechanics.length > 0" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <dt class="text-sm font-medium text-gray-500">کل مکانیک‌ها</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ totalCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">QR فعال</dt>
              <dd class="mt-1 text-2xl font-semibold text-green-600">{{ activeQrCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">QR غیرفعال</dt>
              <dd class="mt-1 text-2xl font-semibold text-red-600">{{ inactiveQrCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">صفحه فعلی</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ state.page }}</dd>
            </div>
          </div>
        </div>

        <!-- Mechanics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="mechanic in mechanics" 
            :key="mechanic.id" 
            class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="text-sm text-gray-500">نام مکانیک</div>
                <div class="font-semibold text-gray-900">{{ mechanic.fullName || 'نامشخص' }}</div>
              </div>
              <div class="text-left space-y-1">
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    mechanic.qrActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ mechanic.qrActive ? 'QR فعال' : 'QR غیرفعال' }}
                </span>
                <span 
                  v-if="mechanic.suspended"
                  class="block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                >
                  تعلیق شده
                </span>
              </div>
            </div>

            <!-- Phone Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تلفن</div>
              <div class="font-medium text-gray-900">{{ mechanic.phone || 'نامشخص' }}</div>
            </div>

            <!-- City and Tier Row -->
            <div class="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">شهر</div>
                <div class="font-medium text-gray-900">{{ mechanic.city || 'نامشخص' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">سطح</div>
                <div class="font-medium text-gray-900">
                  <span v-if="mechanic.tier === 'BASIC'" class="text-blue-600">پایه</span>
                  <span v-else-if="mechanic.tier === 'PRO'" class="text-green-600">حرفه‌ای</span>
                  <span v-else-if="mechanic.tier === 'ELITE'" class="text-purple-600">نخبه</span>
                  <span v-else class="text-gray-500">نامشخص</span>
                </div>
              </div>
            </div>

            <!-- Code Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">کد QR</div>
              <div class="font-mono text-lg font-semibold text-blue-600">
                {{ mechanic.code || 'ندارد' }}
              </div>
            </div>

            <!-- Specialties Row -->
            <div v-if="mechanic.specialties" class="mb-4">
              <div class="text-sm text-gray-500">تخصص‌ها</div>
              <div class="font-medium text-gray-900 text-sm">{{ mechanic.specialties }}</div>
            </div>

            <!-- Date Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تاریخ ایجاد</div>
              <div class="font-medium text-gray-900">{{ formatDate(mechanic.createdAt) }}</div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <AdminMechanicRowActions
                :mechanic-id="mechanic.id"
                :code="mechanic.code"
                :qr-active="mechanic.qrActive"
                :suspended="mechanic.suspended"
                @success="fetchMechanics"
              />
              <div class="grid grid-cols-2 gap-2">
                <NuxtLink 
                  :to="`/admin/mechanics/${mechanic.id}`"
                  class="inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  جزئیات
                </NuxtLink>
                <button
                  @click="editProfile(mechanic)"
                  class="inline-flex justify-center items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ویرایش
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="hasMorePages" class="flex justify-center space-x-2 rtl:space-x-reverse">
          <button 
            @click="setPage(state.page - 1)"
            :disabled="state.page <= 1"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          <span class="px-4 py-2 text-sm text-gray-700">صفحه {{ state.page }}</span>
          <button 
            @click="setPage(state.page + 1)"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            بعدی
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white shadow rounded-lg p-12 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p class="text-lg mb-2">هیچ مکانیکی یافت نشد</p>
          <p class="text-sm">برای این فیلترها مکانیکی وجود ندارد.</p>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-2">دعوت مکانیک جدید</h3>
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="mr-3">
                <p class="text-sm text-blue-800">
                  لینک دعوت به شماره تلفن ارسال می‌شود و مکانیک خودش ثبت‌نام را تکمیل می‌کند.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Success State -->
          <div v-if="inviteSuccess" class="text-center py-6">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">دعوت با موفقیت ارسال شد!</h3>
            <p class="text-sm text-gray-600 mb-4">{{ inviteSuccessMessage }}</p>
            <div class="space-y-2">
              <button
                @click="goToInvites"
                class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                مشاهده دعوت‌ها
              </button>
              <button
                @click="closeInviteModal"
                class="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                بستن
              </button>
            </div>
          </div>

          <!-- Form State -->
          <form v-else @submit.prevent="createInvite" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">شماره تلفن *</label>
              <input
                v-model="newInvite.phone"
                type="tel"
                placeholder="09123456789"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
              <input
                v-model="newInvite.fullName"
                type="text"
                placeholder="نام و نام خانوادگی"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">شهر</label>
              <input
                v-model="newInvite.city"
                type="text"
                placeholder="شهر"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">تخصص‌ها</label>
              <input
                v-model="newInvite.specialties"
                type="text"
                placeholder="تخصص‌ها (اختیاری)"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                :disabled="creating"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
              >
                <svg v-if="creating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="creating">در حال ارسال...</span>
                <span v-else>ارسال دعوت</span>
              </button>
              <button
                type="button"
                @click="closeInviteModal"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">ویرایش پروفایل مکانیک</h3>
          
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">نام کامل *</label>
              <input
                v-model="editForm.fullName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">شهر</label>
              <input
                v-model="editForm.city"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">سطح</label>
              <select
                v-model="editForm.tier"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">انتخاب کنید</option>
                <option value="BASIC">پایه</option>
                <option value="PRO">حرفه‌ای</option>
                <option value="ELITE">نخبه</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">تخصص‌ها</label>
              <textarea
                v-model="editForm.specialties"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="تخصص‌های مکانیک..."
              ></textarea>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                :disabled="editing"
                class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
              >
                <svg v-if="editing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="editing">در حال ذخیره...</span>
                <span v-else>ذخیره تغییرات</span>
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

const { user } = useAuth()
const { show: showToast } = useToast()

// State
const showInviteModal = ref(false)
const creating = ref(false)
const inviteSuccess = ref(false)
const inviteSuccessMessage = ref('')

// Edit profile modal
const showEditModal = ref(false)
const editing = ref(false)
const editingMechanic = ref<any>(null)
const editForm = ref({
  fullName: '',
  city: '',
  tier: '',
  specialties: ''
})

const newInvite = ref({
  phone: '',
  fullName: '',
  city: '',
  specialties: ''
})

// Search and pagination state
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const mechanics = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters state
const state = ref({
  filters: {
    city: '',
    tier: '',
    suspended: '',
    qrActive: ''
  },
  page: 1,
  pageSize: 20
})

// API
const api = useApi()

// Fetch mechanics function
const fetchMechanics = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (state.value.filters.city) params.append('city', state.value.filters.city)
    if (state.value.filters.tier) params.append('tier', state.value.filters.tier)
    if (state.value.filters.suspended) params.append('suspended', state.value.filters.suspended)
    if (state.value.filters.qrActive) params.append('qrActive', state.value.filters.qrActive)
    params.append('page', state.value.page.toString())
    params.append('pageSize', state.value.pageSize.toString())
    
    const response = await api.get(`/api/admin/mechanics?${params.toString()}`)
    
    if (response && response.ok) {
      mechanics.value = response.items || []
      totalCount.value = response.pagination?.totalCount || 0
    } else {
      error.value = 'پاسخ نامعتبر از سرور'
    }
  } catch (err: any) {
    error.value = err.data?.message || err.statusMessage || err.message || 'خطا در بارگذاری مکانیک‌ها'
  } finally {
    loading.value = false
  }
}

// Apply filters function
const applyFilters = async () => {
  state.value.page = 1
  await fetchMechanics()
}

// Set page function
const setPage = (page: number) => {
  state.value.page = page
  fetchMechanics()
}

// Set filters function
const setFilters = (filters: Record<string, any>) => {
  Object.assign(state.value.filters, filters)
}

// Computed values for mechanics data
const hasMorePages = computed(() => (mechanics.value || []).length === state.value.pageSize)

// Computed
const activeQrCount = computed(() => 
  mechanics.value.filter((m: any) => m.qrActive).length
)

const inactiveQrCount = computed(() => 
  mechanics.value.filter((m: any) => !m.qrActive).length
)


// Methods

// Invite methods
async function createInvite() {
  creating.value = true
  try {
    const { post } = useApi()
    const response = await post('/api/admin/invites', {
      role: 'MECHANIC',
      ...newInvite.value
    })
    
    if (response.ok) {
      // Show success state in modal
      inviteSuccessMessage.value = 'لینک دعوت به شماره تلفن ارسال شد'
      if (response.data?.link) {
        inviteSuccessMessage.value += `\nلینک: ${response.data.link}`
      }
      inviteSuccess.value = true
      
      // Show toast notification
      showToast('دعوت با موفقیت ارسال شد!', 'success')
      
      // Refresh mechanics list
      await fetchMechanics()
    }
  } catch (error: any) {
    const errorMessage = error.data?.message || error.statusMessage || 'خطا در ارسال دعوت'
    showToast('خطا: ' + errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

function closeInviteModal() {
  showInviteModal.value = false
  inviteSuccess.value = false
  inviteSuccessMessage.value = ''
  newInvite.value = {
    phone: '',
    fullName: '',
    city: '',
    specialties: ''
  }
}

function goToInvites() {
  navigateTo('/admin/invites')
}

// Edit profile methods
function editProfile(mechanic: any) {
  editingMechanic.value = mechanic
  editForm.value = {
    fullName: mechanic.fullName || '',
    city: mechanic.city || '',
    tier: mechanic.tier || '',
    specialties: mechanic.specialties || ''
  }
  showEditModal.value = true
}

async function saveProfile() {
  if (!editingMechanic.value) return
  
  editing.value = true
  try {
    const { patch } = useApi()
    const response = await patch(`/api/admin/mechanics/${(editingMechanic.value as any).id}/profile`, editForm.value)
    
    if (response.ok) {
      showToast('پروفایل با موفقیت به‌روزرسانی شد', 'success')
      showEditModal.value = false
      await fetchMechanics()
    }
  } catch (error: any) {
    const errorMessage = error.data?.message || error.statusMessage || 'خطا در به‌روزرسانی پروفایل'
    showToast('خطا: ' + errorMessage, 'error')
  } finally {
    editing.value = false
  }
}

function closeEditModal() {
  showEditModal.value = false
  editingMechanic.value = null
  editForm.value = {
    fullName: '',
    city: '',
    tier: '',
    specialties: ''
  }
}

// Date utilities
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

// Initial fetch on mount
onMounted(() => {
  fetchMechanics()
})
</script>
