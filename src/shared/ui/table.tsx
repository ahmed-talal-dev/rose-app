"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils/index"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      // Added dark mode border color
      className="relative w-full overflow-x-auto rounded-xl border border-border dark:border-zinc-800"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      // Added dark mode background
      className={cn("bg-zinc-50 dark:bg-zinc-900/50 [&_tr]:border-b dark:[&_tr]:border-zinc-800", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      // Added dark mode background
      className={cn("bg-white dark:bg-zinc-900 [&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      // Added dark mode variants
      className={cn(
        "border-t dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      // Added dark mode hover effects
      className={cn(
        "border-b dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=selected]:bg-primary-50 dark:data-[state=selected]:bg-primary-900/20",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      // Changed text-left to text-start for RTL compatibility
      className={cn(
        "h-11 px-4 text-start align-middle text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground dark:text-zinc-400", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}