import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-blue-600 text-white hover:bg-blue-700",
                secondary:
                    "border-transparent bg-slate-700 text-slate-100 hover:bg-slate-600",
                destructive:
                    "border-transparent bg-red-600 text-white hover:bg-red-700",
                outline: "text-slate-100 border-slate-600",
                success:
                    "border-transparent bg-green-600 text-white hover:bg-green-700",
                warning:
                    "border-transparent bg-yellow-600 text-white hover:bg-yellow-700",
                info:
                    "border-transparent bg-cyan-600 text-white hover:bg-cyan-700",
                purple:
                    "border-transparent bg-purple-600 text-white hover:bg-purple-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    children?: React.ReactNode
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props}>
            {children}
        </div>
    )
}

export { Badge, badgeVariants }