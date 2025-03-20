import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function CandidatesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Candidates" text="View all candidates in the current election">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/voter">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardHeader>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </DashboardShell>
  )
}

interface Candidate {
  id: string
  name: string
  party: string
  position: string
  bio: string
  image: string
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/9] relative">
        <Image src={candidate.image || "/placeholder.svg"} alt={candidate.name} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle>{candidate.name}</CardTitle>
        <CardDescription>
          {candidate.party} • {candidate.position}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-4">{candidate.bio}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/candidates/${candidate.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

// Sample candidate data
const candidates = [
  {
    id: "1",
    name: "Jane Smith",
    party: "Progressive Party",
    position: "President",
    bio: "Jane Smith has served as a Senator for 12 years and has championed healthcare reform and environmental protection. She aims to build a more inclusive economy and strengthen international alliances.",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "2",
    name: "John Davis",
    party: "Conservative Alliance",
    position: "President",
    bio: "John Davis is a former governor with a strong record on economic growth and job creation. His platform focuses on tax reform, border security, and reducing government regulation.",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    party: "Liberty Party",
    position: "President",
    bio: "Maria Rodriguez is a business leader and philanthropist who advocates for education reform and technological innovation. She believes in creating opportunities for all Americans through entrepreneurship.",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "4",
    name: "Robert Johnson",
    party: "Unity Coalition",
    position: "President",
    bio: "Robert Johnson is a civil rights attorney and community organizer. His campaign emphasizes social justice, police reform, and addressing economic inequality through targeted investments.",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "5",
    name: "Sarah Williams",
    party: "Green Future",
    position: "President",
    bio: "Sarah Williams is an environmental scientist and activist. Her platform centers on climate action, renewable energy transition, and sustainable agriculture to ensure a livable planet for future generations.",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "6",
    name: "Michael Chen",
    party: "Innovation Party",
    position: "President",
    bio: "Michael Chen is a tech entrepreneur and former city mayor. He advocates for modernizing government services, investing in STEM education, and preparing the workforce for the digital economy.",
    image: "/placeholder.svg?height=300&width=500",
  },
]

