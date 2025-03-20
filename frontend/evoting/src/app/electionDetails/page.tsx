"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { toast } from "sonner"
import { CalendarDays, User, Users } from "lucide-react"

export default function ElectionDetailsPage({ params }) {
  const router = useRouter()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const { id } = params

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/elections/${id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 403) {
            toast.error("Access denied. Please login as committee member.")
            router.push("/login")
            return
          }
          throw new Error(errorData.error || "Failed to fetch election details")
        }

        const data = await response.json()
        setElection(data.election)
        setCandidates(data.candidates || [])
      } catch (error) {
        console.error("Error fetching election details:", error)
        toast.error("Failed to load election details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchElectionDetails()
    }
  }, [id, router])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "completed":
        return "secondary"
      default:
        return "default"
    }
  }

  const updateElectionStatus = async (newStatus) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/elections/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update election status")
      }

      const data = await response.json()
      setElection(prev => ({ ...prev, status: newStatus }))
      toast.success(`Election status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating election status:", error)
      toast.error("Failed to update election status")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardShell>
    )
  }

  if (!election) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Election Not Found" text="The requested election could not be found.">
          <Link href="/dashboard/committee">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </DashboardHeader>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={election.title} text={election.description}>
        <div className="flex gap-2">
          <Link href="/dashboard/committee">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/dashboard/committee/add-candidate">
            <Button>Add Candidate</Button>
          </Link>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Election Details</CardTitle>
              <Badge variant={getStatusBadgeVariant(election.status)}>
                {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Area</p>
                <p>{election.area}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{election.status.charAt(0).toUpperCase() + election.status.slice(1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p>{formatDate(election.startDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p>{formatDate(election.endDate)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2 w-full">
              {election.status === "pending" && (
                <Button 
                  variant="success" 
                  className="flex-1"
                  onClick={() => updateElectionStatus("active")}
                  disabled={loading}
                >
                  Activate Election
                </Button>
              )}
              
              {election.status === "active" && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => updateElectionStatus("completed")}
                  disabled={loading}
                >
                  End Election
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Candidates ({candidates.length})</CardTitle>
              <Link href="/dashboard/committee/add-candidate">
                <Button size="sm">Add Candidate</Button>
              </Link>
            </div>
            <CardDescription>
              All candidates registered for this election
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No candidates yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add candidates to this election to get started.
                </p>
                <Link href="/dashboard/committee/add-candidate" className="mt-4 inline-block">
                  <Button>Add Your First Candidate</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.party}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}