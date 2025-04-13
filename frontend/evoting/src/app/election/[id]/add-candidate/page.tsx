"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { toast } from "sonner";

export default function AddCandidatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    phoneNumber: "",
    area: "",
    city: "",
    email: "",
    state: "",
    description: "",
    country: "India",
  });

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAreaChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      area: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/addCandidate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData , electionId: params.id}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          toast.error("Access denied. Please login as committee member.");
          router.push("/login/committee");
          return;
        }
        throw new Error(errorData.error || "Failed to add candidate");
      }

      const data = await response.json();
      toast.success("Candidate added successfully", {
        description:
          data.message || "The candidate has been added to the election.",
      });

      setFormData({
        name: "",
        party: "",
        phoneNumber: "",
        area: "",
        city: "",
        email: "",
        state: "",
        description: "",
        country: "India",
      });

      router.push("/dashboard/committee");
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      toast.error(error.message || "Failed to add candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Candidate"
        text="Add a new candidate to an election"
      >
        <Link href="/dashboard/committee">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>
              Enter the details of the candidate you want to add to the current
              election.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter candidate's full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party">Political Party</Label>
                <Input
                  id="party"
                  placeholder="Enter political party"
                  value={formData.party}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter candidate description"
                  type="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Electoral Area</Label>
                <Input
                  id="area"
                  placeholder="Enter electoral area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Candidate..." : "Add Candidate"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
