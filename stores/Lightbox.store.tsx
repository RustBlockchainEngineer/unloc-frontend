import { action, makeAutoObservable } from 'mobx'

type LightboxContent = 'loanCreate' | 'loanUpdate' | 'collateral' | 'processing'
export class LightboxStore {
  rootStore
  visible: boolean = false
  content: LightboxContent = 'collateral'
  canClose: boolean = true

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound setVisible(visible: boolean) {
    this.visible = visible
  }

  @action.bound setContent(content: LightboxContent) {
    this.content = content
  }

  @action.bound setCanClose(canClose: boolean) {
    this.canClose = canClose
  }
}
