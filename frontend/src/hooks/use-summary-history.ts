"use client"

import { useState, useEffect } from "react"
import type { SummaryItem, SummaryHistoryState } from "@/types/summary"

const STORAGE_KEY = "pdf-summarizer-history"

export function useSummaryHistory() {
  const [history, setHistory] = useState<SummaryHistoryState>({ items: [] })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY)
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    } catch (error) {
      console.error("Failed to load summary history:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error("Failed to save summary history:", error)
      }
    }
  }, [history, isLoaded])

  // Add a new summary to history
  const addSummary = (file: File, summary: string) => {
    const newItem: SummaryItem = {
      id: generateId(),
      pdfName: file.name,
      pdfSize: file.size,
      summary,
      timestamp: Date.now(),
      pdfUrl: URL.createObjectURL(file), // Create a temporary URL for the file
    }

    setHistory((prev) => ({
      items: [newItem, ...prev.items],
    }))

    return newItem
  }

  // Remove a summary from history
  const removeSummary = (id: string) => {
    setHistory((prev) => ({
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  // Clear all history
  const clearHistory = () => {
    setHistory({ items: [] })
  }

  return {
    history,
    addSummary,
    removeSummary,
    clearHistory,
    isLoaded,
  }
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
