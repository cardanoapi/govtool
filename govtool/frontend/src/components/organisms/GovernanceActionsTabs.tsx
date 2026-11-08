import { Box } from "@mui/material";

import { useCardano, useFeatureFlag } from "@context";
import { PageTabs } from "@molecules";
import { PDF_PATHS } from "@/consts/paths";
import { useGovernanceActionTabs } from "@/hooks/useGovernanceActionTabs";

/** Proposed, Live Voting and Outcomes; Proposed only while the forum is on. */
export const GovernanceActionsTabs = () => {
  const { isEnabled, stakeKey } = useCardano();
  const { isProposalDiscussionForumEnabled } = useFeatureFlag();
  const tabs = useGovernanceActionTabs(Boolean(isEnabled && stakeKey)).filter(
    (tab) =>
      isProposalDiscussionForumEnabled ||
      tab.to !== PDF_PATHS.proposalDiscussion,
  );

  return (
    <Box sx={{ mb: 3 }}>
      <PageTabs tabs={tabs} />
    </Box>
  );
};
