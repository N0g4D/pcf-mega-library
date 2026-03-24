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

export type ButtonState = "idle" | "loading" | "progress" | "success" | "error";

export interface IMegaActionButtonProps {
  label: string;
  buttonState: ButtonState;
  progressValue: number;
  totalSteps: number;
  currentStep: number;
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
// SVG Progress Ring
// ---------------------------------------------------------------------------

const RING_SIZE = 20;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface IProgressRingProps {
  percent: number;
  size?: number;
}

const ProgressRing: React.FC<IProgressRingProps> = ({ percent, size = RING_SIZE }) => {
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;

  return React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: `0 0 ${RING_SIZE} ${RING_SIZE}`,
      style: { transform: "rotate(-90deg)", flexShrink: 0 },
    },
    // Background circle
    React.createElement("circle", {
      cx: RING_SIZE / 2,
      cy: RING_SIZE / 2,
      r: RING_RADIUS,
      fill: "none",
      stroke: "rgba(255,255,255,0.3)",
      strokeWidth: RING_STROKE,
    }),
    // Progress arc
    React.createElement("circle", {
      cx: RING_SIZE / 2,
      cy: RING_SIZE / 2,
      r: RING_RADIUS,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: RING_STROKE,
      strokeDasharray: RING_CIRCUMFERENCE,
      strokeDashoffset: offset,
      strokeLinecap: "round",
      style: { transition: "stroke-dashoffset 300ms ease" },
    })
  );
};

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

  /* Step indicator */
  stepIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase100,
    opacity: 0.85,
    marginLeft: tokens.spacingHorizontalXS,
  },
  stepDot: {
    width: "6px",
    height: "6px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: "rgba(255,255,255,0.4)",
    transitionProperty: "background-color, transform",
    transitionDuration: "200ms",
  },
  stepDotActive: {
    backgroundColor: "currentColor",
    transform: "scale(1.3)",
  },
  stepDotComplete: {
    backgroundColor: "currentColor",
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MegaActionButtonComponent: React.FC<IMegaActionButtonProps> = (props) => {
  const {
    label,
    buttonState,
    progressValue,
    totalSteps,
    currentStep,
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
  const validStates: ButtonState[] = ["idle", "loading", "progress", "success", "error"];
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

  // Determine icon
  const IconComponent = getIcon(iconName);

  // Build the button icon element
  const iconElement = useMemo(() => {
    switch (state) {
      case "loading":
        return React.createElement(Spinner, { size: "tiny" });
      case "progress":
        return React.createElement(ProgressRing, { percent: progressValue });
      case "success":
        return React.createElement(CheckmarkCircleRegular, null);
      case "error":
        return React.createElement(ErrorCircleRegular, null);
      default:
        return React.createElement(IconComponent, null);
    }
  }, [state, progressValue, IconComponent]);

  // Build label
  const displayLabel = useMemo(() => {
    switch (state) {
      case "loading":
        return "Processing...";
      case "progress":
        return `${Math.round(progressValue)}%`;
      case "success":
        return "Done!";
      case "error":
        return "Failed";
      default:
        return label;
    }
  }, [state, progressValue, label]);

  // Step dots
  const stepDots = useMemo(() => {
    if (totalSteps <= 1 || state !== "progress") return null;
    const dots: React.ReactElement[] = [];
    for (let i = 1; i <= totalSteps; i++) {
      const dotClass = mergeClasses(
        classes.stepDot,
        i < currentStep && classes.stepDotComplete,
        i === currentStep && classes.stepDotActive
      );
      dots.push(React.createElement("div", { key: i, className: dotClass }));
    }
    return React.createElement("div", { className: classes.stepIndicator }, ...dots);
  }, [totalSteps, currentStep, state, classes]);

  // Button class
  const buttonClass = mergeClasses(
    classes.button,
    state === "success" && classes.success,
    state === "error" && classes.error,
    showPulse && classes.pulse
  );

  const isDisabled = disabled || state === "loading" || state === "progress";

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
          aria-label={displayLabel}
          aria-busy={state === "loading" || state === "progress"}
        >
          {displayLabel}
          {stepDots}
        </Button>
      </div>
    </FluentProvider>
  );
};
