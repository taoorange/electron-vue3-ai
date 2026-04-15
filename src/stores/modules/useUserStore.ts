import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '游客',
    personalizedSignature: '未登录',
  }),
  actions: {
    cleanUserInfo() {
      this.userName = '游客'
      this.personalizedSignature = '未登录'
    },
  },
  persist: true,
})

