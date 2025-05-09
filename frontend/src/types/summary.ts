export interface SummaryItem {
  id: string
  pdfName: string
  pdfSize: number
  summary: string
  timestamp: number
  pdfUrl?: string // URL for the stored PDF (if we're storing it)
}

export interface SummaryHistoryState {
  items: SummaryItem[]
}
