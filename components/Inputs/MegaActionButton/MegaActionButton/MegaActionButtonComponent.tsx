import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Button,
  Spinner,
  makeStyles,
  mergeClasses,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  SendRegular,
  SaveRegular,
  DeleteRegular,
  AddRegular,
  CheckmarkRegular,
  RocketRegular,
  ArrowRightRegular,
  CheckmarkCircleRegular,
  ErrorCircleRegular,
} from "@fluentui/react-icons";

const { useMemo, useCallback, useState, useEffect } = React;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface IMegaActionButtonProps {
  label: string;
  buttonState: ButtonState;
  iconName: string;
  appearance: string;
  size: string;
  disabled: boolean;
  onClick: () => void;
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.FC> = {
  send: SendRegular,
  save: SaveRegular,
  delete: DeleteRegular,
  add: AddRegular,
  check: CheckmarkRegular,
  rocket: RocketRegular,
  arrow: ArrowRightRegular,
};

function getIcon(name: string): React.FC {
  return ICON_MAP[name.toLowerCase()] ?? SendRegular;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    fontFamily: tokens.fontFamilyBase,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    transitionProperty: "all",
    transitionDuration: "300ms",
    transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
    position: "relative",
    overflow: "hidden",
  },

  /* Success state */
  success: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
    ":hover": {
      backgroundColor: tokens.colorPaletteGreenBackground3,
    },
  },

  /* Error state */
  error: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    ...shorthands.borderColor(tokens.colorPaletteRedBorder2),
    ":hover": {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
  },

  /* Pulse animation for success/error */
  pulse: {
    animationName: {
      "0%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.04)" },
      "100%": { transform: "scale(1)" },
    },
    animationDuration: "400ms",
    animationTimingFunction: "ease-in-out",
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MegaActionButtonComponent: React.FC<IMegaActionButtonProps> = (props) => {
  const {
    label,
    buttonState,
    iconName,
    appearance,
    size,
    disabled,
    onClick,
  } = props;

  const classes = useStyles();
  const [showPulse, setShowPulse] = useState(false);

  // Pulse animation on state transitions to success/error
  useEffect(() => {
    if (buttonState === "success" || buttonState === "error") {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 400);
      return () => clearTimeout(timer);
    }
  }, [buttonState]);

  // Validate state
  const validStates: ButtonState[] = ["idle", "loading", "success", "error"];
  const state: ButtonState = validStates.includes(buttonState) ? buttonState : "idle";

  // Resolve appearance
  const btnAppearance = (
    ["primary", "outline", "subtle", "transparent"] as const
  ).includes(appearance as "primary")
    ? (appearance as "primary" | "outline" | "subtle" | "transparent")
    : "primary";

  // Resolve size
  const btnSize = (["small", "medium", "large"] as const).includes(size as "small")
    ? (size as "small" | "medium" | "large")
    : "medium";

  // Determine icon based on state
  const iconElement = useMemo(() => {
    switch (state) {
      case "loading":
        return React.createElement(Spinner, { size: "tiny" });
      case "success":
        return React.createElement(CheckmarkCircleRegular, null);
      case "error":
        return React.createElement(ErrorCircleRegular, null);
      default:
        return React.createElement(getIcon(iconName), null);
    }
  }, [state, iconName]);

  // Button class
  const buttonClass = mergeClasses(
    classes.button,
    state === "success" && classes.success,
    state === "error" && classes.error,
    showPulse && classes.pulse
  );

  const isDisabled = disabled || state === "loading";

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick();
    }
  }, [isDisabled, onClick]);

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Button
          className={buttonClass}
          appearance={btnAppearance}
          size={btnSize}
          icon={iconElement}
          disabled={isDisabled}
          onClick={handleClick}
          aria-label={label}
          aria-busy={state === "loading"}
        >
          {label}
        </Button>
      </div>
    </FluentProvider>
  );
};
