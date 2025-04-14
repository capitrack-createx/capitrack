import { useState, useEffect, useRef } from "react";
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
import { uploadReceipt } from "@/services/storage-service";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const TransactionsPage = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      receiptURL: "",
    },
  });

  // onSubmit will be called with validated form data
  const onSubmit = async (data: InsertTransaction) => {
    if (!user || !organization || isUploading) {
      return;
    }
    setIsUploading(true);

    let receiptUrl = data.receiptURL; // Initially an empty string.

    // 1. Upload the file if present
    if (uploadFile) {
      try {
        receiptUrl = await uploadReceipt(uploadFile);
        // Update the hidden form field so it can be validated
        form.setValue("receiptURL", receiptUrl);
      } catch (error) {
        console.error("Error uploading receipt:", error);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // 2. Create the document
    const newTransactionRecord: InsertTransaction = {
      date: data.date || new Date().toISOString().split("T")[0],
      type: data.type,
      category: data.category,
      description: data.description || "",
      amount: data.amount,
      createdBy: user.uid,
      createdAt: new Date(),
      orgId: organization.id,
      receiptURL: receiptUrl,
    };
    dbService
      .createTransactionDocument(newTransactionRecord)
      .then(() => {
        form.reset();
        setUploadFile(null);
      })
      .catch((error) => {
        console.log("Error creating transaction:", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  function generateCsv(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const csvRows = [];

    if (headers) {
      csvRows.push(headers.join(','));
    } else if (data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
            csvRows.push("description,category,amount,date");
      }
    }

    for (const item of data) {
        if (typeof item === 'object' && item !== null) {
            csvRows.push(item.description + "," + item.category + "," + item.amount.toFixed(2) * (item.type === 'Income'? 1: -1) + "," + item.date.toString());
        } else {
            csvRows.push(String(item));
        }
    }
    return csvRows.join('\n');
  }

  function downloadCsv(csvString: string, filename: string = 'data.csv'): void {
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage all your organization transactions
          </p>
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

                {/* Hidden Receipt URL Field registered with useForm */}
                <input type="hidden" {...form.register("receiptURL")} />

                <FormItem>
                  <FormLabel htmlFor="picture">
                    Upload Receipt (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="picture"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <div className="flex justify-end">
                  <Button
                    className="bg-green-700 hover:bg-green-800 padding:200"
                    type="button"
                    onClick={() => {
                      downloadCsv(generateCsv(transactions), organization?.name + " Transactions");
                    }}
                  >
                    Download CSV
                  </Button>
                  <div className="w-5"></div>
                  <Button
                    disabled={isUploading}
                    type="submit"
                    className="bg-green-700 hover:bg-green-800"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <></>}
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
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-left">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-left">
                      {transaction.date.toString()}
                    </TableCell>
                    <TableCell className="text-left">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="text-left">
                      {transaction.category}
                    </TableCell>
                    <TableCell className="text-left">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-left">
                      {transaction.receiptURL ? (
                        <>
                          {/* Pop up dialog section */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">View Receipt</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Receipt</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center my-4">
                                <img
                                  src={transaction.receiptURL}
                                  alt="Receipt"
                                  className="max-h-[400px] w-full object-contain rounded-md shadow-md"
                                />
                              </div>

                              {/* <DialogFooter>
                                <Button type="submit">Save changes</Button>
                              </DialogFooter> */}
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <></>
                      )}
                    </TableCell>
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
