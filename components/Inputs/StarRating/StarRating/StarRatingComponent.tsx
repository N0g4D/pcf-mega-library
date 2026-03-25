import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  StarFilled,
  StarRegular,
  StarHalfFilled,
} from "@fluentui/react-icons";

const { useState, useCallback, useMemo } = React;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IStarRatingProps {
  value: number;
  maxStars: number;
  allowHalf: boolean;
  size: "small" | "medium" | "large";
  disabled: boolean;
  onValueChange: (value: number) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const SIZE_MAP = {
  small: "16px",
  medium: "24px",
  large: "32px",
} as const;

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamilyBase,
  },
  container: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
  },
  starWrapper: {
    position: "relative",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transitionProperty: "transform",
    transitionDuration: "150ms",
    transitionTimingFunction: "ease-out",
    ":hover": {
      transform: "scale(1.15)",
    },
  },
  starDisabled: {
    cursor: "default",
    ":hover": {
      transform: "none",
    },
  },
  starFilled: {
    color: tokens.colorPaletteYellowForeground1,
  },
  starEmpty: {
    color: tokens.colorNeutralStroke2,
  },
  starHover: {
    color: tokens.colorPaletteYellowForeground2,
  },
  halfStarContainer: {
    position: "relative",
    display: "inline-flex",
  },
  halfStarLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    zIndex: 2,
  },
  halfStarRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "50%",
    height: "100%",
    zIndex: 2,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StarRatingComponent: React.FC<IStarRatingProps> = (props) => {
  const { value, maxStars, allowHalf, size, disabled, onValueChange } = props;
  const classes = useStyles();
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const iconSize = SIZE_MAP[size] || SIZE_MAP.medium;
  const starCount = maxStars || 5;
  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = useCallback(
    (starValue: number) => {
      if (disabled) return;
      // Toggle off if clicking the same value
      const newValue = starValue === value ? 0 : starValue;
      onValueChange(newValue);
    },
    [disabled, value, onValueChange]
  );

  const handleMouseEnter = useCallback(
    (starValue: number) => {
      if (!disabled) setHoverValue(starValue);
    },
    [disabled]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const stars = useMemo(() => {
    const elements: React.ReactElement[] = [];

    for (let i = 1; i <= starCount; i++) {
      const isFull = displayValue >= i;
      const isHalf = allowHalf && !isFull && displayValue >= i - 0.5;
      const isHovering = hoverValue !== null;

      const starClass = mergeClasses(
        classes.starWrapper,
        disabled && classes.starDisabled
      );

      const colorClass = isFull || isHalf
        ? (isHovering ? classes.starHover : classes.starFilled)
        : classes.starEmpty;

      if (allowHalf) {
        // Two click zones per star: left half = i-0.5, right half = i
        elements.push(
          React.createElement(
            "div",
            {
              key: i,
              className: mergeClasses(starClass, classes.halfStarContainer),
              onMouseLeave: handleMouseLeave,
              style: { fontSize: iconSize },
            },
            // Left half zone
            React.createElement("div", {
              className: classes.halfStarLeft,
              onMouseEnter: () => handleMouseEnter(i - 0.5),
              onClick: () => handleClick(i - 0.5),
            }),
            // Right half zone
            React.createElement("div", {
              className: classes.halfStarRight,
              onMouseEnter: () => handleMouseEnter(i),
              onClick: () => handleClick(i),
            }),
            // Visual star
            isHalf
              ? React.createElement(StarHalfFilled, { className: colorClass, style: { fontSize: iconSize } })
              : isFull
                ? React.createElement(StarFilled, { className: colorClass, style: { fontSize: iconSize } })
                : React.createElement(StarRegular, { className: colorClass, style: { fontSize: iconSize } })
          )
        );
      } else {
        // Simple: one click zone per star
        elements.push(
          React.createElement(
            "div",
            {
              key: i,
              className: starClass,
              onMouseEnter: () => handleMouseEnter(i),
              onMouseLeave: handleMouseLeave,
              onClick: () => handleClick(i),
              style: { fontSize: iconSize },
              role: "radio",
              "aria-checked": value === i,
              "aria-label": `${i} star${i > 1 ? "s" : ""}`,
            },
            isFull
              ? React.createElement(StarFilled, { className: colorClass, style: { fontSize: iconSize } })
              : React.createElement(StarRegular, { className: colorClass, style: { fontSize: iconSize } })
          )
        );
      }
    }
    return elements;
  }, [starCount, displayValue, allowHalf, disabled, hoverValue, value, iconSize, classes, handleClick, handleMouseEnter, handleMouseLeave]);

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <div
          className={classes.container}
          role="radiogroup"
          aria-label={`Rating: ${value} of ${starCount} stars`}
        >
          {stars}
        </div>
      </div>
    </FluentProvider>
  );
};
