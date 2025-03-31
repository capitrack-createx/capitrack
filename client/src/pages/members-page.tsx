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
import { Member } from "../types";

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Omit<Member, 'id'>>({
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const onSubmit = async (data: Omit<Member, 'id'>) => {
    setIsLoading(true);
    try {
      // Create a new member with a temporary ID
      const newMember: Member = {
        ...data,
        id: Date.now().toString(), // Using timestamp as temporary ID
        orgId: 'temp-org-id',
        createdAt: new Date(),
        role: 'MEMBER',
      };
      
      // Add to local state
      setMembers(prevMembers => [...prevMembers, newMember]);
      form.reset();
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Member List Section */}
          <div className="w-full lg:flex-1">
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
                    <div key={member.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                      <div className="truncate">{member.name || '-'}</div>
                      <div className="truncate">{member.email || '-'}</div>
                      <div className="truncate">{member.phoneNumber || '-'}</div>
                      <div>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</div>
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

          {/* Add Member Card */}
          <Card className="w-full lg:w-[400px]">
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
                  className="space-y-4 flex flex-col items-center"
                >
                  <div className="w-full space-y-4">
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
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(123) 456-7890"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-center w-full">
                    <Button 
                      disabled={isLoading} 
                      type="submit"
                      className="w-full bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}