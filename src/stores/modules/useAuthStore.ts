import { defineStore } from 'pinia'
import { clearAuthToken, getApiBaseUrl, getAuthToken, setApiBaseUrl, setAuthToken } from '@/api/client'
import type { AuthUserProfile, LoginResponse, MeResponse, PromptSettings } from '@/api/types'

type AuthUser = AuthUserProfile

function makeMockPromptSettings(userId: number): PromptSettings {
  return {
    user_id: userId,
    md_prompt_customization: '',
    md_prompt_ai_generated: null,
    updated_at: new Date().toISOString(),
  }
}

function makeMockLoginResponse(username: string, displayName?: string): LoginResponse {
  const cleanUsername = String(username || '').trim() || 'user'
  const now = new Date().toISOString()
  const user: AuthUserProfile = {
    id: 1,
    username: cleanUsername,
    display_name: String(displayName || '').trim() || cleanUsername,
    role: 'user',
    chat_quota_total: 1000000,
    chat_quota_used: 0,
    chat_quota_remaining: 1000000,
    is_active: 1,
    created_at: now,
    updated_at: now,
  }
  return {
    token: `local-mock-token-${Date.now()}`,
    token_type: 'Bearer',
    user,
    prompt_settings: makeMockPromptSettings(user.id),
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAuthToken(),
    apiBaseUrl: getApiBaseUrl(),
    user: null as AuthUser | null,
    promptSettings: null as PromptSettings | null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    setApiBaseUrlValue(url: string) {
      this.apiBaseUrl = (url || '').trim()
      setApiBaseUrl(this.apiBaseUrl)
    },
    async login(username: string, password: string) {
      this.loading = true
      try {
        void password
        const res = makeMockLoginResponse(username)
        this.applyLoginResponse(res)
        return res
      } finally {
        this.loading = false
      }
    },
    async register(username: string, password: string, displayName = '') {
      this.loading = true
      try {
        void password
        const res = makeMockLoginResponse(username, displayName)
        this.applyLoginResponse(res)
        return res
      } finally {
        this.loading = false
      }
    },
    applyLoginResponse(res: LoginResponse) {
      this.token = res.token
      setAuthToken(res.token)
      this.user = res.user
      this.promptSettings = res.prompt_settings
    },
    async fetchMe() {
      const user = this.user || makeMockLoginResponse('user').user
      const res: MeResponse = {
        user,
        prompt_settings: this.promptSettings || makeMockPromptSettings(user.id || 1),
      }
      this.applyMeResponse(res)
      return res
    },
    applyMeResponse(res: MeResponse) {
      this.user = res.user
      this.promptSettings = res.prompt_settings
    },
    logout() {
      this.token = ''
      this.user = null
      this.promptSettings = null
      clearAuthToken()
    },
  },
  persist: {
    pick: ['token', 'user', 'promptSettings', 'apiBaseUrl'],
  },
})
