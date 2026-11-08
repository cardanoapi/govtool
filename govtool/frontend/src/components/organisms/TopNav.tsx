import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Box, IconButton } from "@mui/material";
import { Menu, Wallet } from "lucide-react";

import { Button } from "@atoms";
import { CONNECTED_NAV_ITEMS, IMAGES, NAV_ITEMS, PATHS } from "@consts";
import { useCardano, useModal } from "@context";
import { useScreenDimension, useTranslation } from "@hooks";
import { WalletMenu } from "@molecules";
import { ds, SHADOWS } from "@/consts/designTokens";

import { DrawerMobile } from "./DrawerMobile";
import { isNavEntryActive, NavEntry, NavEntryLink } from "./topNavItems";

// Below this width the nav items and the wallet control no longer fit on one
// line, so the nav collapses into the drawer.
const DESKTOP_MIN_WIDTH = 1024;

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

  const renderWalletControl = (isCompact = false) => {
    if (isConnected) return <WalletMenu />;
    if (!isConnectButton) return null;
    return (
      <Button
        data-testid="connect-wallet-button"
        endIcon={
          isCompact ? undefined : (
            <Wallet
              aria-hidden
              color={ds.primary["600"]}
              size={16}
              strokeWidth={1.5}
            />
          )
        }
        onClick={onClickConnectButton}
        size={isCompact ? "small" : "medium"}
        variant="soft"
      >
        {t(isCompact ? "wallet.connect" : "wallet.connectWallet")}
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
          <NavEntryLink
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
    <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
      {renderWalletControl(true)}
      <IconButton
        aria-label={t("menu.open")}
        data-testid="open-drawer-button"
        onClick={() => setIsDrawerOpen(true)}
        sx={{
          border: `1px solid ${ds.gray["200"]}`,
          borderRadius: "50%",
          height: 36,
          width: 36,
        }}
      >
        <Menu aria-hidden color={ds.gray["700"]} size={18} />
      </IconButton>
      <DrawerMobile
        isConnectButton={isConnectButton}
        isConnected={isConnected}
        isDrawerOpen={isDrawerOpen}
        navEntries={navEntries}
        onConnect={onClickConnectButton}
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
