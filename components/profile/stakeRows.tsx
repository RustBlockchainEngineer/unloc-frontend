import { useSolanaUnixTime } from "@hooks/useSolanaUnixTime";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { bignum } from "@metaplex-foundation/beet";
import { PublicKey } from "@solana/web3.js";
import { numVal, val } from "@utils/bignum";
import { StakeRow, StakeStatus } from "./stakeAccount/stakeRow";

export type StakeRowType = {
  address: PublicKey;
  amount: bignum;
  APR: number;
  status: StakeStatus;
  startDate: Date;
  endDate: Date;
};

export const StakeRows = () => {
  const { accounts } = useStakingAccounts();
  const time = useSolanaUnixTime();

  const rows = accounts?.reduce<StakeRowType[]>((rows, { info, address, assigned }) => {
    if (assigned && info) {
      const endTimestamp = val(info.lastStakeTime).add(val(info.lockDuration));
      const status: StakeStatus = val(info.lastStakeTime)
        .add(endTimestamp)
        .gten(time ?? 0)
        ? "unlocked"
        : "locked";

      const newRow: StakeRowType = {
        address: address,
        amount: info.amount,
        APR: 40,
        status,
        startDate: new Date(numVal(info.lastStakeTime) * 1000),
        endDate: new Date(numVal(endTimestamp) * 1000),
      };
      return [...rows, newRow];
    }
    return rows;
  }, []);

  return (
    <div className="profile__stake-accounts">
      {rows?.map((row, i) => (
        <StakeRow key={row.address.toString()} id={i + 1} {...row} />
      ))}
    </div>
  );
};
