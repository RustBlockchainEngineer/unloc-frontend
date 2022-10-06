import { useSolanaUnixTime } from "@hooks/useSolanaUnixTime";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { bignum } from "@metaplex-foundation/beet";
import { PublicKey } from "@solana/web3.js";
import { val } from "@utils/bignum";
import { StakeRow, StakeStatus } from "./stakeAccount/stakeRow";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export type StakeRowType = {
  address: PublicKey;
  amount: bignum;
  APY: number;
  status: StakeStatus;
  startUnix: bignum;
  endUnix: bignum;
};

export const StakeRows = () => {
  const { accounts } = useStakingAccounts();
  const time = useSolanaUnixTime();
  const [parent] = useAutoAnimate<HTMLUListElement>();

  const rows = accounts?.reduce<StakeRowType[]>((rows, { info, address, assigned }) => {
    if (assigned && info) {
      const endTimestamp = val(info.lastStakeTime).add(val(info.lockDuration));
      const status: StakeStatus = val(info.lastStakeTime)
        .add(endTimestamp)
        .gten(time ?? 0)
        ? "locked"
        : "unlocked";

      const newRow: StakeRowType = {
        address: address,
        amount: info.amount,
        APY: 40,
        status,
        startUnix: info.lastStakeTime,
        endUnix: val(info.lastStakeTime).add(val(info.lockDuration)),
      };
      return [...rows, newRow];
    }
    return rows;
  }, []);

  return (
    <ul role="list" ref={parent} className="profile__stake-accounts">
      {rows?.map((row, i) => (
        <StakeRow key={row.address.toBase58()} id={i + 1} {...row} />
      ))}
    </ul>
  );
};
