import * as React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Slot } from "nativewind/dist/runtime/slot"; // More specific import for NativeWind's Slot
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";

import { cn } from "@/lib/utils";

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSlot = styled(Slot);

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define a specific type for the text child if not using asChild
const buttonTextVariants = cva(
  "text-sm font-medium",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-accent-foreground", // This might need adjustment based on hover
        secondary: "text-secondary-foreground",
        ghost: "text-accent-foreground", // This might need adjustment based on hover
        link: "text-primary underline-offset-4",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
)
const StyledText = styled(Text);


export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof StyledTouchableOpacity>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  textClassName?: string; // Allow passing specific className for Text
}

const Button = React.forwardRef<
  React.ElementRef<typeof StyledTouchableOpacity>,
  ButtonProps
>(({ className, variant, size, asChild = false, children, textClassName, ...props }, ref) => {
  const Comp = asChild ? StyledSlot : StyledTouchableOpacity;

  // If not asChild and children is a string, wrap it in a styled Text component
  const renderChildren = () => {
    if (!asChild && typeof children === 'string') {
      return (
        <StyledText className={cn(buttonTextVariants({ variant }), textClassName)}>
          {children}
        </StyledText>
      );
    }
    return children;
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {renderChildren()}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
