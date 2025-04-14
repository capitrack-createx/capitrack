import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Check } from "lucide-react";
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
import { Group } from "@shared/types";
import { Member } from "@shared/types";
import { dbService } from "@/services/db-service";
import { useAuth } from "@/services/auth-service";
import { useOrganization } from "@/context/OrganizationContext";
import { InsertGroup, InsertMember, InsertMemberSchema, InsertGroupSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectingMem, setSelectingMem] = useState(false);
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

  const groupForm = useForm<InsertGroup>({
    resolver: zodResolver(InsertGroupSchema),
    defaultValues: {
      size: 0,
      totalDues: 0,
      name: "",
      orgId: organization!.id,
      createdAt: new Date(),
      members: [],
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

  const onSubmitGroups = async (data: InsertGroup) => {
    if (!user || !organization) return;
    setIsLoading(true);
    try {
      dbService
        .addGroup(data)
        .then(() => {
          form.reset();
          loadGroups();
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    } catch (error) {
      console.error("Error adding group:", error);
    }
    setIsLoading(false);
  };


  const loadGroups = async () => {
    if (!user || !organization) return;
    const groupsList = await dbService.getGroups(organization.id);
    setGroups(groupsList);
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  const onSelectGroups = async () => {
    if (!user || !organization) return;
    setIsLoading(true);

  }

  return (
    <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Member List Section */}
            <div className="w-full lg:flex-1 ">
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
                        // onClick={() => selectingMem && ? }
                        background-color=""
                      >
                        <div className="truncate">{member.name || "-"}</div>
                        <div className="truncate">{member.email || "-"}</div>
                        <div className="truncate">
                          {member.phoneNumber || "-"}
                        </div>
                        <div>
                          {member.createdAt
                            ? member.createdAt
                                .toDate()
                                .toISOString()
                                .split("T")[0]
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
              <div>
                <div className="text-left mb-4">
                  <h2 className="text-lg font-semibold">Groups</h2>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <div className="min-w-[600px] lg:min-w-0">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium">
                      <div>Name</div>
                      <div>Size</div>
                      <div>Total Dues</div>
                      <div>Created Date</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50"
                        >
                          <div className="truncate">{group.name || "-"}</div>
                          <div className="truncate">{group.size || "-"}</div>
                          <div className="truncate">
                            {group.totalDues|| "-"}
                          </div>
                          <div>
                            {group.createdAt
                              ? group.createdAt
                                  .toDate()
                                  .toISOString()
                                  .split("T")[0]
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
                    <div className="flex justify-center w-full">
                      <Button
                        disabled={isLoading}
                        className="w-full bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Add Member List
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Card className="w-full lg:w-[400px]">
                <CardHeader>
                  <CardTitle>Create New Group</CardTitle>
                  <CardDescription>
                    Add a Group to your Organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...groupForm}>
                    <form
                      onSubmit={groupForm.handleSubmit(onSubmitGroups)}
                      className="space-y-4 flex flex-col items-center"
                    >
                      <div className="w-full space-y-4">
                        <FormField
                          control={groupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Competitive Team" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                      <div className="flex justify-center w-full">
                        <Button
                          disabled={isLoading}
                          onClick={() => {selectingMem? setSelectingMem(false): setSelectingMem(true)}}
                          className="w-full bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white"
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Select Members
                        </Button>
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
                          Create Group
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
          </div>
    </div>
  );
}
