import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users } from "lucide-react"

interface ElectionCardProps {
  title: string
  description: string
  status: "active" | "upcoming" | "completed"
  startDate?: string
  endDate?: string
  href: string
  isCommittee?: boolean
}

export function ElectionCard({
  title,
  description,
  status,
  startDate,
  endDate,
  href,
  isCommittee = false,
}: ElectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={status === "active" ? "default" : status === "upcoming" ? "outline" : "secondary"}>
            {status === "active" ? "Active" : status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {startDate && (
            <div className="flex items-center text-sm">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Starts: {startDate}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center text-sm">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Ends: {endDate}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Candidates: 6</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button variant="default" className="w-full">
            {status === "active"
              ? isCommittee
                ? "Manage Election"
                : "Vote Now"
              : status === "upcoming"
                ? "View Details"
                : "View Results"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

