import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/AnimatedPage";

export default function NotFound() {
  return (
    <AnimatedPage>
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <AlertCircle className="h-16 w-16 text-primary/60" />
          <h1 className="text-4xl font-bold font-serif text-foreground">404</h1>
          <p className="text-muted-foreground text-lg">That page doesn't exist.</p>
          <Button asChild className="rounded-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
