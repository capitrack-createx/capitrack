import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Trash2, Pencil, X } from "lucide-react";
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
  Card
} from "@/components/ui/card";
import { Member } from "@shared/types";
import { dbService } from "@/services/db-service";
import { useAuth } from "@/services/auth-service";
import { useOrganization } from "@/context/OrganizationContext";
import { InsertMember, InsertMemberSchema, RoleEnum } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberData, setEditingMemberData] = useState<Partial<InsertMember> | null>(null);
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
      await dbService.addMember(data);
      form.reset();
      loadMembers();
      toast.success("Member added successfully");
    } catch (error) {
      toast.error("Failed to add member");
    }
    setIsLoading(false);
  };

  const deleteMember = async (memberId: string) => {
    if (!user || !organization) return;
    try {
      await dbService.deleteMember(memberId);
      loadMembers();
      toast.success("Member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  const startEditing = (member: Member) => {
    setEditingMemberId(member.id);
    setEditingMemberData({
      name: member.name,
      email: member.email,
      phoneNumber: member.phoneNumber,
      role: member.role.toUpperCase() as 'ADMIN' | 'MEMBER'
    });
  };

  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditingMemberData(null);
  };

  const handleEdit = async (memberId: string, data: Partial<InsertMember>) => {
    if (!user || !organization) return;
    try {
      await dbService.updateMember(memberId, data);
      loadMembers();
      cancelEditing();
      toast.success("Member updated successfully");
    } catch (error) {
      toast.error("Failed to update member");
    }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="relative inline-block">
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();

                        reader.onload = async (event) => {
                          const csvContent = event.target?.result as string;
                          const rows = csvContent.split("\n").map(row => row.trim()).filter(row => row);

                          const headers = rows.shift()?.split(",").map(header => header.trim()) || [];

                          if (headers.length === 0) {
                            toast.error("Invalid CSV: Missing headers");
                            return;
                          }

                          let importedCount = 0;

                          for (const row of rows) {
                            const columns = row.split(",").map(column => column.trim());

                            const dataMem: InsertMember = {
                              email: columns[headers.indexOf("email")] || "",
                              name: columns[headers.indexOf("name")] || "",
                              role: columns[headers.indexOf("role")]?.toUpperCase() === "ADMIN" ? "ADMIN" : "MEMBER",
                              orgId: String(organization?.id),
                              createdAt: new Date(),
                              phoneNumber: columns[headers.indexOf("phoneNumber")]? columns[headers.indexOf("phoneNumber")]: undefined,
                            };

                            toast.error(dataMem.email + " " + dataMem.name + dataMem.role + " " + dataMem.phoneNumber);

                            if (!dataMem.name || !dataMem.email || !dataMem.phoneNumber) {
                              toast.error(`Invalid row: Missing required fields: ` + dataMem);
                              continue;
                            }

                            try {
                              const validation = InsertMemberSchema.safeParse(dataMem);
                              if (!validation.success) {
                                toast.error(`Invalid row for ${dataMem.email || "missing email"}`);
                                continue;
                              }

                              await dbService.addMember(dataMem);
                              importedCount++;
                            } catch (err) {
                              console.error("Failed to add member", dataMem.email, err);
                            }
                          }

                          loadMembers();
                          form.reset();
                          toast.success(`Successfully imported ${importedCount} member(s)`);
                        };

                        reader.readAsText(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="csv-upload"
                    className="flex items-center padding-20 h-9 px-6 bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white rounded-[10px] text-sm font-medium"
                  >
                    Import Members
                  </label>
                </div>
                <div className="w-5"></div>
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
                <div>Role</div>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50"
                  >
                    <div className="truncate">
                      {editingMemberId === member.id ? (
                        <Input
                          defaultValue={member.name}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleEdit(member.id, { name: e.target.value })}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <span onClick={() => startEditing(member)}>{member.name}</span>
                      )}
                    </div>
                    <div className="truncate">
                      {editingMemberId === member.id ? (
                        <Input
                          defaultValue={member.email}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleEdit(member.id, { email: e.target.value })}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <span onClick={() => startEditing(member)}>{member.email}</span>
                      )}
                    </div>
                    <div className="truncate">
                      {editingMemberId === member.id ? (
                        <Input
                          defaultValue={member.phoneNumber}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleEdit(member.id, { phoneNumber: e.target.value })}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <span onClick={() => startEditing(member)}>{member.phoneNumber}</span>
                      )}
                    </div>
                    <div className="truncate">
                      {editingMemberId === member.id ? (
                        <Select
                          defaultValue={member.role as 'ADMIN' | 'MEMBER'}
                          onValueChange={(value: 'ADMIN' | 'MEMBER') => handleEdit(member.id, { role: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span onClick={() => startEditing(member)}>
  {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {editingMemberId === member.id ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
