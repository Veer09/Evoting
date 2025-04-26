import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Vote, Users, Award, ShieldCheck } from "lucide-react";
import Nav from "@/components/nav";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Vote className="h-6 w-6" />
            <span className="text-xl font-bold">EVote</span>
          </div>
          <Nav />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Secure Decentralized E-Voting
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  A blockchain-based voting system ensuring transparency,
                  security, and trust in the electoral process.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login/voter">
                  <Button size="lg">Vote Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Secure & Transparent</CardTitle>
                  <CardDescription>
                    Blockchain technology ensures tamper-proof voting records
                    and complete transparency.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Accessible Voting</CardTitle>
                  <CardDescription>
                    Vote from anywhere with internet access while maintaining
                    security and privacy.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Award className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Verifiable Results</CardTitle>
                  <CardDescription>
                    Instantly verify election results with cryptographic proof
                    of vote integrity.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EVote. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
