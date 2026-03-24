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

export interface IFunnelWidgetProps {
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

export const FunnelWidgetComponent: React.FC<IFunnelWidgetProps> = ({ value }) => {
  const classes = useStyles();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            header={
              <Subtitle2>
                FunnelWidget
                <Badge className={classes.badge} appearance="outline" color="informative" size="small">
                  PCF
                </Badge>
              </Subtitle2>
            }
            description={<Caption1>Sales/conversion funnel mini widget</Caption1>}
          />
          {value && <Body1>Current value: {value}</Body1>}
        </Card>
      </div>
    </FluentProvider>
  );
};
