import { PdfSummarizer } from "@/components/pdf-summarizer"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">PDF Summarizer</h1>
      <p className="text-center text-gray-600 mb-10">
        Upload your PDF document and get an AI-generated summary in seconds.
      </p>
      <PdfSummarizer />
    </main>
  )
}
