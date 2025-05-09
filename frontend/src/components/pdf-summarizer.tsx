"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { SummaryDisplay } from "./summary-display"
import { SummaryHistory } from "./summary-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { summarizePdf } from "@/app/actions/summarize-pdf"
import { useSummaryHistory } from "@/hooks/use-summary-history"
import type { SummaryItem } from "@/types/summary"

export function PdfSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("summarize")
  const { history, addSummary, removeSummary, clearHistory } = useSummaryHistory()

  const handleFileChange = (uploadedFile: File | null) => {
    setFile(uploadedFile)
    setSummary("")
    setError(null)
  }

  const handleSummarize = async () => {
    if (!file) {
      setError("Please upload a PDF file first")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("pdf", file)

      const result = await summarizePdf(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSummary(result.summary)
        // Add to history
        addSummary(file, result.summary)
      }
    } catch (err) {
      setError("An error occurred while summarizing the PDF. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function inside the PdfSummarizer component
  const handleViewDetails = (item: SummaryItem) => {
    // Create a File object from the URL if available
    if (item.pdfUrl) {
      fetch(item.pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], item.pdfName, { type: "application/pdf" })
          setFile(file)
        })
        .catch((err) => {
          console.error("Error loading file from URL:", err)
        })
    }

    setSummary(item.summary)
    setActiveTab("summarize")
  }

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summarize">Summarize PDF</TabsTrigger>
          <TabsTrigger value="history" className="relative">
            History
            {history.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {history.items.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summarize" className="mt-6">
          <FileUploader file={file} onFileChange={handleFileChange} />

          <div className="flex justify-center mt-6">
            <Button onClick={handleSummarize} disabled={!file || isLoading} className="px-8">
              {isLoading ? "Summarizing..." : "Summarize PDF"}
            </Button>
          </div>

          {error && <div className="p-4 mt-6 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

          {summary && <SummaryDisplay summary={summary} />}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SummaryHistory
            items={history.items}
            onRemove={removeSummary}
            onClearAll={clearHistory}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
