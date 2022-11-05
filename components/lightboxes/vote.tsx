import { useMemo, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { VoteChoice, VoteSessionInfo } from "@unloc-dev/unloc-sdk-voting";
import { createForm } from "final-form";
import createDecorator from "final-form-calculate";
import { Form, Field } from "react-final-form";
import { toast } from "react-toastify";

import { CircleLoader } from "@components/layout/circleLoader";
import { useCollectionsInfo } from "@hooks/useCollectionsInfo";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStore } from "@hooks/useStore";
import { useUserScore } from "@hooks/useUserScore";
import { useVotingSession } from "@hooks/useVotingSession";
import { stripNulChars } from "@utils/common";
import { refreshUserScore, STAKING_PID } from "@utils/spl/unloc-staking";
import { voteCollections, VOTING_PID } from "@utils/spl/unloc-voting";
import { errorCase } from "@utils/toast-error-handler";

import { SliderAdapter } from "./Loan/sliderAdapter";

const mapDataToInitialValues = (
  voteData: VoteSessionInfo,
  nameMap: Record<
    string,
    {
      name: string;
      symbol: string;
    }
  >,
) => {
  const activeProjects = voteData.projects.projects.filter(({ active }) => active);

  const initialValues = activeProjects.map((projectData) => {
    const { collectionNft, id } = projectData;
    const { name, symbol } = nameMap[collectionNft.toBase58()];
    return {
      id,
      name,
      symbol,
      collectionNft,
    };
  });

  return initialValues;
};

export const Vote = () => {
  const { score } = useUserScore();
  const { nameMap } = useCollectionsInfo();
  const { data } = useVotingSession();

  if (!score || !nameMap || !data)
    return (
      <div style={{ maxWidth: 256 }}>
        <CircleLoader size="large" />
      </div>
    );

  const initialValues = mapDataToInitialValues(data, nameMap);

  return <DumbVote initialVoteValues={initialValues} totalScore={score.toNumber()} />;
};

export const DumbVote = ({
  initialVoteValues,
  totalScore,
}: {
  initialVoteValues: Array<{
    id: number;
    name: string;
    symbol: string;
    collectionNft: PublicKey;
  }>;
  totalScore: number;
}) => {
  const { publicKey } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const { Lightbox } = useStore();
  const totalSum = 10000;

  const initialValues = initialVoteValues.reduce((obj, value, idx) => {
    obj[stripNulChars(value.symbol)] = idx === 0 ? 10000 : 0;
    return obj;
  }, {});
  const [nextVoteValues] = useState<any>(initialValues);

  // these are used for realtime updates of sliders
  let currentValues: any = initialValues;
  let startedValues: any = initialValues;
  let startedName: string = "";

  const handleVote = async (values: any): Promise<void> => {
    if (!publicKey) {
      toast.error("Connect your wallet");
      return;
    }
    const voteChoices: VoteChoice[] = Object.keys(values).map((collectionSymbol) => {
      // This is dangerous,
      // the code needs to be refactored somehow to not rely on matching symbols
      const collectionInfo = initialVoteValues.find((info) =>
        info.symbol.includes(collectionSymbol),
      );
      if (!collectionInfo) throw Error(`Couldn't find collection with symbol: ${collectionSymbol}`);

      return {
        projectId: collectionInfo.id,
        votes: (totalScore * values[collectionSymbol]) / 10000,
      };
    });

    console.log({ totalScore });
    console.log({ sum: voteChoices.reduce((sum, choice) => (sum += choice.votes as number), 0) });

    const ix1 = refreshUserScore(publicKey, STAKING_PID);
    const ix2 = (await voteCollections(publicKey, voteChoices, STAKING_PID, VOTING_PID))
      .instructions;

    const tx = new Transaction().add(ix1, ...ix2);
    try {
      Lightbox.setContent("circleProcessing");
      Lightbox.setVisible(true);
      const { result } = await sendAndConfirm(tx);
      if (result.value.err) {
        console.log(result.value.err);
        throw Error("Voting failed");
      }
      toast.success("Voting succeeded!");
    } catch (error) {
      console.log({ error });
      errorCase(error);
    } finally {
      Lightbox.setVisible(false);
    }
  };

  const [memoForm] = useMemo(() => {
    const form = createForm({
      onSubmit: handleVote,
      initialValues,
    });

    // const balancer = createDecorator<typeof initialValues>({
    const balancer = createDecorator({
      field: Object.keys(nextVoteValues),
      updates: (value, name, allValues, prevValues) => {
        // If our field is not active, it means it was not changed by the user.
        // Return without changes, because if we change here we will get infinite recursion.
        if (!allValues || !prevValues || allValues === prevValues || currentValues[name] === value)
          return {};

        if (startedName !== name) {
          startedName = name;
          startedValues = allValues;
        }
        // Omit the field that has been changed by the user
        // @ts-expect-error
        const { [name]: ommited } = allValues;
        const { [name]: startedOmmited, ...rest } = startedValues;
        // total difference to add with rest fields
        const totalRest = totalSum - ommited;
        let totalPrevRest = 0;
        const restLen = Object.keys(rest).length;
        Object.keys(rest).forEach((key) => {
          totalPrevRest += rest[key] as number;
        });
        // if prev status is 100 0 0 ... , all rest fields need to be updated.
        // delta sum is for calculation difference.
        let remainedRest = totalRest;
        let remainedPrevRest = totalPrevRest;
        let updatedCount = 0;
        Object.keys(rest).forEach((key) => {
          if (rest[key] === 0 && totalPrevRest > 0) return;
          let delta = 0;
          if (totalPrevRest === 0) delta = Math.floor(remainedRest / (restLen - updatedCount));
          else
            delta = Math.floor(
              remainedPrevRest > rest[key]
                ? (remainedRest * rest[key]) / remainedPrevRest
                : remainedRest,
            );

          remainedPrevRest -= rest[key];
          rest[key] = delta;
          remainedRest -= delta;
          updatedCount++;
        });

        currentValues = { [name]: ommited, ...rest };

        Object.keys(currentValues).forEach((key) => {
          if (currentValues[key] === 0 && startedValues[key] > 0) startedValues = currentValues;
        });
        return rest;
      },
    });

    const unsubscribe = balancer(form);
    return [form, unsubscribe] as const;
  }, []);

  return (
    <div className="vote-lightbox">
      <h2>Vote for collection</h2>
      <div className="vote-lightbox__form">
        <div className="vote-lightbox__form">
          <Form
            className="create-offer-container"
            onSubmit={handleVote}
            form={memoForm}
            render={({ handleSubmit, submitting, values }) => (
              <form onSubmit={handleSubmit}>
                {Object.keys(initialValues).map((key) => {
                  return (
                    <div key={key} className="input-row">
                      <div className="input-row__title">{key}</div>
                      <Field<number>
                        name={key}
                        min={0}
                        max={10000}
                        // step={1}
                        component={SliderAdapter}
                      />
                      <div className="input-row__value">{values[key] / 100}%</div>
                    </div>
                  );
                })}
                <div>
                  Total:{" "}
                  {Object.keys(values).reduce((acc, key) => (acc += values[key] as number), 0) /
                    100}
                  <pre>{JSON.stringify(values, null, 2)}</pre>
                </div>
                <button type="submit" className="btn btn--md btn--primary" disabled={submitting}>
                  Vote
                </button>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  );
};
