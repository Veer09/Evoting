"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function VotePage({
  params,
}: {
  params: { electionId: string; candidateId: string }
}) {
  const [votingState, setVotingState] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [candidate, setCandidate] = useState<any>(null)
  const [election, setElection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const candidateRes = await fetch(`http://localhost:3000/candidates/${params.candidateId}`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        if (!candidateRes.ok) {
          throw new Error("Failed to fetch candidate data")
        }
        const candidateData = await candidateRes.json()
        setCandidate(candidateData.candidate)

        const electionRes = await fetch(`http://localhost:3000/elections/${params.electionId}`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        if (!electionRes.ok) {
          throw new Error("Failed to fetch election data")
        }
        const electionData = await electionRes.json()
        setElection(electionData.election)

        setLoading(false)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "An error occurred while loading data")
        setLoading(false)
      }
    }

    fetchData()
  }, [params.candidateId, params.electionId])

  const handleVote = async () => {
    setVotingState("processing")
    try {
      const res = await fetch("http://localhost:3000/castVote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          electionId: params.electionId,
          candidateId: params.candidateId,
        }),
      })
      if (!res.ok) {
        throw new Error("Voting failed")
      }
      setVotingState("success")
    } catch (err) {
      console.error(err)
      setVotingState("error")
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <p>Loading data...</p>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <p className="text-red-600">{error}</p>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Confirm Your Vote" text={election.title}>
        <Link href={`/election/${params.electionId}`}>
          <Button variant="outline">Back to Election</Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selected Candidate</CardTitle>
            <CardDescription>Please review your selection before confirming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div>
                <h3 className="text-lg font-bold">{candidate.name}</h3>
                <p className="text-muted-foreground">{candidate.description}</p>
                <p className="text-muted-black">{candidate.party}</p>
                <p className="text-muted-foreground">{candidate.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voting Information</CardTitle>
            <CardDescription>Your vote will be recorded on the blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Election</h3>
              <p>{election.title}</p>
            </div>

            {votingState === "success" && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Vote Successful!</AlertTitle>
                <AlertDescription>
                  Your vote has been recorded on the blockchain. Transaction hash: 0x1a2b...3c4d
                </AlertDescription>
              </Alert>
            )}

            {votingState === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an error processing your vote. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            {votingState === "idle" && (
              <Button onClick={handleVote} className="w-full">
                Confirm Vote
              </Button>
            )}

            {votingState === "processing" && (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </Button>
            )}

            {votingState === "success" && (
              <Link href="/dashboard/voter" className="w-full">
                <Button className="w-full">Return to Dashboard</Button>
              </Link>
            )}

            {votingState === "error" && (
              <Button onClick={handleVote} variant="outline" className="w-full">
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
