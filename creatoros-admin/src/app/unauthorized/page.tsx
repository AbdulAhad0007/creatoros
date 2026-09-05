import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You do not have the necessary administrator privileges to access this portal. If you believe this is an error, please contact the system administrator.
      </p>
      
      <div className="flex gap-4">
        <form action="/auth/logout" method="post">
            <Button type="submit" variant="outline">Sign Out</Button>
        </form>
        <Link href="http://localhost:3000/dashboard">
          <Button>Return to App</Button>
        </Link>
      </div>
    </div>
  )
}
