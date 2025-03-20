"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vote } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VoterLoginPage() {
  const [voterId, setVoterId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("requestOTP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleRequestOTP = async (e : any) => {
    console.log('In frontend');
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      console.log('in func');
      const response = await fetch("http://localhost:3000/requestOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      let successMsg = "OTP sent successfully! ";
      if (data.sentToEmail) {
        successMsg += "Please check your email. ";
      }
      if (data.sentToPhone) {
        successMsg += "Please check your phone for SMS. ";
      }
      
      setSuccessMessage(successMsg);
      setStep("verifyOTP");
    } catch (err : any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e : any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId, otp }),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      router.push("/dashboard/voter");
    } catch (err : any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("requestOTP");
    setOtp("");
    setSuccessMessage("");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2">
        <Vote className="h-6 w-6" />
        <span className="font-bold">EVote</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Voter Login</CardTitle>
          <CardDescription>
            {step === "requestOTP" 
              ? "Enter your Voter ID to receive an OTP" 
              : "Enter the OTP sent to your email/phone"}
          </CardDescription>
        </CardHeader>
        {step === "requestOTP" ? (
          <form onSubmit={handleRequestOTP}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <Input
                  id="voterId"
                  placeholder="Enter your Voter ID"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Request OTP"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertTitle>OTP Sent</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">Enter OTP</Label>
                </div>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Back
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}