import React, { useState, useEffect } from "react";
import { dbService } from "../services/db-service";
import { styles } from "../styles";
import type { Fee, FeeAssignment } from "../../../shared/schema";
import { useAuth } from "../services/auth-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";
import { Pencil, Trash2, X } from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  orgId: string;
};

export const FeesPage = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [fees, setFees] = useState<Fee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<
    Record<string, FeeAssignment[]>
  >({});
  const [selectedFee, setSelectedFee] = useState<string>("");
  const [assignToAll, setAssignToAll] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    assignment: FeeAssignment;
    fee: Fee;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editingFeeData, setEditingFeeData] = useState<Partial<Fee> | null>(null);

  useEffect(() => {
    if (organization) {
      console.log("Organization loaded, orgId:", organization.id);
      loadFees();
      loadMembers();
    }
  }, [organization]);

  useEffect(() => {
    console.log("Current members state:", members);
  }, [members]);

  useEffect(() => {
    if (selectedFee) {
      loadFeeAssignments(selectedFee);
    }
  }, [selectedFee]);

  async function loadFees() {
    if (!user || !organization) {
      return;
    }
    const feesData = await dbService.getFees(organization.id);
    setFees(feesData);
  }

  async function loadMembers() {
    if (!user || !organization) {
      return;
    }
    try {
      console.log("Loading members for org:", organization.id);
      const membersData = await dbService.getMembers(organization.id);
      console.log("Loaded members:", membersData);
      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        console.error("Unexpected members data format:", membersData);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    }
  }

  async function loadFeeAssignments(feeId: string) {
    const assignmentsData = await dbService.getFeeAssignments(feeId);
    setAssignments((prev) => ({
      ...prev,
      [feeId]: assignmentsData,
    }));
  }

  async function handleAddFee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    let memberIds: string[] = [];
    if (assignToAll) {
      memberIds = members.map((m) => m.id);
    } else {
      memberIds = Array.from(formData.getAll("memberIds")).map(String);
    }
    const orgId = organization!.id;
    await dbService.addFee({
      name: formData.get("name") as string,
      amount: Number(formData.get("amount")),
      dueDate: new Date(formData.get("dueDate") as string),
      memberIds,
      orgId,
    });

    form.reset();
    setAssignToAll(false);
    setIsLoading(false);
    loadFees();
  }

  async function handlePayFee(assignment: FeeAssignment, fee: Fee) {
    setSelectedAssignment({ assignment, fee });
    setShowPaymentModal(true);
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { assignment } = selectedAssignment;

    if (!assignment.id) return;
    await dbService.updateFeeAssignment(assignment.id, {
      isPaid: true,
      paidDate: new Date(),
      paymentMethod: formData.get("paymentMethod") as any,
      notes: (formData.get("notes") as string) || undefined,
    });

    await loadFeeAssignments(assignment.feeId);
    setShowPaymentModal(false);
    setSelectedAssignment(null);
    form.reset();
  }

  const deleteFee = async (feeId: string) => {
    if (!user || !organization) return;
    try {
      await dbService.deleteFee(feeId);
      loadFees();
      toast.success("Fee deleted successfully");
    } catch (error) {
      toast.error("Failed to delete fee");
    }
  };

  const startEditing = (fee: Fee) => {
    setEditingFeeId(fee.id);
    setEditingFeeData({
      name: fee.name,
      amount: fee.amount,
      dueDate: fee.dueDate,
    });
  };

  const cancelEditing = () => {
    setEditingFeeId(null);
    setEditingFeeData(null);
  };

  const handleEdit = async (feeId: string, data: Partial<Fee>) => {
    if (!user || !organization) return;
    try {
      await dbService.updateFee(feeId, data);
      loadFees();
      cancelEditing();
      toast.success("Fee updated successfully");
    } catch (error) {
      toast.error("Failed to update fee");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Fees</h1>
          <p className="text-muted-foreground">Manage your organization fees</p>
        </div>

        {/* Add Fee Form Section */}
        <Card className="p-6">
          <div className="text-center mb-4">
            <h2 className="font-semibold">Add New Fee</h2>
            <p className="text-muted-foreground mt-1">Create a new fee for your organization</p>
          </div>
          <form onSubmit={handleAddFee} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name" className="font-medium">Fee Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Fee name"
                  required
                  className="mt-1.5 h-12 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="amount" className="font-medium">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="mt-1.5 h-12 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="dueDate" className="font-medium">Due Date</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="date" 
                  required 
                  placeholder="mm/dd/yyyy"
                  className="mt-1.5 h-12 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="assignToAll"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={assignToAll}
                  onChange={(e) => setAssignToAll(e.target.checked)}
                />
                <Label htmlFor="assignToAll" className="font-medium">Assign to all members</Label>
              </div>

              {!assignToAll && (
                <div className="border rounded-lg p-4 bg-white">
                  {members.length === 0 ? (
                    <div className="text-center text-muted-foreground py-2">
                      No members available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            name="memberIds"
                            value={member.id}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`member-${member.id}`} className="font-medium">
                            {member.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-9 px-6 bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white rounded-[10px] text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Fee"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Fees List Section */}
        <div className="w-full">
          <div className="text-left mb-4">
            <h2 className="text-lg font-semibold">Fee List</h2>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <div className="min-w-[600px] lg:min-w-0">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium">
                <div>Name</div>
                <div>Amount</div>
                <div>Assigned To</div>
                <div>Due Date</div>
                <div>Actions</div>
              </div>
              {/* Fees List */}
              <div className="space-y-2">
                {fees.map((fee) => (
                  <div key={fee.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                    <div>
                      {editingFeeId === fee.id ? (
                        <Input
                          value={editingFeeData?.name || ""}
                          onChange={(e) => 
                            setEditingFeeData((prev) => ({
                              ...(prev || {}),
                              name: e.target.value
                            }))
                          }
                        />
                      ) : fee.name}
                    </div>
                    <div>
                      {editingFeeId === fee.id ? (
                        <Input
                          type="number"
                          value={editingFeeData?.amount || ""}
                          onChange={(e) => 
                            setEditingFeeData((prev) => ({
                              ...(prev || {}),
                              amount: parseFloat(e.target.value)
                            }))
                          }
                        />
                      ) : `$${fee.amount}`}
                    </div>
              
                    <div>{fee.memberIds?.length || 0} members</div>
                    <div>
                      {editingFeeId === fee.id ? (
                        <Input
                          type="date"
                          value={editingFeeData?.dueDate ? new Date(editingFeeData.dueDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => 
                            setEditingFeeData((prev) => ({
                              ...(prev || {}),
                              dueDate: new Date(e.target.value)
                            }))
                          }
                        />
                      ) : new Date(fee.dueDate).toISOString().split('T')[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${m}/${d}/${y.slice(2)}`)}
                    </div>
                    <div className="flex gap-2">
                      {editingFeeId === fee.id ? (
                        <>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => cancelEditing()}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(fee.id, editingFeeData!)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => startEditing(fee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteFee(fee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        <button
                        onClick={() =>
                          setSelectedFee(
                            selectedFee === fee.id ? "" : fee.id || ""
                          )
                        }
                        className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                      >
                        {selectedFee === fee.id ? "Hide Details" : "View Details"}
                      </button>
                      </>
                      )}
                    </div>
                  </div>
                ))}
                {fees.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No fees found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fee Details Section - Shows when a fee is selected */}
          {selectedFee && assignments[selectedFee] && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    View and manage payments for this fee
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {assignments[selectedFee].map((assignment) => {
                      const member = members.find(
                        (m) => m.id === assignment.memberId
                      );
                      return (
                        <div
                          key={assignment.id}
                          className={`p-4 rounded-lg ${
                            assignment.isPaid
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="font-medium">{member?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.isPaid ? (
                              <>
                                <div>
                                  Paid on{" "}
                                  {assignment.paidDate?.toLocaleDateString()}
                                </div>
                                {assignment.paymentMethod && (
                                  <div>
                                    Method:{" "}
                                    {assignment.paymentMethod.replace("_", " ")}
                                  </div>
                                )}
                                {assignment.notes && (
                                  <div>Notes: {assignment.notes}</div>
                                )}
                              </>
                            ) : (
                              "Not paid"
                            )}
                          </div>
                          {!assignment.isPaid && (
                            <button
                              onClick={() =>
                                handlePayFee(
                                  assignment,
                                  fees.find((f) => f.id === selectedFee)!
                                )
                              }
                              className="mt-2 w-full px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && selectedAssignment && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.title}>Process Payment</h3>
            <form onSubmit={handlePaymentSubmit} style={styles.form}>
              <div style={styles.text}>
                Process payment for {selectedAssignment.fee.name}
              </div>
              <select
                name="paymentMethod"
                required
                defaultValue=""
                style={styles.select}
              >
                <option value="" disabled>
                  Select payment method
                </option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="VENMO">Venmo</option>
                <option value="ZELLE">Zelle</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="OTHER">Other</option>
              </select>
              <textarea
                name="notes"
                placeholder="Additional notes (optional)"
                style={styles.input}
                rows={3}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.button}>
                  Process Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedAssignment(null);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
