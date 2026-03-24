import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Button,
  Subtitle1,
  Body1,
  Caption1,
  Divider,
  makeStyles,
  mergeClasses,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  DismissRegular,
  ChevronRightRegular,
  InfoRegular,
  SettingsRegular,
  PersonRegular,
  DocumentRegular,
} from "@fluentui/react-icons";

const { useState, useEffect, useCallback, useRef } = React;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideDirection = "left" | "right" | "top" | "bottom";

export interface IContentZone {
  title: string;
  body: string;
  icon?: string;
}

export interface IGlassPanelProps {
  isOpen: boolean;
  panelTitle: string;
  slideDirection: SlideDirection;
  blurIntensity: number;
  tintColor: string;
  panelSize: string;
  contentZones: IContentZone[];
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ReactElement> = {
  info: React.createElement(InfoRegular, null),
  settings: React.createElement(SettingsRegular, null),
  person: React.createElement(PersonRegular, null),
  document: React.createElement(DocumentRegular, null),
};

function resolveIcon(name?: string): React.ReactElement {
  if (!name) return React.createElement(ChevronRightRegular, null);
  return ICON_MAP[name.toLowerCase()] ?? React.createElement(ChevronRightRegular, null);
}

// ---------------------------------------------------------------------------
// Default demo zones
// ---------------------------------------------------------------------------

const DEFAULT_ZONES: IContentZone[] = [
  {
    title: "Overview",
    body: "This glassmorphism panel supports configurable blur, tint, and slide direction. Bind the isOpen property to control visibility.",
    icon: "info",
  },
  {
    title: "User Profile",
    body: "Display user details, avatar, and quick actions in a frosted glass overlay that feels native to modern Fluent UI apps.",
    icon: "person",
  },
  {
    title: "Settings",
    body: "Use content zones to render dynamic sections. Pass a JSON array via the contentZones property.",
    icon: "settings",
  },
  {
    title: "Documents",
    body: "Attach document lists, recent files, or any structured data into dedicated content zones.",
    icon: "document",
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TRANSITION_MS = 350;

const useStyles = makeStyles({
  /* Backdrop overlay */
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 9998,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: `${TRANSITION_MS}ms`,
    transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
    pointerEvents: "none",
  },
  backdropVisible: {
    opacity: 1,
    pointerEvents: "auto",
  },

  /* Glass panel */
  panel: {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    transitionProperty: "transform",
    transitionDuration: `${TRANSITION_MS}ms`,
    transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.25)",
    overflowY: "auto",
    overflowX: "hidden",
  },

  /* Direction modifiers — closed positions */
  panelRight: {
    top: 0,
    right: 0,
    height: "100vh",
    transform: "translateX(100%)",
    ...shorthands.borderRadius(tokens.borderRadiusXLarge, 0, 0, tokens.borderRadiusXLarge),
  },
  panelLeft: {
    top: 0,
    left: 0,
    height: "100vh",
    transform: "translateX(-100%)",
    ...shorthands.borderRadius(0, tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0),
  },
  panelTop: {
    top: 0,
    left: 0,
    width: "100vw",
    transform: "translateY(-100%)",
    ...shorthands.borderRadius(0, 0, tokens.borderRadiusXLarge, tokens.borderRadiusXLarge),
  },
  panelBottom: {
    bottom: 0,
    left: 0,
    width: "100vw",
    transform: "translateY(100%)",
    ...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
  },

  /* Open state */
  panelOpen: {
    transform: "translate(0, 0)",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    flexShrink: 0,
  },
  headerTitle: {
    color: "#ffffff",
    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },

  /* Content zones */
  zonesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    ...shorthands.padding(0, tokens.spacingHorizontalXL, tokens.spacingVerticalL),
    flexGrow: 1,
  },
  zoneCard: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(8px)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.15)",
    transitionProperty: "background-color, transform",
    transitionDuration: "200ms",
    cursor: "default",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      transform: "translateY(-1px)",
    },
  },
  zoneIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    flexShrink: 0,
    fontSize: "20px",
  },
  zoneContent: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  zoneTitle: {
    color: "#ffffff",
    fontWeight: tokens.fontWeightSemibold,
  },
  zoneBody: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },

  /* Footer */
  footer: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalXL),
    flexShrink: 0,
  },
  footerDivider: {
    marginBottom: tokens.spacingVerticalM,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: tokens.fontSizeBase100,
    textAlign: "center" as const,
  },

  /* Close button */
  closeButton: {
    color: "#ffffff",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GlassPanelSlideOutComponent: React.FC<IGlassPanelProps> = (props) => {
  const {
    isOpen,
    panelTitle,
    slideDirection,
    blurIntensity,
    tintColor,
    panelSize,
    contentZones,
    onDismiss,
  } = props;

  const classes = useStyles();
  const panelRef = useRef<HTMLDivElement>(null);

  // Use default zones if none provided
  const zones = contentZones.length > 0 ? contentZones : DEFAULT_ZONES;

  // Determine panel direction class
  const directionClass: Record<SlideDirection, string> = {
    right: classes.panelRight,
    left: classes.panelLeft,
    top: classes.panelTop,
    bottom: classes.panelBottom,
  };

  const direction: SlideDirection =
    (["left", "right", "top", "bottom"] as SlideDirection[]).includes(slideDirection)
      ? slideDirection
      : "right";

  // Focus trap: focus panel when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Escape key to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss]
  );

  // Dynamic panel size
  const isHorizontal = direction === "left" || direction === "right";
  const panelSizeStyle: React.CSSProperties = isHorizontal
    ? { width: panelSize }
    : { height: panelSize };

  // Glass effect inline styles (dynamic values can't be in makeStyles)
  const glassStyle: React.CSSProperties = {
    backdropFilter: `blur(${blurIntensity}px)`,
    WebkitBackdropFilter: `blur(${blurIntensity}px)`,
    backgroundColor: tintColor,
    ...panelSizeStyle,
  };

  return (
    <FluentProvider theme={webDarkTheme}>
      {/* Backdrop */}
      <div
        className={mergeClasses(
          classes.backdrop,
          isOpen && classes.backdropVisible
        )}
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={mergeClasses(
          classes.panel,
          directionClass[direction],
          isOpen && classes.panelOpen
        )}
        style={glassStyle}
        role="dialog"
        aria-modal="true"
        aria-label={panelTitle}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className={classes.header}>
          <Subtitle1 className={classes.headerTitle}>{panelTitle}</Subtitle1>
          <Button
            className={classes.closeButton}
            appearance="subtle"
            icon={<DismissRegular />}
            onClick={onDismiss}
            aria-label="Close panel"
            size="medium"
          />
        </div>

        {/* Content Zones */}
        <div className={classes.zonesContainer}>
          {zones.map((zone, idx) => (
            <div className={classes.zoneCard} key={idx}>
              <div className={classes.zoneIcon}>{resolveIcon(zone.icon)}</div>
              <div className={classes.zoneContent}>
                <Body1 className={classes.zoneTitle}>{zone.title}</Body1>
                <Caption1 className={classes.zoneBody}>{zone.body}</Caption1>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={classes.footer}>
          <Divider className={classes.footerDivider} appearance="subtle" />
          <Caption1 className={classes.footerText}>
            GlassPanelSlideOut — PCF Mega Library
          </Caption1>
        </div>
      </div>
    </FluentProvider>
  );
};
