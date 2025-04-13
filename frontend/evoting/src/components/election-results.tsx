import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  votes: number;
  percentage: number;
  image: string;
  winner: boolean;
}

interface ElectionResultsProps {
  candidates: Candidate[];
}

export function ElectionResults({ candidates }: ElectionResultsProps) {
  // Sort candidates by votes (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Rank</TableHead>
          <TableHead>Candidate</TableHead>
          <TableHead>Party</TableHead>
          <TableHead className="text-right">Votes</TableHead>
          <TableHead className="text-right">Percentage</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCandidates.map((candidate, index) => (
          <TableRow
            key={candidate.id}
            className={candidate.winner ? "bg-primary/5" : ""}
          >
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={candidate.image || "/placeholder.svg"}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className={candidate.winner ? "font-bold" : ""}>
                  {candidate.name}
                </span>
              </div>
            </TableCell>
            <TableCell>{candidate.party}</TableCell>
            <TableCell className="text-right font-mono">
              {candidate.votes.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-mono">
              {candidate.percentage.toFixed(1)}%
            </TableCell>
            <TableCell className="text-center">
              {candidate.winner ? (
                <Badge className="bg-primary text-primary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" /> Winner
                </Badge>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
