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

export interface IDatePickerProps {
  selectedDate: string;
  placeholder: string;
  minDate: string;
  maxDate: string;
  firstDayOfWeek: "sunday" | "monday" | "saturday";
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Styles (Griffel — using shorthands for border to satisfy strict typing)
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
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

export const DatePickerComponent: React.FC<IDatePickerProps> = ({ selectedDate, placeholder, minDate, maxDate, firstDayOfWeek, disabled }) => {
  const classes = useStyles();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            header={
              <Subtitle2>
                DatePicker
                <Badge className={classes.badge} appearance="outline" color="informative" size="small">
                  PCF
                </Badge>
              </Subtitle2>
            }
            description={<Caption1>Date picker with calendar popup and keyboard navigation</Caption1>}
          />
        </Card>
      </div>
    </FluentProvider>
  );
};
