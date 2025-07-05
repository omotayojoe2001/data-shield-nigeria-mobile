import * as React from "react";
import { Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";

import { cn } from "@/lib/utils";

const StyledText = styled(Text);

const labelVariants = cva(
  "text-sm font-medium leading-none"
  // Removed "peer-disabled:cursor-not-allowed peer-disabled:opacity-70" as these are web-specific
  // and require more complex handling in React Native if equivalent functionality is needed.
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof StyledText>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
  React.ElementRef<typeof StyledText>,
  LabelProps
>(({ className, ...props }, ref) => (
  <StyledText
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
