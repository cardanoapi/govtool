import { useQuery } from "react-query";

import { QUERY_KEYS } from "@consts";
import { useCardano } from "@context";
import { getProposals, GetProposalsArguments } from "@services";
import { useGetVoterInfo } from ".";

export const useGetProposalsQuery = ({
  filters = [],
  searchPhrase,
  sorting,
}: GetProposalsArguments) => {
  const { dRepID, pendingTransaction } = useCardano();
  const { voter } = useGetVoterInfo();

  const fetchProposals = async (): Promise<ActionType[]> => {
    const allProposals = await Promise.all(
      filters.map((filter) =>
        getProposals({
          dRepID:
            voter?.isRegisteredAsDRep || voter?.isRegisteredAsSoleVoter
              ? dRepID
              : undefined,
          filters: [filter],
          searchPhrase,
          sorting,
        }),
      ),
    );

    return allProposals.flatMap((proposal) => proposal.elements);
  };

  const { data, isLoading } = useQuery(
    [
      QUERY_KEYS.useGetProposalsKey,
      filters,
      searchPhrase,
      sorting,
      dRepID,
      pendingTransaction.vote?.transactionHash,
    ],
    fetchProposals,
  );

  const proposals = Object.values(groupByType(data) ?? []);

  return {
    isProposalsLoading: isLoading,
    proposals,
  };
};

const groupByType = (data?: ActionType[]) =>
  data?.reduce<Record<string, ArrayElement<ToVoteDataType>>>((groups, item) => {
    const itemType = item.type;

    if (!groups[itemType]) {
      groups[itemType] = {
        title: itemType,
        actions: [],
      };
    }
    groups[itemType].actions.push(item);

    return groups;
  }, {});
