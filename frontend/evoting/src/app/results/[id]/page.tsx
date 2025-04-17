// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { DashboardHeader } from "@/components/dashboard-header";
// import { DashboardShell } from "@/components/dashboard-shell";
// import { Badge } from "@/components/ui/badge";
// import {
//   CheckCircle2,
//   ExternalLink,
//   Download,
//   Shield,
//   MapPin,
// } from "lucide-react";
// import { ElectionResults } from "@/components/election-results";
// import { VoteDistribution } from "@/components/vote-distribution";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import React from "react";

// // Mock data for different areas

// export default function ResultsPage({ params }: { params: { id: string } }) {
//   const [selectedArea, setSelectedArea] = useState("");
//   const [viewMode, setViewMode] = useState<"chart" | "map">("chart");
//   const [totalVoters, setTotalVoters] = useState(0);
//   const [areas, setAreas] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchResults() {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/results/${params.id}`,
//           {
//             method: "GET",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch election data");
//         }
//         const data = await response.json();
//         setAreas(data.areas);
//         setTotalVoters(data.results);
//       } catch (err: any) {
//         console.log(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchResults();
//   }, [params.id]);

//   // Current area data

//   return (
//     <DashboardShell>
//       <DashboardHeader
//         heading="Election Results"
//         text={`Final results for the `}
//       >
//         <div className="flex items-center gap-2">
//           <Link href="/dashboard/voter">
//             <Button variant="outline" size="sm">
//               Back to Dashboard
//             </Button>
//           </Link>
//         </div>
//       </DashboardHeader>

//       {/* Area Selector */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-2">
//           <MapPin className="h-4 w-4 text-muted-foreground" />
//           <span className="text-sm font-medium">Select Area:</span>
//           {
//             <Select value={selectedArea} onValueChange={setSelectedArea}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select area" />
//               </SelectTrigger>
//               <SelectContent>
//                 {areas.map((area, i) => (
//                   <SelectItem key={i} value={area}>
//                     {area}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           }
//         </div>
//       </div>

//       {/* Election Summary */}
//       <Card className="mb-6">
//         <CardHeader>
//           <div className="flex justify-between items-start">
//             <div>
//               {/* <CardTitle>
//                 {electionData.title} - {currentAreaData.name}
//               </CardTitle> */}
//               <CardDescription>
//                 {/*electionData.startDate} - {electionData.endDate*/}
//               </CardDescription>
//             </div>
//             <Badge variant="secondary">Completed</Badge>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-6 md:grid-cols-2">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">
//                   Total Votes Cast:
//                 </span>
//                 <span className="font-medium">
//                   {totalVoters}
//                   {/* {currentAreaData.totalVotes.toLocaleString()} */}
//                 </span>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">
//                   {/* Winner in {currentAreaData.name}: */}
//                 </span>
//                 {/* <span className="font-medium">{winner?.name}</span> */}
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">
//                   Winning Party:
//                 </span>
//                 {/* <span className="font-medium">{winner?.party}</span> */}
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">
//                   Blockchain Verified:
//                 </span>
//                 <span className="flex items-center gap-1 text-green-600">
//                   <CheckCircle2 className="h-4 w-4" />
//                   <span className="font-medium">Verified</span>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <div className="flex flex-col w-full space-y-2">
//             <div className="flex items-center text-xs text-muted-foreground">
//               <Shield className="h-4 w-4 mr-1" />

//               <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
//                 <ExternalLink className="h-3 w-3" />
//               </Button>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               These results are immutably recorded on the blockchain and cannot
//               be altered.
//             </p>
//           </div>
//         </CardFooter>
//       </Card>

//       {/* View Content based on selected mode */}
//       <>
//         {/* Vote Distribution Chart */}
//         <div className="grid gap-6 mb-6">
//           <Card>
//             <CardHeader>
//               {/* <CardTitle>Vote Distribution - {currentAreaData.name}</CardTitle> */}
//               <CardDescription>
//                 Visual representation of votes received by each candidate
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="h-[400px]">
//               {/* <VoteDistribution candidates={currentAreaData.candidates} /> */}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Detailed Results Table */}
//         <Card>
//           <CardHeader>
//             {/* <CardTitle>Detailed Results - {currentAreaData.name}</CardTitle> */}
//             <CardDescription>
//               Complete breakdown of votes by candidate
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {/* <ElectionResults candidates={currentAreaData.candidates} /> */}
//           </CardContent>
//         </Card>
//       </>
//     </DashboardShell>
//   );
// }

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
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Shield, MapPin } from "lucide-react";
import { ElectionResults } from "@/components/election-results";
import { VoteDistribution } from "@/components/vote-distribution";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for different areas

function ResultsPage({ params }: { params: { id: string } }) {
  const [selectedArea, setSelectedArea] = useState("");
  const [viewMode, setViewMode] = useState<"chart" | "map">("chart");
  const [totalVoters, setTotalVoters] = useState(0);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaResults, setAreaResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(
          `http://localhost:3000/results/${params.id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch election data");
        }
        const data = await response.json();
        setAreas(data.areas);
        setTotalVoters(data.results);

        // Set default selected area if areas are available
        if (data.areas && data.areas.length > 0 && !selectedArea) {
          setSelectedArea(data.areas[0]);
        }
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [params.id]);

  // Add a new useEffect to fetch results by area when selectedArea changes
  useEffect(() => {
    async function fetchAreaResults() {
      if (!selectedArea) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/getResultsByArea/${params.id}`,
          {
            method: "POST", // Changed from GET to POST
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ area: selectedArea }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch area results");
        }
        const data = await response.json();
        setAreaResults(data.results);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (selectedArea) {
      fetchAreaResults();
    }
  }, [selectedArea, params.id]);

  // Current area data

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Election Results"
        text={`Final results for the `}
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
          {
            <Select value={selectedArea} onValueChange={setSelectedArea}>
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
            </Select>
          }
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
                {/*electionData.startDate} - {electionData.endDate*/}
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
                  {totalVoters.toLocaleString()}
                </span>
              </div>
              {selectedArea && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Selected Area:
                  </span>
                  <span className="font-medium">{selectedArea}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {areaResults && areaResults.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Winner in {selectedArea}:
                    </span>
                    <span className="font-medium">
                      {areaResults.sort((a, b) => b.votes - a.votes)[0]?.name ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Winning Party:
                    </span>
                    <span className="font-medium">
                      {areaResults.sort((a, b) => b.votes - a.votes)[0]
                        ?.party || "N/A"}
                    </span>
                  </div>
                </>
              )}
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
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading...</p>
                </div>
              ) : areaResults && areaResults.length > 0 ? (
                <VoteDistribution candidates={areaResults} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Select an area to view vote distribution</p>
                </div>
              )}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p>Loading...</p>
              </div>
            ) : areaResults && areaResults.length > 0 ? (
              <ElectionResults candidates={areaResults} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p>Select an area to view detailed results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    </DashboardShell>
  );
}

export default ResultsPage;
