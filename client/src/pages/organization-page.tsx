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
export const Organizations = () => {
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
    <div>
    <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold">New Organization</h1>
            <p className="text-muted-foreground">Create Secondary Organizations</p>
          </div>
        </div>
    </div>
    <div>
    <Card className="w-full lg:w-[400px]">
    <CardHeader>
      <CardTitle>Create New Organization</CardTitle>
      <CardDescription>
        Add 
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
              Create New Organization
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
  </div>
  </div>
  );
};