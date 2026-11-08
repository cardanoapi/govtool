import { createTheme } from "@mui/material/styles";
import {
  cyan,
  ds,
  errorRed,
  FONT_FAMILY,
  orange,
  primaryBlue,
  progressYellow,
  RADIUS,
  SHADOWS,
  successGreen,
} from "./consts";

export type Theme = typeof theme;

export const theme = createTheme({
  breakpoints: {
    values: {
      xxs: 0,
      xs: 375,
      sm: 425,
      md: 768,
      lg: 1024,
      xl: 1440,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          fontFamily: FONT_FAMILY.sans,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: `12px !important`,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          bgcolor: "white",
          borderColor: "#6F99FF",
          border: 1,
          borderRadius: 50,
          padding: "8px 16px",
          width: "100%",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.pill,
          boxShadow: "none",
          fontWeight: 600,
          letterSpacing: "-0.09px",
          lineHeight: "20px",
          textTransform: "none",
          "& .MuiButton-startIcon": { marginLeft: 0, marginRight: 6 },
          "& .MuiButton-endIcon": { marginLeft: 6, marginRight: 0 },
          "&.Mui-disabled": {
            backgroundColor: ds.gray["200"],
            boxShadow: "none",
            color: ds.gray["400"],
          },
        },
        containedPrimary: {
          backgroundColor: ds.primary["600"],
          boxShadow: SHADOWS.innerPrimary,
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: ds.primary["700"],
            boxShadow: SHADOWS.innerPrimary,
          },
        },
        containedSecondary: {
          backgroundColor: ds.orange["600"],
          boxShadow: SHADOWS.innerAccent,
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: ds.orange["700"],
            boxShadow: SHADOWS.innerAccent,
          },
        },
        outlined: {
          backgroundColor: "#FFFFFF",
          border: `1px solid ${ds.gray["200"]}`,
          color: ds.gray["700"],
          "&:hover": {
            backgroundColor: ds.gray["50"],
            border: `1px solid ${ds.gray["200"]}`,
          },
        },
        text: {
          color: ds.primary["600"],
          "&:hover": { backgroundColor: ds.primary["50"] },
          "&.Mui-disabled": { backgroundColor: "transparent" },
        },
      },
      variants: [
        {
          props: { variant: "soft" },
          style: {
            backgroundColor: ds.primary["100"],
            border: `1px solid ${ds.primary["200"]}`,
            color: ds.primary["700"],
            "&:hover": { backgroundColor: ds.primary["200"] },
          },
        },
      ],
    },
    MuiChip: {
      variants: [
        {
          props: { color: "default", variant: "filled" },
          style: {
            backgroundColor: primaryBlue.c50,
          },
        },
        {
          props: { color: "success", variant: "filled" },
          style: {
            backgroundColor: successGreen.c200,
            color: successGreen.c700,
          },
        },
        {
          props: { color: "error", variant: "filled" },
          style: {
            backgroundColor: errorRed.c100,
            color: errorRed.c500,
          },
        },
        {
          props: { color: "warning", variant: "filled" },
          style: {
            backgroundColor: progressYellow.c200,
            color: orange.c700,
          },
        },
        {
          props: { color: "info", variant: "filled" },
          style: {
            backgroundColor: cyan.c100,
            color: cyan.c500,
          },
        },
      ],
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: 500,
          height: 28,
        },
        filledPrimary: {
          backgroundColor: primaryBlue.c100,
          color: primaryBlue.c500,
        },
        filledSecondary: {
          backgroundColor: orange.c100,
          color: orange.c600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        elevation: 2,
      },
    },
  },
  shape: {
    borderRadius: RADIUS.md,
  },
  typography: {
    fontFamily: FONT_FAMILY.sans,
    allVariants: {
      color: ds.gray["900"],
    },
  },
  palette: {
    accentOrange: ds.orange["600"],
    accentYellow: "#F2D9A9",
    arcticWhite: "#FBFBFF",
    boxShadow1: "rgba(0, 18, 61, 0.37)",
    boxShadow2: "rgba(47, 98, 220, 0.2)",
    darkPurple: ds.gray["900"],
    ds,
    errorRed: ds.error["700"],
    fadedPurple: ds.gray["500"],
    highlightBlue: "#C2EFF299",
    inputRed: ds.error["50"],
    lightBlue: ds.primary["100"],
    lightOrange: ds.orange["200"],
    negativeRed: ds.error["400"],
    neutralGray: ds.gray["400"],
    neutralWhite: "#FFFFFF",
    orangeDark: ds.orange["700"],
    positiveGreen: ds.success["500"],
    primary: { main: ds.primary["600"] },
    primaryBlue: ds.primary["600"],
    secondary: { main: ds.orange["600"] },
    secondaryBlue: ds.primary["400"],
    specialCyan: "#1C94B2",
    specialCyanBorder: "#77BFD1",
    textBlack: ds.gray["900"],
    textGray: ds.gray["600"],
  },
});

theme.shadows[1] = SHADOWS.header;
theme.shadows[2] = SHADOWS.card;
theme.shadows[3] = SHADOWS.cardBlue;
theme.shadows[4] = SHADOWS.button;
theme.shadows[5] = SHADOWS.drop;
theme.shadows[6] = SHADOWS.checkbox;
