import * as React from "react";
import { TextInput } from "react-native";
import { styled } from "nativewind";

import { cn } from "@/lib/utils";

const StyledTextInput = styled(TextInput);

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof StyledTextInput> {}

const Input = React.forwardRef<
  React.ElementRef<typeof StyledTextInput>,
  InputProps
>(({ className, ...props }, ref) => {
  // Filter out web-specific 'type' prop if it's passed, as TextInput handles types differently (e.g. secureTextEntry, keyboardType)
  const { type, ...restProps } = props as any;

  return (
    <StyledTextInput
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Remove web-specific file input styling classes if they exist in a more complex scenario
        // For this specific className string, they are not present beyond the 'file:' prefix which won't match RN.
        className
      )}
      ref={ref}
      placeholderTextColor={props.placeholderTextColor || "#6b7280"} // Default placeholder color from text-muted-foreground
      {...restProps}
    />
  );
});
Input.displayName = "Input";

export { Input };
