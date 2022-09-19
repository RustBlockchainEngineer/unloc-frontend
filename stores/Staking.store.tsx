import { makeAutoObservable } from "mobx";
import { RootStore } from "./Root.store";

type CreateFormInputs = {
  lockDuration: number;
  amount: string;
};

const createFormInitialValues = {
  amount: "",
  lockDuration: 0,
};

export class StakingStore {
  rootStore;
  createFormInputs: CreateFormInputs = createFormInitialValues;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setCreateFormInput = (input: "lockDuration" | "amount", value: number | string) => {
    this.createFormInputs = { ...this.createFormInputs, [input]: value };
  };

  resetCreateFormInputs = () => {
    this.createFormInputs = createFormInitialValues;
  };
}
