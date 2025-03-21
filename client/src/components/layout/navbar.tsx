// src/components/Navbar.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button"; // from shadcn UI (or your custom button)

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-background shadow-md">
      {/* Left side: Logo & Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link href="/">
          <span className="text-3xl font-bold cursor-pointer">Capitrack</span>
        </Link>
      </div>

      {/* Right side: Actions (e.g., Login button) */}
      <div className="flex space-x-4">
        <Link href="/auth?mode=login">
          <Button variant="outline" size={"lg"} className="text-2x1">Login</Button>
        </Link>

        <Link href="/auth?mode=sign-up">
          <Button variant="outline" size={"lg"} className="text-2x1">Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}
