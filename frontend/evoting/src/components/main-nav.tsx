import Link from "next/link"
import { Vote } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center gap-2">
        <Vote className="h-6 w-6" />
        <span className="font-bold">EVote</span>
      </Link>
      <nav className="flex gap-6">
        <Link href="/dashboard/voter" className="text-sm font-medium transition-colors hover:text-primary">
          Dashboard
        </Link>
        <Link href="/candidates" className="text-sm font-medium transition-colors hover:text-primary">
          Candidates
        </Link>
        <Link href="/results" className="text-sm font-medium transition-colors hover:text-primary">
          Results
        </Link>
      </nav>
    </div>
  )
}

