import { action, makeAutoObservable } from "mobx";
import { RootStore } from "@stores/Root.store";

export class ProfileStore {
  rootStore;
  isLoading = true;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound switchLoading = (state: boolean): void => {
    this.isLoading = state;
  };
}
