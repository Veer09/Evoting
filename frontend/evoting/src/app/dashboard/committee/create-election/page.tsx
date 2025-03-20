"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CreateElectionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: undefined,
    endDate: undefined,
    area: ""
  })

  const handleChange = (e: any) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleStartDateChange = (date: any) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date
    }))
  }

  const handleEndDateChange = (date: any) => {
    setFormData((prev) => ({
      ...prev,
      endDate: date
    }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select both start and end dates")
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:3000/elections", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 403) {
          toast.error("Access denied. Please login as committee member.")
          router.push("/login")
          return
        }
        throw new Error(errorData.error || "Failed to create election")
      }

      const data = await response.json()
      toast.success("Election created successfully", {
        description: "The election has been created with 'pending' status.",
      })

      // Redirect to dashboard after successful submission
      router.push("/dashboard/committee")
    } catch (error: any) {
      console.error("Error creating election:", error)
      toast.error(error.message || "Failed to create election")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Configure Election" text="Create a new election or configure an existing one">
        <Link href="/dashboard/committee">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Election Details</CardTitle>
            <CardDescription>
              Enter the details of the election you want to create.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Election Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Presidential Election 2025" 
                  value={formData.title}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter election description" 
                  className="min-h-[100px]" 
                  value={formData.description}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Electoral Area</Label>
                <Textarea 
                  id="area"
                  placeholder="Enter electoral area"
                  value={formData.area}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date: any) => 
                          formData.startDate ? date < new Date(formData.startDate) : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Election..." : "Create Election"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
