"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CalendarDays, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


interface Election {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidateCount: number;
  _id: string;
  area : string;
  createdAt: string;
  status: 'pending' | 'active' | 'completed';
}

export default function CommitteeDashboardPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch("http://localhost:3000/elections", {
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
          throw new Error(errorData.error || "Failed to fetch elections")
        }

        const data = await response.json()
        let activeElection = data.elections.find((election : Election) => election.status === "active")
        if (activeElection) {
          setIsActive(true)
        }
        setElections(data.elections || [])
      } catch (error) {
        console.error("Error fetching elections:", error)
        toast.error("Failed to load elections")
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [router])

  const getStatusBadgeVariant = (status : string) => {
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

  const formatDate = (dateString : string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const updateElectionStatus = async (id : string, newStatus : any) => {
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
      if(newStatus === "active") {
        setIsActive(true);
      }
      else{
        setIsActive(false);
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update election status")
      }

      setElections((prevElections) =>
        prevElections.map((election) =>
          election._id === id ? { ...election, status: newStatus } : election
        )
      );
      

    } catch (error : any) {
      console.error("Error updating election status:", error)
      toast(error || "Failed to update election status");
        
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Election Committee Dashboard" text="Manage elections and candidates">
        <div className="flex gap-2">
          <Link href="/dashboard/committee/create-election">
            { !isActive && <Button variant="outline">Configure Election</Button> }
          </Link>
          <Link href="/dashboard/committee/add-candidate">
            <Button>Add Candidate</Button>
          </Link>
        </div>
      </DashboardHeader>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Elections</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : elections.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No elections configured yet.</p>
                <Link href="/dashboard/committee/create-election" className="mt-4 inline-block">
                  <Button>Create Your First Election</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={election._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(election.status)}>
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Dates: {formatDate(election.startDate)} - {formatDate(election.endDate)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Area: {election.area}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Link href={`/dashboard/committee/elections/${election._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  
                  {election.status === "pending" && (
                    <Button 
                      className="flex-1"
                      onClick={() => updateElectionStatus(election._id, "active")}
                      disabled={loading}
                    >
                      Activate Election
                    </Button>
                  )}
                  
                  {election.status === "active" && (
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => updateElectionStatus(election._id, "completed")}
                      disabled={loading}
                    >
                      End Election
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  )
}