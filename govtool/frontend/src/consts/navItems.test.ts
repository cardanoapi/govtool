import { describe, expect, it } from "vitest";

import { shouldDisplayNavItem } from "./navItems";

describe("shouldDisplayNavItem", () => {
  it("hides budget discussion when proposal discussion is disabled", () => {
    expect(
      shouldDisplayNavItem("budget-discussion-link", {
        isProposalDiscussionForumEnabled: false,
        isGovernanceOutcomesPillarEnabled: true,
      }),
    ).toBe(false);
  });

  it("hides proposal discussion entries when proposal discussion is disabled", () => {
    expect(
      shouldDisplayNavItem("proposal-discussion-link", {
        isProposalDiscussionForumEnabled: false,
        isGovernanceOutcomesPillarEnabled: true,
      }),
    ).toBe(false);

    expect(
      shouldDisplayNavItem("proposed-governance-actions-link", {
        isProposalDiscussionForumEnabled: false,
        isGovernanceOutcomesPillarEnabled: true,
      }),
    ).toBe(false);
  });

  it("keeps unrelated items visible when feature flags are disabled", () => {
    expect(
      shouldDisplayNavItem("dashboard-link", {
        isProposalDiscussionForumEnabled: false,
        isGovernanceOutcomesPillarEnabled: false,
      }),
    ).toBe(true);
  });
});
