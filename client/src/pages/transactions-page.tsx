import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsertTransaction, InsertTransactionSchema } from "@shared/schema";
import { useAuth } from "@/services/auth-service";
import { useOrganization } from "@/context/OrganizationContext";
import { dbService } from "@/services/db-service";
import { Transaction } from "@shared/types";

export const TransactionsPage = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  useEffect(() => {
    if (!user || !organization) return;
    const unsubscribe = dbService.subscribeToTransactions(
      organization.id,
      (snapshot) => {
        setTransactions(snapshot);
      }
    );
    return unsubscribe;
  }, [organization, user]);

  // Initialize the form with default values and validation schema
  const form = useForm<InsertTransaction>({
    resolver: zodResolver(InsertTransactionSchema),
    defaultValues: {
      type: "Expense",
      amount: 0,
      category: "Other",
      description: "",
      createdBy: user!.uid,
      createdAt: new Date(),
      orgId: organization!.id,
    },
  });

  // onSubmit will be called with validated form data
  const onSubmit = (data: InsertTransaction) => {
    if (!user || !organization) {
      return;
    }
    const newTransactionRecord: InsertTransaction = {
      date: data.date || new Date().toISOString().split("T")[0],
      type: data.type,
      category: data.category,
      description: data.description || "",
      amount: data.amount,
      createdBy: user.uid,
      createdAt: new Date(),
      orgId: organization.id,
    };

    console.log(newTransactionRecord);
    // Reset the form after a successful submission
    dbService
      .createTransactionDocument(newTransactionRecord)
      .then(() => {
        form.reset();
      })
      .catch((error) => {
        console.log("Error creating transaction:", error);
      });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage all your organization transactions</p>
        </div>

        {/* Add Transaction Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Transaction Type Field */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Expense">Expense</SelectItem>
                              <SelectItem value="Revenue">Revenue</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Field */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Other">Other</SelectItem>
                              <SelectItem value="Event">Event</SelectItem>
                              <SelectItem value="Supplies">Supplies</SelectItem>
                              <SelectItem value="Membership">
                                Membership
                              </SelectItem>
                              <SelectItem value="Sponsorship">
                                Sponsorship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount Field */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-green-700 hover:bg-green-800"
                  >
                    Add Transaction
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Transaction History Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Transaction History</h3>
            <Select value="All" onValueChange={() => {}}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date.toString()}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell
                      className={`text-right ${
                        transaction.type === "Revenue"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
