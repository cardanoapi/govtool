import { Dispatch, SetStateAction } from "react";
import type { NavEntry } from "./topNavItems";

export type DashboardDrawerMobileProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
};

export type DrawerMobileProps = DashboardDrawerMobileProps & {
  isConnectButton: boolean;
  isConnected: boolean;
  navEntries: NavEntry[];
  onConnect: () => void;
};
