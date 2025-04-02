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

type Member = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  orgId: string;
};

export const FeesPage = () => {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string>("");
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

  useEffect(() => {
    loadOrganization();
  }, [user]);

  useEffect(() => {
    if (orgId) {
      console.log("Organization loaded, orgId:", orgId);
      loadFees();
      loadMembers();
    }
  }, [orgId]);

  useEffect(() => {
    console.log("Current members state:", members);
  }, [members]);

  async function loadOrganization() {
    if (!user) return;
    const org = await dbService.getUserOrganization(user.uid);
    if (org?.id) {
      setOrgId(org.id);
    }
  }

  useEffect(() => {
    if (selectedFee) {
      loadFeeAssignments(selectedFee);
    }
  }, [selectedFee]);

  async function loadFees() {
    const feesData = await dbService.getFees(orgId);
    setFees(feesData);
  }

  async function loadMembers() {
    try {
      console.log("Loading members for org:", orgId);
      const membersData = await dbService.getMembers(orgId);
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
    console.log(assignmentsData);
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

    // Create a new fee with a temporary ID
    const newFee: Fee = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      amount: Number(formData.get("amount")),
      dueDate: new Date(formData.get("dueDate") as string),
      memberIds,
      orgId: "temp-org-id",
    };

    // Add to local state
    setFees((prevFees) => [...prevFees, newFee]);

    form.reset();
    setAssignToAll(false);
    setIsLoading(false);
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

  // Component-specific styles that extend shared styles
  // const componentStyles = {np
  //   memberList: {
  //     maxHeight: "200px",
  //     overflowY: "auto" as const,
  //     border: "1px solid #ddd",
  //     borderRadius: "4px",
  //     padding: "8px",
  //   },
  //   memberItem: {
  //     display: "flex",
  //     alignItems: "center",
  //     marginBottom: "4px",
  //   },
  //   checkbox: {
  //     marginRight: "8px",
  //   },
  //   feeList: {
  //     display: "flex",
  //     flexDirection: "column" as const,
  //     gap: "16px",
  //   },
  //   feeCard: {
  //     ...styles.card,
  //     marginBottom: "16px",
  //   },
  //   feeHeader: {
  //     display: "flex",
  //     justifyContent: "space-between",
  //     alignItems: "start",
  //     marginBottom: "8px",
  //   },
  //   assignmentCard: (isPaid: boolean) => ({
  //     padding: "12px",
  //     borderRadius: "4px",
  //     background: isPaid ? "#dcfce7" : "#f3f4f6",
  //     border: `1px solid ${isPaid ? "#bbf7d0" : "#ddd"}`,
  //   }),
  // };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Fees</h1>
          <p className="text-muted-foreground">Manage your organization fees</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Fees List Section */}
          <div className="w-full lg:flex-1">
            <div className="text-left mb-4">
              <h2 className="text-lg font-semibold">Fee List</h2>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[600px] lg:min-w-0">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium">
                  <div>Name</div>
                  <div>Amount</div>
                  <div>Due Date</div>
                  <div>Assigned To</div>
                  <div>Actions</div>
                </div>
                {/* Table Body */}
                <div className="divide-y">
                  {fees.map((fee) => (
                    <div
                      key={fee.id}
                      className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50"
                    >
                      <div className="font-medium">{fee.name}</div>
                      <div className="text-blue-600 font-medium">
                        ${fee.amount}
                      </div>
                      <div>{new Date(fee.dueDate).toLocaleDateString()}</div>
                      <div>{fee.memberIds?.length || 0} members</div>
                      <div>
                        <button
                          onClick={() =>
                            setSelectedFee(
                              selectedFee === fee.id ? "" : fee.id || ""
                            )
                          }
                          className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                        >
                          {selectedFee === fee.id
                            ? "Hide Details"
                            : "View Details"}
                        </button>
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
                                      {assignment.paymentMethod.replace(
                                        "_",
                                        " "
                                      )}
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

          {/* Add Fee Form Section */}
          <Card className="w-full lg:w-[400px]">
            <CardHeader>
              <CardTitle>Add New Fee</CardTitle>
              <CardDescription>
                Create a new fee for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fee Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Fee name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="assignToAll"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={assignToAll}
                    onChange={(e) => setAssignToAll(e.target.checked)}
                  />
                  <Label htmlFor="assignToAll">Assign to all members</Label>
                </div>

                {!assignToAll && (
                  <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
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
                            <Label htmlFor={`member-${member.id}`}>
                              {member.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#2B8A3E] hover:bg-[#2B8A3E]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Fee"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
