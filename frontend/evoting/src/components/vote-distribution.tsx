"use client"

import { useEffect, useRef } from "react"

interface Candidate {
  id: string
  name: string
  party: string
  votes: number
  percentage: number
  winner: boolean
}

interface VoteDistributionProps {
  candidates: Candidate[]
}

export function VoteDistribution({ candidates }: VoteDistributionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sort candidates by votes (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes)

  // Generate colors for each candidate
  const colors = [
    "#4361ee", // Primary blue
    "#3a0ca3", // Deep purple
    "#7209b7", // Purple
    "#f72585", // Pink
    "#4cc9f0", // Light blue
    "#4f772d", // Green
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate total votes
    const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + candidate.votes, 0)

    // Draw bar chart
    const barWidth = Math.min(60, (rect.width - 100) / sortedCandidates.length - 20)
    const maxBarHeight = rect.height - 100
    const startX = 50

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(startX, rect.height - 50)
    ctx.lineTo(rect.width - 20, rect.height - 50)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw bars
    sortedCandidates.forEach((candidate, index) => {
      const x = startX + index * (barWidth + 20) + 10
      const barHeight = (candidate.votes / totalVotes) * maxBarHeight
      const y = rect.height - 50 - barHeight

      // Draw bar
      ctx.fillStyle = colors[index % colors.length]
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw percentage on top of bar
      ctx.fillStyle = "#000000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${candidate.percentage.toFixed(1)}%`, x + barWidth / 2, y - 10)

      // Draw candidate name below bar
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      // Truncate name if too long
      let displayName = candidate.name
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 8) + "..."
      }

      ctx.fillText(displayName, x + barWidth / 2, rect.height - 35)

      // Draw vote count
      ctx.fillStyle = "#000000"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(candidate.votes.toLocaleString(), x + barWidth / 2, rect.height - 20)

      // Highlight winner
      if (candidate.winner) {
        ctx.beginPath()
        ctx.moveTo(x + barWidth / 2, y - 25)
        ctx.lineTo(x + barWidth / 2, y - 15)
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = "#000000"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("WINNER", x + barWidth / 2, y - 30)
      }
    })

    // Draw y-axis labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "right"

    const yAxisSteps = 5
    for (let i = 0; i <= yAxisSteps; i++) {
      const yPos = rect.height - 50 - (i / yAxisSteps) * maxBarHeight
      const percentage = (i / yAxisSteps) * 100

      ctx.fillText(`${percentage.toFixed(0)}%`, startX - 10, yPos + 3)

      // Draw horizontal grid line
      ctx.beginPath()
      ctx.moveTo(startX, yPos)
      ctx.lineTo(rect.width - 20, yPos)
      ctx.strokeStyle = "#f3f4f6"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [sortedCandidates])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ maxHeight: "400px" }} />
    </div>
  )
}



