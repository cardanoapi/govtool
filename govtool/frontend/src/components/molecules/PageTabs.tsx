import { Box } from "@mui/material";
import { Link } from "react-router";

import { ds } from "@/consts/designTokens";
import type { PageTab } from "@/hooks/useGovernanceActionTabs";

type PageTabsProps = {
  tabs: PageTab[];
};

export const PageTabs = ({ tabs }: PageTabsProps) => (
  <Box
    component="nav"
    sx={{
      borderBottom: `1px solid ${ds.gray["200"]}`,
      display: "flex",
      overflowX: "auto",
    }}
  >
    {tabs.map((tab) => (
      <Box
        key={tab.to}
        aria-current={tab.isActive ? "page" : undefined}
        component={Link}
        data-testid={tab.dataTestId}
        to={tab.to}
        sx={{
          borderBottom: `1px solid ${
            tab.isActive ? ds.primary["600"] : "transparent"
          }`,
          boxSizing: "border-box",
          color: tab.isActive ? ds.primary["600"] : ds.gray["500"],
          fontSize: 14,
          fontWeight: tab.isActive ? 600 : 400,
          height: 38,
          letterSpacing: "-0.09px",
          lineHeight: "20px",
          mb: "-1px",
          px: 1.5,
          py: 1,
          textDecoration: "none",
          whiteSpace: "nowrap",
          "&:hover": {
            color: tab.isActive ? ds.primary["600"] : ds.gray["900"],
          },
        }}
      >
        {tab.label}
      </Box>
    ))}
  </Box>
);
