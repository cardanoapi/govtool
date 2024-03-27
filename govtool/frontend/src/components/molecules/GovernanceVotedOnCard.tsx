import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import { Button } from "@atoms";
import { PATHS } from "@consts";
import { useScreenDimension, useTranslation } from "@hooks";
import { VotedProposal } from "@models";
import {
  formatDisplayDate,
  getFullGovActionId,
  getProposalTypeLabel,
  getProposalTypeNoEmptySpaces,
} from "@utils";
import {
  GovernanceActionCardElement,
  GovernanceActionCardHeader,
  GovernanceActionCardMyVote,
  GovernanceActionCardStatePill,
  GovernanceActionsDatesBox,
} from "@molecules";

const mockedLongText =
  "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, distinctio culpa minus eaque illo quidem voluptates quisquam mollitia consequuntur ex, sequi saepe? Ad ex adipisci molestiae sed.";

type Props = {
  votedProposal: VotedProposal;
  isDataMissing: boolean;
  inProgress?: boolean;
};

export const GovernanceVotedOnCard = ({
  votedProposal,
  isDataMissing,
  inProgress,
}: Props) => {
  const navigate = useNavigate();
  const { proposal, vote } = votedProposal;
  const {
    createdDate,
    createdEpochNo,
    expiryDate,
    expiryEpochNo,
    type,
    txHash,
    index,
    title,
    about,
  } = proposal;

  const { isMobile, screenWidth } = useScreenDimension();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: screenWidth < 420 ? 290 : isMobile ? 324 : 350,
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0px 4px 15px 0px #DDE3F5",
        borderRadius: "20px",
        backgroundColor: isDataMissing
          ? "rgba(251, 235, 235, 0.50)"
          : "rgba(255, 255, 255, 0.3)",
        // TODO: To decide if voted on cards can be actually in progress
        border: inProgress
          ? "1px solid #FFCBAD"
          : isDataMissing
          ? "1px solid #F6D5D5"
          : "1px solid #C0E4BA",
      }}
      data-testid={`govaction-${getProposalTypeNoEmptySpaces(type)}-card`}
    >
      <GovernanceActionCardStatePill
        variant={inProgress ? "inProgress" : "voteSubmitted"}
      />
      <Box
        sx={{
          padding: "40px 24px 0",
        }}
      >
        <GovernanceActionCardHeader
          // TODO: Remove "Fund our project" when title is implemented everywhere
          title={title ?? "Fund our project"}
          isDataMissing={isDataMissing}
        />
        <GovernanceActionCardElement
          label={t("govActions.abstract")}
          // TODO: Remove mock when possible
          text={about ?? mockedLongText}
          textVariant="twoLines"
          dataTestId="governance-action-abstract"
          isSliderCard
        />
        <GovernanceActionCardElement
          label={t("govActions.governanceActionType")}
          text={getProposalTypeLabel(type)}
          textVariant="pill"
          dataTestId={`${getProposalTypeNoEmptySpaces(type)}-type`}
          isSliderCard
        />
        <GovernanceActionsDatesBox
          createdDate={formatDisplayDate(createdDate)}
          expiryDate={formatDisplayDate(expiryDate)}
          expiryEpochNo={expiryEpochNo}
          createdEpochNo={createdEpochNo}
          isSliderCard
        />
        <GovernanceActionCardElement
          label={t("govActions.governanceActionId")}
          text={getFullGovActionId(txHash, index)}
          dataTestId={`${getFullGovActionId(txHash, index)}-id`}
          isCopyButton
          isSliderCard
        />
        <GovernanceActionCardMyVote vote={vote.vote} />
      </Box>
      <Box
        bgcolor="white"
        px={isMobile ? 2 : 5}
        py={2}
        sx={{
          boxShadow: "0px 4px 15px 0px #DDE3F5",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <Button
          disabled={inProgress}
          data-testid={`govaction-${getFullGovActionId(
            txHash,
            index,
          )}-change-your-vote`}
          onClick={() =>
            navigate(
              PATHS.dashboardGovernanceActionsAction.replace(
                ":proposalId",
                getFullGovActionId(txHash, index),
              ),
              {
                state: {
                  ...proposal,
                  vote: vote.vote.toLowerCase(),
                },
              },
            )
          }
          sx={{
            width: "100%",
          }}
          variant="contained"
        >
          {t("govActions.viewDetails")}
        </Button>
      </Box>
    </Box>
  );
};
