"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CalendarDays, Users, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react";

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed';
  area: string;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  description: string;
}

interface ElectionResponse {
  election: Election;
  candidates: Candidate[];
}

interface ElectionPageProps {
  params: {
    id: string;
  };
}

function transformElectionData(data: any): ElectionResponse {
  const election: Election = {
    id: data.election.id,
    title: data.election.title,
    description: data.election.description,
    startDate: data.election.startDate,
    endDate: data.election.endDate,
    status: data.election.status,
    area: data.election.area,
    candidates: data.candidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      description: c.description,
    }))
  };

  return {
    election,
    candidates: election.candidates 
  };
}


export default function ElectionPage({ params }: { params: { id: string } }) {
  
  const [electionData, setElectionData] = useState<ElectionResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchElection() {
      try {
        const response = await fetch(`http://localhost:3000/elections/${params.id}`,{
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch election data');
        }
        const data = await response.json();
        const election = transformElectionData(data);
        setElectionData(election);
      } catch (err : any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchElection();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!electionData) return <div>No election data found</div>;

  const { election, candidates } = electionData;
  return (
    <DashboardShell>
      <DashboardHeader heading={election.title} text={election.description}>
        <div className="flex items-center gap-2">
          <Badge variant="default">Active</Badge>
          <Link href="/dashboard/voter">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Election Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Start Date: {election.startDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>End Date: {election.endDate}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Total Candidates: {election.candidates.length}</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Blockchain Verified: Yes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Candidates</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {election.candidates.map((candidate) => (
          <CandidateVoteCard key={candidate.id} candidate={candidate} electionId={election.id} />
        ))}
      </div>
    </DashboardShell>
  )
}

interface Candidate {
  id: string
  name: string
  party: string
  description: string
}

function CandidateVoteCard({ candidate, electionId }: { candidate: Candidate; electionId: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{candidate.name}</CardTitle>
        <CardDescription>
          {candidate.party}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-4">{candidate.description}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/candidates/${candidate.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Link href={`/vote/${electionId}/${candidate.id}`} className="flex-1">
          <Button className="w-full">Vote</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
