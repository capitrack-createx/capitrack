import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth-service";
import { useLocation } from "wouter";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [, setLocation] = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    if (!formRef.current) {
      console.error("Form ref is null");
      return;
    }
    const formData = new FormData(formRef.current);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await login(email, password)
      .then((user) => {
        if (user) {
          setLocation("/app");
        }
      })
      .catch((error) => {
        console.log(error);
        // TODO: Toast error
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input name="password" type="password" required />
        </div>
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <></>}
          Login
        </Button>
      </div>
    </form>
  );
}
