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
import { Member } from "@shared/types";
import { dbService } from "@/services/db-service";
import { useAuth } from "@/services/auth-service";
import { useOrganization } from "@/context/OrganizationContext";
import { InsertMember, InsertMemberSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const form = useForm<InsertMember>({
    resolver: zodResolver(InsertMemberSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      role: "MEMBER",
      name: "",
      orgId: organization!.id,
      createdAt: new Date(),
    },
  });

  const loadMembers = async () => {
    if (!user || !organization) return;
    const membersList = await dbService.getMembers(organization.id);
    setMembers(membersList);
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  const onSubmit = async (data: InsertMember) => {
    if (!user || !organization) return;
    setIsLoading(true);
    try {
      dbService
        .addMember(data)
        .then(() => {
          form.reset();
          loadMembers();
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    } catch (error) {
      console.error("Error adding member:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>

        {/* Add Member Card */}
        <Card className="p-6">
          <div className="text-center mb-4">
            <h2 className="font-semibold">Add New Member</h2>
            <p className="text-muted-foreground mt-1">Add a new member to your organization</p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="mt-1.5 h-12 bg-white" {...field} />
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
                      <FormLabel className="font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="mt-1.5 h-12 bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(123) 456-7890"
                          className="mt-1.5 h-12 bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="h-9 px-6 bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white rounded-[10px] text-sm font-medium"
                >
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
        </Card>

        {/* Member List Section */}
        <div className="w-full">
          <div className="text-left mb-4">
            <h2 className="text-lg font-semibold">Member List</h2>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <div className="min-w-[600px] lg:min-w-0">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium">
                <div>Name</div>
                <div>Email</div>
                <div>Phone</div>
                <div>Join Date</div>
                <div>Status</div>
              </div>
              <div className="divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50"
                  >
                    <div className="truncate">{member.name || "-"}</div>
                    <div className="truncate">{member.email || "-"}</div>
                    <div className="truncate">{member.phoneNumber || "-"}</div>
                    <div>
                      {member.createdAt
                        ? member.createdAt.toDate().toISOString().split("T")[0]
                        : "-"}
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No members found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
