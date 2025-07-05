import * as React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";

import { cn } from "@/lib/utils";

const StyledView = styled(View);
const StyledText = styled(Text);

const Card = React.forwardRef<
  React.ElementRef<typeof StyledView>,
  React.ComponentPropsWithoutRef<typeof StyledView>
>(({ className, ...props }, ref) => (
  <StyledView
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  React.ElementRef<typeof StyledView>,
  React.ComponentPropsWithoutRef<typeof StyledView>
>(({ className, ...props }, ref) => (
  <StyledView
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  React.ElementRef<typeof StyledText>,
  React.ComponentPropsWithoutRef<typeof StyledText>
>(({ className, ...props }, ref) => (
  <StyledText
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  React.ElementRef<typeof StyledText>,
  React.ComponentPropsWithoutRef<typeof StyledText>
>(({ className, ...props }, ref) => (
  <StyledText
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  React.ElementRef<typeof StyledView>,
  React.ComponentPropsWithoutRef<typeof StyledView>
>(({ className, ...props }, ref) => (
  <StyledView ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  React.ElementRef<typeof StyledView>,
  React.ComponentPropsWithoutRef<typeof StyledView>
>(({ className, ...props }, ref) => (
  <StyledView
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
