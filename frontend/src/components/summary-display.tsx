"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryDisplayProps {
  summary: string
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card className="mt-6 border-accent bg-accent/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Summary</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-foreground leading-relaxed">{summary}</div>
      </CardContent>
    </Card>
  )
}
