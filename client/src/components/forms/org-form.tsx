import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Organization, OrganizationSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function OrganizationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Organization>({
    resolver: zodResolver(OrganizationSchema),
  });
  const onSubmit = async (data: Organization) => {
    setIsLoading(true);
    console.log(data);
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-bold">Register your Organization</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in information below
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
                  <Input {...field} placeholder="Your Organization" />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your Organization"
                      {...field}
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
            Register
          </Button>
        </div>
      </form>
    </Form>
  );
}
