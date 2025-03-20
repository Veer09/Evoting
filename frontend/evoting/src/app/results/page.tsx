import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ExternalLink, Download, Shield } from "lucide-react"
import { ElectionResults } from "@/components/election-results"
import { VoteDistribution } from "@/components/vote-distribution"

export default function ResultsPage() {
  // In a real app, you would fetch the election results from your API or blockchain
  const electionData = {
    title: "Presidential Election 2024",
    status: "completed",
    totalVotes: 8721,
    registeredVoters: 12345,
    turnout: "70.6%",
    startDate: "May 1, 2024",
    endDate: "May 15, 2024",
    blockchainVerified: true,
    blockHash: "0x8f5b85b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    candidates: [
      {
        id: "1",
        name: "Jane Smith",
        party: "Progressive Party",
        position: "President",
        votes: 3245,
        percentage: 37.2,
        image: "/placeholder.svg?height=300&width=500",
        winner: true,
      },
      {
        id: "2",
        name: "John Davis",
        party: "Conservative Alliance",
        position: "President",
        votes: 2876,
        percentage: 33.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "3",
        name: "Maria Rodriguez",
        party: "Liberty Party",
        position: "President",
        votes: 1254,
        percentage: 14.4,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "4",
        name: "Robert Johnson",
        party: "Unity Coalition",
        position: "President",
        votes: 876,
        percentage: 10.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "5",
        name: "Sarah Williams",
        party: "Green Future",
        position: "President",
        votes: 321,
        percentage: 3.7,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "6",
        name: "Michael Chen",
        party: "Innovation Party",
        position: "President",
        votes: 149,
        percentage: 1.7,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
    ],
  }

  // Find the winner
  const winner = electionData.candidates.find((candidate) => candidate.winner)

  return (
    <DashboardShell>
      <DashboardHeader heading="Election Results" text={`Final results for the ${electionData.title}`}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Link href="/dashboard/voter">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Election Summary */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{electionData.title}</CardTitle>
              <CardDescription>
                {electionData.startDate} - {electionData.endDate}
              </CardDescription>
            </div>
            <Badge variant="secondary">Completed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Votes Cast:</span>
                <span className="font-medium">{electionData.totalVotes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Registered Voters:</span>
                <span className="font-medium">{electionData.registeredVoters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Voter Turnout:</span>
                <span className="font-medium">{electionData.turnout}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Winner:</span>
                <span className="font-medium">{winner?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Winning Party:</span>
                <span className="font-medium">{winner?.party}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Blockchain Verified:</span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Verified</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Shield className="h-4 w-4 mr-1" />
              <span>Blockchain Hash: </span>
              <code className="ml-1 font-mono">{electionData.blockHash}</code>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              These results are immutably recorded on the blockchain and cannot be altered.
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Vote Distribution Chart */}
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
            <CardDescription>Visual representation of votes received by each candidate</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <VoteDistribution candidates={electionData.candidates} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Complete breakdown of votes by candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <ElectionResults candidates={electionData.candidates} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

