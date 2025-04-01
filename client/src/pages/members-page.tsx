import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Member } from "../../../shared/types";
import { dbService } from "@/services/db-service";
import { useAuth } from "@/services/auth-service";

export function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Omit<Member, "id">>({
    defaultValues: {
      role: "MEMBER",
    },
  });

  const loadMembers = async () => {
    if (!user) return;
    const org = await dbService.getUserOrganization(user.uid);
    if (org) {
      const membersList = await dbService.getMembers(org.id);
      setMembers(membersList);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  const onSubmit = async (data: Omit<Member, "id">) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const org = await dbService.getUserOrganization(user.uid);
      if (org) {
        await dbService.addMember({
          ...data,
          orgId: org.id,
        });
        await loadMembers();
        form.reset();
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
            <CardDescription>
              Add a new member to your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button disabled={isLoading} type="submit">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Member
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="capitalize text-muted-foreground">
                    {member.role}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
