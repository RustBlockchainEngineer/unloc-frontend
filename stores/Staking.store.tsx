import { makeAutoObservable } from "mobx";

import { RootStore } from "./Root.store";

interface CreateFormInputs {
  lockDuration: number;
  uiAmount: string;
}

const createFormInitialValues = {
  uiAmount: "",
  lockDuration: 0,
};

interface AccountToMerge {
  index: number;
  lockDuration: number;
  amount: number;
}

const accountToMergeInitialValues = {
  index: 0,
  lockDuration: 0,
  amount: 0,
};

export class StakingStore {
  rootStore;
  createFormInputs: CreateFormInputs = createFormInitialValues;
  accountToMerge: AccountToMerge = accountToMergeInitialValues;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setCreateFormInput = (input: keyof CreateFormInputs, value: number | string): void => {
    this.createFormInputs = { ...this.createFormInputs, [input]: value };
  };

  resetCreateFormInputs = (): void => {
    this.createFormInputs = createFormInitialValues;
  };

  setAccountToMerge = (index: number, lockDuration: number, amount: number): void => {
    this.accountToMerge = { index, lockDuration, amount };
  };
}
