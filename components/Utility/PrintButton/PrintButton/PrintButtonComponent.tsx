import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Card,
  CardHeader,
  Body1,
  Subtitle2,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IPrintButtonProps {
  value: string;
}

// ---------------------------------------------------------------------------
// Styles (Griffel — using shorthands for border to satisfy strict typing)
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    fontFamily: tokens.fontFamilyBase,
  },
  card: {
    width: "100%",
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  header: {
    marginBottom: tokens.spacingVerticalS,
  },
  badge: {
    marginLeft: tokens.spacingHorizontalS,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PrintButtonComponent: React.FC<IPrintButtonProps> = ({ value }) => {
  const classes = useStyles();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            header={
              <Subtitle2>
                PrintButton
                <Badge className={classes.badge} appearance="outline" color="informative" size="small">
                  PCF
                </Badge>
              </Subtitle2>
            }
            description={<Caption1>Print-optimized content wrapper with button</Caption1>}
          />
          {value && <Body1>Current value: {value}</Body1>}
        </Card>
      </div>
    </FluentProvider>
  );
};
