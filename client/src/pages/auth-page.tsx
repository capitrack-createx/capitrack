import { ArrowLeft, PiggyBankIcon } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { useState } from "react";
import { SignUpForm } from "@/components/forms/signup-form";
import { Button } from "@/components/ui/button";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <PiggyBankIcon className="size-4" />
            </div>
            capitrack
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {isLogin ? (
              <LoginForm />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full mb-4 flex">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLogin(true)}
                  >
                    <ArrowLeft />
                    Back
                  </Button>
                </div>
                <SignUpForm className="w-full" />
              </div>
            )}

            {isLogin ? (
              <div className="text-center text-sm mt-2">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="underline underline-offset-4"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </a>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
