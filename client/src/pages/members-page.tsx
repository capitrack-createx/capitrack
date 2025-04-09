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
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ [key: string]: any }>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
      status: "ACTIVE"
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

  const handleEdit = (member: Member) => {
    setEditingMemberId(member.id);
    setEditForm({
      name: member.name,
      email: member.email,
      phoneNumber: member.phoneNumber,
      role: member.role,
      status: member.status,
    });
  };

  const handleSave = async (memberId: string) => {
    if (!user || !organization) return;
    setIsLoading(true);
    try {
      // Only pass the fields that are allowed by the updateMember function
      await dbService.updateMember(memberId, {
        ...editForm,
      });
      loadMembers();
      setEditingMemberId(null);
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingMemberId(null);
  };

  const handleDelete = async (memberId: string) => {
    if (!user || !organization) return;
    setIsLoading(true);
    try {
      await dbService.deleteMember(memberId);
      loadMembers();
      toast.success("Member deleted successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
    } finally {
      setIsLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleConfirmDelete = (memberId: string) => {
    setConfirmDelete(memberId);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
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
                <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Phone</div>
                  <div>Join Date</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/50"
                    >
                      {editingMemberId === member.id ? (
                        <>
                          <div className="flex flex-col">
                            <Input
                              defaultValue={member.name}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <Input
                              defaultValue={member.email}
                              onChange={(e) =>
                                setEditForm({ ...editForm, email: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <Input
                              defaultValue={member.phoneNumber}
                              onChange={(e) =>
                                setEditForm({ ...editForm, phoneNumber: e.target.value })
                              }
                            />
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
                          <button 
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                              editForm.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                status: editForm.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                              });
                            }}
                            disabled={isLoading}
                          >
                            {editForm.status}
                          </button>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSave(member.id)}
                              disabled={isLoading}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              disabled={isLoading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleConfirmDelete(member.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No members found
                    </div>
                  )}
                  {confirmDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-background p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">
                          Confirm Delete
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Are you sure you want to delete this member? This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={handleCancelDelete}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(confirmDelete)}
                            disabled={isLoading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
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
