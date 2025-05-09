"use client"

import { useState } from "react"
import type { SummaryItem } from "@/types/summary"
import { formatDistanceToNow } from "date-fns"
import { Clock, FileText, Trash2, Download, ExternalLink, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface SummaryHistoryProps {
  items: SummaryItem[]
  onRemove: (id: string) => void
  onClearAll: () => void
  onViewDetails: (item: SummaryItem) => void
}

export function SummaryHistory({ items, onRemove, onClearAll, onViewDetails }: SummaryHistoryProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    // Initialize all items as expanded by default
    items.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const toggleSummary = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No summary history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Summary History</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Toggle all summaries
              const allExpanded = Object.values(expandedItems).every((v) => v)
              const newState = !allExpanded
              const newExpandedItems = items.reduce((acc, item) => ({ ...acc, [item.id]: newState }), {})
              setExpandedItems(newExpandedItems)
            }}
          >
            {Object.values(expandedItems).every((v) => v) ? "Collapse All" : "Expand All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden border-accent">
            <div className="p-4 bg-accent/50 flex justify-between items-start border-b border-accent">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/20 rounded mt-1">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{item.pdfName}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                    <span className="mx-2">•</span>
                    <span>{formatFileSize(item.pdfSize)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toggleSummary(item.id)}
                >
                  {expandedItems[item.id] ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Hide Summary</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show Summary</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} aria-label="Remove summary">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedItems[item.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="p-5">
                    <div className="mb-4">
                      <h5 className="font-semibold text-foreground mb-2">Summary:</h5>
                      <div className="bg-muted p-4 rounded-md border border-accentwhitespace-pre-wrap text-foreground leading-relaxed max-h-[400px] overflow-y-auto">
                        {item.summary}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {item.pdfUrl && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => window.open(item.pdfUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = item.pdfUrl!
                              link.download = item.pdfName
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => onViewDetails(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View in Main Tab
                      </Button>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Summary History</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your summary history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClearAll} className="bg-red-900 hover:bg-red-800">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
