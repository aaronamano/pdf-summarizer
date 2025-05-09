"use server"

export async function summarizePdf(formData: FormData) {
  try {
    const file = formData.get("pdf") as File

    if (!file) {
      return { error: "No PDF file provided" }
    }

    // For demonstration purposes, we'll simulate the AI processing
    // In a real application, you would use a PDF parsing library and AI model

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a slightly different summary each time to demonstrate the history feature
    const topics = [
      "artificial intelligence and machine learning",
      "blockchain technology and cryptocurrencies",
      "climate change and sustainability",
      "remote work and digital transformation",
      "healthcare innovation and telemedicine",
    ]

    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    const randomPages = Math.floor(Math.random() * 20) + 5

    const mockSummary = `# Summary of "${file.name}" (${randomPages} pages)

## Overview
This document provides a comprehensive analysis of ${randomTopic} and its implications for various industries. The author presents a well-researched perspective on current trends and future developments.

## Key Points

1. **Current State of ${randomTopic.split(" ")[0]} Technology**
   The document begins with an assessment of where ${randomTopic} stands today, highlighting recent breakthroughs and adoption rates across different sectors. Several case studies demonstrate successful implementation strategies.

2. **Challenges and Limitations**
   The author acknowledges several obstacles to wider adoption, including technical limitations, regulatory concerns, and organizational resistance to change. The document provides a balanced view of both opportunities and challenges.

3. **Future Outlook**
   The final section offers predictions for how ${randomTopic} will evolve over the next 5-10 years, with specific attention to emerging use cases and potential disruptions to traditional business models.

## Conclusion
The document concludes that organizations should develop strategic approaches to ${randomTopic} with a focus on long-term value creation rather than short-term gains. It emphasizes the importance of ethical considerations and responsible implementation.`

    return { summary: mockSummary }
  } catch (error) {
    console.error("Error processing PDF:", error)
    return { error: "Failed to process the PDF file" }
  }
}
