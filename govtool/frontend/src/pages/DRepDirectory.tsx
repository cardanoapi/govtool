import { Outlet } from "react-router";
import { Box } from "@mui/material";

import { Background, PagePaddingBox, ContentBox } from "@atoms";
import { useTranslation } from "@hooks";
import { PageTitle } from "@molecules";
import { Footer, TopNav } from "@organisms";
import { checkIsWalletConnected } from "@utils";

export const DRepDirectory = () => {
  const { t } = useTranslation();

  if (checkIsWalletConnected()) {
    return (
      <PagePaddingBox
        sx={{ display: "flex", flex: 1, flexDirection: "column", py: 2 }}
      >
        <Outlet />
      </PagePaddingBox>
    );
  }

  return (
    <Background>
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <TopNav />

        <PagePaddingBox py={3}>
          <ContentBox>
            <PageTitle title={t("dRepDirectory.title")} />
          </ContentBox>
        </PagePaddingBox>

        <PagePaddingBox sx={{ display: "flex", flex: 1, py: 2 }}>
          <ContentBox
            sx={{ display: "flex", flex: 1, flexDirection: "column" }}
          >
            <Outlet />
          </ContentBox>
        </PagePaddingBox>
        {/* FIXME: Footer should be on top of the layout.
        Should not be rerendered across the pages */}
        <Footer />
      </Box>
    </Background>
  );
};
