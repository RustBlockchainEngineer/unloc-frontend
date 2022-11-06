import dayjs, { unix } from "dayjs";

import { CircleLoader } from "@components/layout/circleLoader";
import { useCollectionsInfo } from "@hooks/useCollectionsInfo";
import { useUserVoteChoices } from "@hooks/useUserVoteChoices";
import { useVotingSession } from "@hooks/useVotingSession";
import { numVal } from "@utils/bignum";
import { stripNulChars } from "@utils/common";

export const VoteChoices = () => {
  const { data: voteSessionData } = useVotingSession();
  const { voteChoiceData } = useUserVoteChoices();
  const { nameMap } = useCollectionsInfo();

  if (!voteChoiceData || !nameMap || !voteSessionData)
    return (
      <div className="tw-max-w-[92%] sm:tw-max-w-3xl">
        <CircleLoader size="large" />
      </div>
    );

  const relativeTimeOfVote = dayjs().to(unix(numVal(voteChoiceData.lastVotedAt)));
  const sortedVoteList = voteChoiceData.voteChoices
    .map((choice) => {
      const collection =
        voteSessionData.projects.projects[choice.projectId].collectionNft.toBase58();

      const { name, symbol } = nameMap[collection];
      return { collection, name, symbol, votes: numVal(choice.votes) };
    })
    .filter((project) => project.votes > 0)
    .sort((a, b) => b.votes - a.votes);

  const voteSum = sortedVoteList.reduce((sum, project) => (sum += project.votes), 0);

  return (
    <div className="tw-max-w-[92%] sm:tw-max-w-3xl">
      <div className="tw-mb-4">
        <h3 className="tw-font-bold dark:tw-text-white tw-text-[210d48] dark:tw-drop-shadow-sm tw-text-4xl">
          Your Vote
        </h3>
        <p className="tw-mt-2 tw-font-light tw-text-[#a07ce4]">
          You last voted {relativeTimeOfVote}, see how you distributed your vote.
        </p>
      </div>

      {/* List of vote bars */}
      <div className="tw-mt-8">
        <ul role="list" className="tw-list-none tw-w-full tw-flex tw-flex-col tw-gap-y-4">
          {sortedVoteList.map((project, idx) => (
            <li
              className={`tw-list-none tw-w-full tw-pb-3 tw-border-solid tw-border-0 ${
                idx !== sortedVoteList.length - 1 ? "tw-border-b" : ""
              } tw-border-[#a07ce4]`}
              key={project.collection}>
              <div className="tw-grid tw-grid-cols-3 tw-gap-x-2 tw-items-center">
                <div className="">
                  <div className="tw-font-bold tw-truncate">
                    {stripCollectionNameSuffix(project.name)}
                  </div>
                  <div className="tw-text-[#a07ce4] tw-text-sm tw-tracking-wider">
                    {project.symbol}
                  </div>
                </div>
                <div className="tw-col-span-2">
                  <div className="tw-relative tw-rounded-full tw-w-full tw-h-6 tw-border-solid tw-border tw-border-[#a07ce4] tw-bg-[#a07ce4] tw-overflow-hidden">
                    <div
                      className="tw-inline-flex tw-items-center tw-bg-primary tw-h-full tw-rounded-full"
                      style={{ width: `${((project.votes / voteSum) * 100).toFixed(0)}%` }}>
                      <span className="tw-text-sm tw-absolute tw-left-1/2 -tw-translate-x-1/2">
                        {((project.votes / voteSum) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Crab Collection = 16 chars
function stripCollectionNameSuffix(name: string) {
  name = stripNulChars(name);
  return name.length < 16 ? name : name.split("Collection")[0];
}
