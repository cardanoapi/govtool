import { Box, Typography, Link } from "@mui/material";
import { Trans } from "react-i18next";
import { useMaintenanceEndingBannerContext } from "./MaintenanceEndingBannerContext";

export const MaintenanceEndingBanner = () => {
  const { ref, isExpanded } =
    useMaintenanceEndingBannerContext();

  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: isExpanded ? "#212A3D" : "#9c2224",
        width: "100%",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        position: "sticky",
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Expandable Content */}
      <Box
        sx={{
          maxHeight: isExpanded ? "300px" : "0px", // 300px is a safe value for transition effect
          transition: "max-height 0.4s ease-in-out",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            pb: 2,
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            fontWeight={600}
            variant="caption"
            color="common.white"
            mb={0.5}
          >
            <Trans
              i18nKey="system.maintenanceEnding.description1"
              components={[
                <Link
                  variant="caption"
                  fontWeight={600}
                  color="common.white"
                  href="https://gov.tools/outcomes/governance_actions/9d213a57684d7ddf6f3350c80d042639ecbed5ccccc4a05bf54959a086593e7b#0"
                  data-testid="govtool-info-link"
                  target="_blank"
                  rel="noopener noreferrer"
                />,
              ]}
            />
          </Typography>
          <Typography
            fontWeight={600}
            variant="caption"
            color="common.white"
            mb={0.5}
          >
            <Trans
              i18nKey="system.maintenanceEnding.description2"
              components={[
                <Link
                  variant="caption"
                  fontWeight={600}
                  color="common.white"
                  href="https://gov.tools/governance_actions/d2db60c5307cb517c735e2d0138d2b6f10fc5b221d610fa187719bdc82af9a03#0"
                  data-testid="govtool-info-link"
                  target="_blank"
                  rel="noopener noreferrer"
                />,
              ]}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
