"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { VotingHistory } from "@/components/voting-history";
import { CalendarDays, Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Election {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidateCount: number;
  _id: string;
  status: "pending" | "active" | "completed";
}

export default function VoterDashboardPage() {
  const [election, setElection] = useState<Election[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch("http://localhost:3000/elections", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch elections");
        }

        const data = await response.json();
        setElection(data.elections || []);
      } catch (err: any) {
        console.error("Error fetching elections:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Voter Dashboard"
        text="View active elections and cast your vote"
      >
        <Link href="/candidates">
          <Button>View Candidates</Button>
        </Link>
      </DashboardHeader>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Current Elections</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : election === undefined ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There are no active elections at this time.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {election.map((election: Election) => (
              <Card key={election._id}>
                <CardHeader>
                  <CardTitle>{election.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{election.description}</CardDescription>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Start Date: {formatDate(election.startDate)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>End Date: {formatDate(election.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="default">
                      {election.status === "pending"
                        ? "Pending"
                        : election.status === "active"
                        ? "Active"
                        : "Completed"}
                    </Badge>
                    {election.status === "active" ? (
                      <Link href={`/dashboard/voter/election/${election._id}`}>
                        <Button variant="outline">Vote</Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/voter/election/${election._id}`}>
                        <Button variant="outline">View Election</Button>
                      </Link>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
