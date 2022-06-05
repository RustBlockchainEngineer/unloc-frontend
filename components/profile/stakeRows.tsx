import { PublicKey } from "@solana/web3.js";
import { StakeRow, stakeStatus } from "./stakeAccount/stakeRow";

export const StakeRows = () => {
  const rows: {
    address: PublicKey;
    amount: number;
    uiAmount: string;
    APR: number;
    status: stakeStatus;
    startDate?: Date;
    endDate?: Date;
  }[] = [
    {
      address: new PublicKey("Le1PGWq1Hgdx1tKoDuWfaJa5etjaXVyXhAXLwCT8U4B"),
      amount: 3685,
      uiAmount: "3685.00",
      APR: 40,
      status: "locked",
    },
    {
      address: new PublicKey("86J52egGfkzDmByk961appyevaJ5BqaATXzKMRXCPyZJ"),
      amount: 3685,
      uiAmount: "3685.00",
      APR: 40,
      status: "unlocked",
      startDate: new Date("2022-4-20"),
      endDate: new Date("2022-7-14"),
    },
  ];

  return (
    <div className="profile__stake-accounts">
      {rows.map((row, i) => (
        <StakeRow key={row.address.toString()} id={i + 1} {...row} />
      ))}
    </div>
  );
};
