import { Box } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@atoms";
import { PATHS, QUERY_KEYS } from "@consts";
import { useGetLiveProposalsQuery, useTranslation } from "@hooks";
import type {
  GovernanceActionRecord,
  GovernanceActionVoteAggregate,
  ProposalData,
} from "@models";
import { getGovernanceActionRecord } from "@services";
import {
  correctAdaFormatWithSuffix,
  getProposalTypeLabel,
  toGovernanceActionId,
} from "@utils";
import { ds, FONT_FAMILY, RADIUS } from "@/consts/designTokens";

import { timeLeft, treasuryTotal, voteBar } from "./homeFormat";
import { DisplayHeading, Eyebrow, HomeColumn } from "./homeParts";

const ROLES: GovernanceActionVoteAggregate["role"][] = ["drep", "spo", "cc"];
const ROLE_LABELS = { drep: "DRep", spo: "SPO", cc: "CC" };

const mono = {
  fontFamily: FONT_FAMILY.mono,
  fontSize: 12,
  lineHeight: "16px",
};

const Dot = ({ color }: { color: string }) => (
  <Box component="span" sx={{ backgroundColor: color, borderRadius: "2px", display: "inline-block", height: 8, width: 8 }} />
);

const VoteRow = ({
  role,
  aggregate,
}: {
  role: GovernanceActionVoteAggregate["role"];
  aggregate?: GovernanceActionVoteAggregate;
}) => {
  const { t } = useTranslation();
  const bar = aggregate ? voteBar(aggregate) : undefined;

  return (
    <Box data-testid={`pulse-${role}-row`} sx={{ alignItems: "center", display: "grid", gap: 1.5, gridTemplateColumns: "36px 1fr auto" }}>
      <Box component="span" sx={{ ...mono, color: ds.gray["600"] }}>
        {ROLE_LABELS[role]}
      </Box>
      <Box
        sx={{
          backgroundColor: ds.gray["100"],
          backgroundImage: aggregate
            ? "none"
            : `repeating-linear-gradient(135deg, ${ds.gray["200"]} 0 2px, transparent 2px 4px)`,
          borderRadius: "3px",
          height: 6,
          position: "relative",
        }}
      >
        {bar && (
          <>
            <Box sx={{ backgroundColor: ds.success["600"], borderRadius: "3px 0 0 3px", height: "100%", left: 0, position: "absolute", width: `${bar.yesPercent}%` }} />
            <Box sx={{ backgroundColor: ds.error["600"], height: "100%", left: `${bar.yesPercent}%`, position: "absolute", width: `${bar.votedNoPercent}%` }} />
            <Box aria-hidden sx={{ backgroundColor: ds.gray["500"], height: 12, left: `${bar.thresholdPercent}%`, position: "absolute", top: -3, width: "2px" }} />
          </>
        )}
      </Box>
      <Box component="span" sx={{ ...mono, color: ds.gray["500"], minWidth: 104, textAlign: "right", whiteSpace: "nowrap" }}>
        {!aggregate && t("landing.pulse.notEligible").toUpperCase()}
        {aggregate && !bar && "—"}
        {bar && (
          <>
            <Box component="span" sx={{ fontWeight: 600 }}>{`${bar.yesPercent.toFixed(1)}%`}</Box>
            <Box component="span" sx={{ color: ds.gray["900"] }}>{` / ${bar.thresholdPercent.toFixed(1)}%`}</Box>
          </>
        )}
      </Box>
    </Box>
  );
};

const voteCount = (proposal: ProposalData) => {
  const p = proposal as ProposalData & Record<string, number | undefined>;
  return [
    "dRepYesVotes",
    "dRepNoVotes",
    "dRepAbstainVotes",
    "poolYesVotes",
    "poolNoVotes",
    "poolAbstainVotes",
    "ccYesVotes",
    "ccNoVotes",
    "ccAbstainVotes",
  ].reduce((sum, key) => sum + (typeof p[key] === "number" ? (p[key] as number) : 0), 0);
};

const PulseRow = ({
  proposal,
  record,
}: {
  proposal: ProposalData;
  record?: GovernanceActionRecord;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const amount = treasuryTotal(proposal.details);
  const left = timeLeft(proposal.expiryDate);
  const meta = [
    amount !== undefined ? `₳ ${correctAdaFormatWithSuffix(amount)}` : undefined,
    formatDistanceToNow(new Date(proposal.createdDate), { addSuffix: true }),
    t("landing.pulse.epoch", { epoch: proposal.createdEpochNo }),
  ].filter(Boolean);

  return (
    <Box
      data-testid="pulse-row"
      sx={{
        borderBottom: `1px solid ${ds.gray["200"]}`,
        display: "grid",
        gap: { xxs: 2, md: 4 },
        gridTemplateColumns: { xxs: "1fr", md: "1fr 370px" },
        px: { md: 2 },
        py: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box component="span" sx={{ alignItems: "center", backgroundColor: ds.primary["50"], borderRadius: `${RADIUS.xs}px`, color: ds.primary["600"], display: "inline-flex", fontSize: 12, fontWeight: 500, gap: 0.5, lineHeight: "18px", px: 0.75 }}>
          <Box component="span" sx={{ backgroundColor: ds.primary["600"], borderRadius: "50%", height: 4, width: 4 }} />
          {getProposalTypeLabel(proposal.type)}
        </Box>
        <Box
          component="button"
          onClick={() => navigate(PATHS.governanceActionsAction.replace(":proposalId", proposal.id))}
          type="button"
          sx={{ background: "none", border: "none", color: ds.gray["900"], cursor: "pointer", display: "block", fontFamily: "inherit", fontSize: 16, fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "24px", mt: 1, p: 0, textAlign: "left", "&:hover": { color: ds.primary["600"] } }}
        >
          {proposal.title ?? t("landing.pulse.untitled")}
        </Box>
        <Box sx={{ alignItems: "center", color: ds.gray["500"], display: "flex", flexWrap: "wrap", fontSize: 12, fontWeight: 500, gap: 0.75, lineHeight: "18px", mt: 0.5 }}>
          {meta.map((item, index) => (
            <Box key={item} component="span" sx={{ color: index === 0 && amount !== undefined ? ds.gray["900"] : undefined, fontWeight: index === 0 && amount !== undefined ? 600 : 500 }}>
              {index ? "· " : ""}
              {item}
            </Box>
          ))}
          {left && (
            <Box component="span" sx={{ color: ds.error["600"] }}>
              {`· ● ${t("landing.pulse.left", { time: left })}`}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {ROLES.map((role) => (
          <VoteRow
            key={role}
            aggregate={record?.vote_aggregates?.find((aggregate) => aggregate.role === role)}
            role={role}
          />
        ))}
        <Box sx={{ ...mono, alignItems: "center", color: ds.gray["600"], display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Box component="span" sx={{ color: ds.gray["900"], fontWeight: 500 }}>
            {t("landing.pulse.votes", { count: voteCount(proposal) })}
          </Box>
          <span>·</span>
          <Dot color={ds.success["600"]} />
          {t("landing.pulse.yes")}
          <Dot color={ds.error["600"]} />
          {t("landing.pulse.no")}
          <Box component="span" sx={{ borderLeft: `1px solid ${ds.gray["300"]}`, pl: 1 }}>
            {t("landing.pulse.threshold")}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/** The three newest actions open for voting, with each role's tally. */
export const HomePulse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { liveProposals, areLiveProposalsLoading } = useGetLiveProposalsQuery();
  const shown = liveProposals.slice(0, 3);
  const records = useQueries({
    queries: shown.map((proposal) => {
      const actionId = toGovernanceActionId(`${proposal.txHash}#${proposal.index}`);
      return {
        queryKey: [QUERY_KEYS.useGetGovernanceActionRecordKey, actionId],
        queryFn: () => getGovernanceActionRecord(actionId),
      };
    }),
  });

  return (
    <Box component="section" sx={{ backgroundColor: "#FCFCFA", py: { xxs: 6, md: 10 } }}>
      <HomeColumn>
        <Box sx={{ alignItems: { md: "flex-end" }, display: "flex", flexDirection: { xxs: "column", md: "row" }, gap: 2, justifyContent: "space-between" }}>
          <Box sx={{ maxWidth: 400 }}>
            <Eyebrow color="#74807C">{t("landing.pulse.eyebrow")}</Eyebrow>
            <DisplayHeading sx={{ color: "#252723", mt: 2 }}>{t("landing.pulse.title")}</DisplayHeading>
          </Box>
          <Button onClick={() => navigate(PATHS.governanceActions)} sx={{ color: ds.gray["900"] }} variant="outlined">
            {t("landing.pulse.seeAll")}
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          {!areLiveProposalsLoading && shown.length === 0 && (
            <Box component="p" sx={{ color: ds.gray["500"], fontSize: 14, py: 4 }}>
              {t("landing.pulse.empty")}
            </Box>
          )}
          {shown.map((proposal, index) => (
            <PulseRow key={proposal.id} proposal={proposal} record={records[index]?.data} />
          ))}
        </Box>
      </HomeColumn>
    </Box>
  );
};
