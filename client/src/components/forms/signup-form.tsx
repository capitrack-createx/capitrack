import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertUser, InsertUserSchema } from "@shared/schema";
import { signUp } from "@/services/auth-service";
import { useLocation } from "wouter";
import { createUserDocument } from "@/services/user-service";
import { dbService } from "@/services/db-service";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<InsertUser>({
    resolver: zodResolver(InsertUserSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const onSubmit = async (data: InsertUser) => {
    setIsLoading(true);
    signUp(data)
      .then((user) => {
        createUserDocument(data, user.uid)
          .then(async () => {
            try {
              const org = await dbService.createOrganization({
                name: data.organizationName,
                ownerId: user.uid,
                createdAt: new Date(),
              });
              // Add user as admin member
              await dbService.addMember({
                name: data.name,
                email: data.email,
                orgId: org.id,
                role: "ADMIN",
              });
              // 4. Redirect to dashboard page
              if (user) {
                setLocation("/app");
              }
            } catch (orgError) {
              console.log("Error creating organization", orgError);
              setIsLoading(false);
              user.delete();
            }
          })
          .catch((dbError) => {
            console.log("Error creating user document", dbError);

            setIsLoading(false);
            user.delete();
          });
      })
      .catch((authError) => {
        console.log("Error creating user:", authError);
        setIsLoading(false);
        // TODO: Toast sign up error
      });
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-bold">Create a capitrack account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your information below
          </p>
        </div>

        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="George Burdell" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(123) 456-7890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Organization Name"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <></>}
            Sign Up
          </Button>
        </div>
      </form>
    </Form>
  );
}
