"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ExternalLink,
  Download,
  Shield,
  MapPin,
} from "lucide-react";
import { ElectionResults } from "@/components/election-results";
import { VoteDistribution } from "@/components/vote-distribution";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

// Mock data for different areas
const areaData = {
  national: {
    name: "National",
    totalVotes: 8721,
    registeredVoters: 12345,
    turnout: "70.6%",
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
  },
  north: {
    name: "Northern Region",
    totalVotes: 2543,
    registeredVoters: 3500,
    turnout: "72.7%",
    candidates: [
      {
        id: "1",
        name: "Jane Smith",
        party: "Progressive Party",
        position: "President",
        votes: 1245,
        percentage: 49.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: true,
      },
      {
        id: "2",
        name: "John Davis",
        party: "Conservative Alliance",
        position: "President",
        votes: 876,
        percentage: 34.4,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "3",
        name: "Maria Rodriguez",
        party: "Liberty Party",
        position: "President",
        votes: 254,
        percentage: 10.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "4",
        name: "Robert Johnson",
        party: "Unity Coalition",
        position: "President",
        votes: 98,
        percentage: 3.9,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "5",
        name: "Sarah Williams",
        party: "Green Future",
        position: "President",
        votes: 45,
        percentage: 1.8,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "6",
        name: "Michael Chen",
        party: "Innovation Party",
        position: "President",
        votes: 25,
        percentage: 1.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
    ],
  },
  south: {
    name: "Southern Region",
    totalVotes: 2100,
    registeredVoters: 3200,
    turnout: "65.6%",
    candidates: [
      {
        id: "1",
        name: "Jane Smith",
        party: "Progressive Party",
        position: "President",
        votes: 545,
        percentage: 26.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "2",
        name: "John Davis",
        party: "Conservative Alliance",
        position: "President",
        votes: 1076,
        percentage: 51.2,
        image: "/placeholder.svg?height=300&width=500",
        winner: true,
      },
      {
        id: "3",
        name: "Maria Rodriguez",
        party: "Liberty Party",
        position: "President",
        votes: 254,
        percentage: 12.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "4",
        name: "Robert Johnson",
        party: "Unity Coalition",
        position: "President",
        votes: 145,
        percentage: 6.9,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "5",
        name: "Sarah Williams",
        party: "Green Future",
        position: "President",
        votes: 55,
        percentage: 2.6,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "6",
        name: "Michael Chen",
        party: "Innovation Party",
        position: "President",
        votes: 25,
        percentage: 1.2,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
    ],
  },
  east: {
    name: "Eastern Region",
    totalVotes: 2178,
    registeredVoters: 3045,
    turnout: "71.5%",
    candidates: [
      {
        id: "1",
        name: "Jane Smith",
        party: "Progressive Party",
        position: "President",
        votes: 755,
        percentage: 34.7,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "2",
        name: "John Davis",
        party: "Conservative Alliance",
        position: "President",
        votes: 524,
        percentage: 24.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "3",
        name: "Maria Rodriguez",
        party: "Liberty Party",
        position: "President",
        votes: 546,
        percentage: 25.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: true,
      },
      {
        id: "4",
        name: "Robert Johnson",
        party: "Unity Coalition",
        position: "President",
        votes: 233,
        percentage: 10.7,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "5",
        name: "Sarah Williams",
        party: "Green Future",
        position: "President",
        votes: 87,
        percentage: 4.0,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "6",
        name: "Michael Chen",
        party: "Innovation Party",
        position: "President",
        votes: 33,
        percentage: 1.5,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
    ],
  },
  west: {
    name: "Western Region",
    totalVotes: 1900,
    registeredVoters: 2600,
    turnout: "73.1%",
    candidates: [
      {
        id: "1",
        name: "Jane Smith",
        party: "Progressive Party",
        position: "President",
        votes: 700,
        percentage: 36.8,
        image: "/placeholder.svg?height=300&width=500",
        winner: true,
      },
      {
        id: "2",
        name: "John Davis",
        party: "Conservative Alliance",
        position: "President",
        votes: 400,
        percentage: 21.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "3",
        name: "Maria Rodriguez",
        party: "Liberty Party",
        position: "President",
        votes: 200,
        percentage: 10.5,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "4",
        name: "Robert Johnson",
        party: "Unity Coalition",
        position: "President",
        votes: 400,
        percentage: 21.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "5",
        name: "Sarah Williams",
        party: "Green Future",
        position: "President",
        votes: 134,
        percentage: 7.1,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
      {
        id: "6",
        name: "Michael Chen",
        party: "Innovation Party",
        position: "President",
        votes: 66,
        percentage: 3.5,
        image: "/placeholder.svg?height=300&width=500",
        winner: false,
      },
    ],
  },
};

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [selectedArea, setSelectedArea] = useState("");
  const [viewMode, setViewMode] = useState<"chart" | "map">("chart");
  const [totalVoters, setTotalVoters] = useState(0);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const electionData = {
    title: "Presidential Election 2024",
    status: "completed",
    startDate: "May 1, 2024",
    endDate: "May 15, 2024",
    blockchainVerified: true,
    blockHash: "0x8f5b85b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  };

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`http://localhost:3000/results/${params.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch election data");
        }
        const data = await response.json();
        setAreas(data.areas);
        setTotalVoters(data.results);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [params.id]);

  // Current area data

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Election Results"
        text={`Final results for the ${electionData.title}`}
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard/voter">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Area Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Select Area:</span>
          {/* <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area, i) => (
                <SelectItem key={i} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
      </div>

      {/* Election Summary */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {/* <CardTitle>
                {electionData.title} - {currentAreaData.name}
              </CardTitle> */}
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
                <span className="text-sm text-muted-foreground">
                  Total Votes Cast:
                </span>
                <span className="font-medium">
                  {totalVoters}
                  {/* {currentAreaData.totalVotes.toLocaleString()} */}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {/* Winner in {currentAreaData.name}: */}
                </span>
                {/* <span className="font-medium">{winner?.name}</span> */}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Winning Party:
                </span>
                {/* <span className="font-medium">{winner?.party}</span> */}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Blockchain Verified:
                </span>
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
              These results are immutably recorded on the blockchain and cannot
              be altered.
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* View Content based on selected mode */}
      <>
        {/* Vote Distribution Chart */}
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              {/* <CardTitle>Vote Distribution - {currentAreaData.name}</CardTitle> */}
              <CardDescription>
                Visual representation of votes received by each candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {/* <VoteDistribution candidates={currentAreaData.candidates} /> */}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader>
            {/* <CardTitle>Detailed Results - {currentAreaData.name}</CardTitle> */}
            <CardDescription>
              Complete breakdown of votes by candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* <ElectionResults candidates={currentAreaData.candidates} /> */}
          </CardContent>
        </Card>
      </>
    </DashboardShell>
  );
}
