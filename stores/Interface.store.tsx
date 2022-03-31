import { action, makeAutoObservable } from 'mobx'

export class InterfaceStore {
  rootStore
  theme: 'light' | 'dark' = 'dark'

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme
    document.documentElement.className = ''
    document.documentElement.classList.add(`theme-${theme}`)
  }
}
