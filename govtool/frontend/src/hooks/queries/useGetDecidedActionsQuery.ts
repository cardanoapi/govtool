import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@consts";
import { getGovernanceActionHistory } from "@services";

const DECIDED_STATUSES = ["ratified", "enacted", "expired"];

/** The most recently concluded governance actions: ratified, enacted or expired. */
export const useGetDecidedActionsQuery = (limit = 20) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.useGetDecidedActionsKey, limit],
    queryFn: () =>
      getGovernanceActionHistory("", DECIDED_STATUSES, "newestFirst", 1, limit),
  });

  return {
    decidedActions: data ?? [],
    areDecidedActionsLoading: isLoading,
  };
};
