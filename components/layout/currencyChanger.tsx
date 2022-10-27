import { SwitchButton } from "./switchButton";

interface CurrencyChangerInterface {
  state: boolean;
  onClick: (state: boolean) => void;
}

export const CurrencyChanger = ({ state, onClick }: CurrencyChangerInterface): JSX.Element => {
  return (
    <div className={"currency--changer"}>
      <div className={"currency--changer--wrapper"}>
        <i className={`icon icon--sm icon--currency--SOL ${state ? "active" : ""}`} />
        <SwitchButton state={state} onClick={onClick} />
        <i className={`icon icon--sm icon--currency--USDC ${state ? "" : "active"}`} />
      </div>
    </div>
  );
};
