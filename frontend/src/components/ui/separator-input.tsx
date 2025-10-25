import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorInputProps extends Omit<React.ComponentProps<"input">, 'type'> {
  title: string
  titleClassName?: string
  containerClassName?: string
}

const SeparatorInput = React.forwardRef<HTMLInputElement, SeparatorInputProps>(
  ({ className, title, titleClassName, containerClassName, ...props }, ref) => {
    return (
      <div className={cn(
        "flex items-center w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
        containerClassName
      )}>
        {/* 좌측 타이틀 */}
        <div className={cn(
          "flex-shrink-0 px-3 py-2 text-sm font-medium text-foreground bg-background",
          titleClassName
        )}>
          {title}
        </div>
        
        {/* 구분선 */}
        <div className="h-6 w-[1px] bg-border flex-shrink-0" />
        
        {/* 우측 입력 필드 */}
        <input
          className={cn(
            "flex h-10 w-full bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-0",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SeparatorInput.displayName = "SeparatorInput"

export { SeparatorInput }
