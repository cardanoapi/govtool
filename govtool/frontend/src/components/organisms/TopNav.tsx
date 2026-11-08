import { useState } from "react";
import { Link as RouterLink, NavLink, useLocation, useNavigate } from "react-router";
import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Wallet } from "lucide-react";

import { Button } from "@atoms";
import {
  CONNECTED_NAV_ITEMS,
  ICONS,
  IMAGES,
  NAV_ITEMS,
  PATHS,
  PDF_PATHS,
} from "@consts";
import { useCardano, useModal } from "@context";
import { useScreenDimension, useTranslation } from "@hooks";
import { WalletMenu } from "@molecules";
import { ds, SHADOWS } from "@/consts/designTokens";

import { DrawerMobile } from "./DrawerMobile";

// Below this width the nav items and the wallet control no longer fit on one
// line, so the nav collapses into the drawer.
const DESKTOP_MIN_WIDTH = 1024;

type NavEntry = {
  dataTestId: string;
  label: string;
  navTo?: string;
  newTabLink?: string | null;
};

const GOVERNANCE_ACTION_IDS = ["governance-actions", "governance-actions-link"];

const isNavEntryActive = (entry: NavEntry, pathname: string) => {
  if (GOVERNANCE_ACTION_IDS.includes(entry.dataTestId)) {
    return [
      PATHS.governanceActions,
      PATHS.dashboardGovernanceActions,
      PDF_PATHS.proposalDiscussion,
    ].some((path) => pathname.startsWith(path));
  }
  if (!entry.navTo) return false;
  if (entry.navTo === PATHS.home) return pathname === PATHS.home;
  return pathname === entry.navTo || pathname.startsWith(`${entry.navTo}/`);
};

const NavPill = ({
  entry,
  isActive,
}: {
  entry: NavEntry;
  isActive: boolean;
}) => {
  const sx = {
    alignItems: "center",
    backgroundColor: isActive ? "#FF640A14" : "transparent",
    border: `1px solid ${isActive ? "#FF640A29" : "transparent"}`,
    borderRadius: "30px",
    color: isActive ? ds.orange["600"] : ds.gray["500"],
    display: "inline-flex",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    height: 28,
    letterSpacing: "-0.09px",
    lineHeight: "20px",
    px: "13px",
    textDecoration: "none",
    whiteSpace: "nowrap",
    "&:hover": { color: isActive ? ds.orange["600"] : ds.gray["900"] },
  };

  if (entry.newTabLink) {
    return (
      <Box
        component="a"
        data-testid={entry.dataTestId}
        href={entry.newTabLink}
        rel="noopener noreferrer"
        sx={sx}
        target="_blank"
      >
        {entry.label}
      </Box>
    );
  }

  return (
    <Box
      aria-current={isActive ? "page" : undefined}
      component={RouterLink}
      data-testid={entry.dataTestId}
      sx={sx}
      to={entry.navTo ?? PATHS.home}
    >
      {entry.label}
    </Box>
  );
};

export const TopNav = ({ isConnectButton = true }) => {
  const { openModal } = useModal();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { screenWidth } = useScreenDimension();
  const { isEnabled, disconnectWallet, stakeKey } = useCardano();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const isConnected = Boolean(isEnabled && stakeKey);
  const navEntries = (
    isConnected ? CONNECTED_NAV_ITEMS : NAV_ITEMS
  ) as NavEntry[];

  const onClickConnectButton = () => {
    if (isEnabled && stakeKey) {
      navigate(PATHS.dashboard);
    }
    openModal({ type: "chooseWallet" });
  };

  const renderWalletControl = () => {
    if (isConnected) return <WalletMenu />;
    if (!isConnectButton) return null;
    return (
      <Button
        data-testid="connect-wallet-button"
        endIcon={
          <Wallet aria-hidden color={ds.primary["600"]} size={16} strokeWidth={1.5} />
        }
        onClick={onClickConnectButton}
        size="medium"
        variant="soft"
      >
        {t("wallet.connectWallet")}
      </Button>
    );
  };

  const renderDesktopNav = () => (
    <>
      <Box
        component="nav"
        sx={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          gap: 0.5,
          justifyContent: "center",
          px: 3,
        }}
      >
        {navEntries.map((entry) => (
          <NavPill
            key={entry.dataTestId}
            entry={entry}
            isActive={isNavEntryActive(entry, pathname)}
          />
        ))}
      </Box>
      <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
        {renderWalletControl()}
      </Box>
    </>
  );

  const renderMobileNav = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {isConnectButton && (
        <Button
          data-testid="connect-wallet-button"
          onClick={onClickConnectButton}
          size="small"
          sx={{ marginRight: screenWidth >= 768 ? 3 : 1, flex: 1 }}
          variant="contained"
        >
          {t("wallet.connect")}
        </Button>
      )}
      {screenWidth >= 768 ? (
        <IconButton
          data-testid="open-drawer-button"
          onClick={() => setIsDrawerOpen(true)}
          sx={{ bgcolor: "#FBFBFF" }}
        >
          <MenuIcon color="primary" />
        </IconButton>
      ) : (
        <img
          alt="drawer-icon"
          src={ICONS.drawerIcon}
          onClick={() => setIsDrawerOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setIsDrawerOpen(true)}
          data-testid="open-drawer-button"
        />
      )}
      <DrawerMobile
        isConnectButton={isConnectButton}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </Box>
  );

  return (
    <Box
      component="header"
      sx={{
        backdropFilter: "blur(24px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderBottom: `1px solid ${ds.gray["200"]}`,
        boxShadow: SHADOWS.header,
        position: "sticky",
        px: { xxs: 2, md: 3 },
        top: 0,
        width: "100%",
        boxSizing: "border-box",
        zIndex: 100,
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 1180,
          mx: "auto",
          py: 2,
        }}
      >
        <NavLink
          data-testid="logo-button"
          onClick={() => isConnectButton || disconnectWallet()}
          style={{ display: "flex" }}
          to={PATHS.home}
        >
          <img
            alt="Cardano GovTool"
            height={24}
            src={IMAGES.govToolLogo}
            width={118}
          />
        </NavLink>
        {screenWidth >= DESKTOP_MIN_WIDTH
          ? renderDesktopNav()
          : renderMobileNav()}
      </Box>
    </Box>
  );
};
