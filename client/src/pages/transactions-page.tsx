import React, { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { TransactionSchema } from '@shared/schema'
import { z } from "zod";

interface Transaction {
    id: string | number;
    date: string;
    type: "Income" | "Expense";
    category: string;
    description: string;
    amount: number;
  }
  
interface NewTransaction {
    type: "Income" | "Expense";
    amount: string;
    category: string;
    description: string;
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All")
  
  const [newTransaction, setNewTransaction] = useState({
    type: "Expense",
    amount: "",
    category: "Other",
    description: ""
  })
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  const handleInputChange = (field: keyof NewTransaction, value: string) => {
    setNewTransaction({
      ...newTransaction,
      [field]: value
    })
  }
  
  const handleAddTransaction = () => {
    try {
      const validatedData = TransactionSchema.parse(newTransaction);

      const newTransactionRecord: Transaction = {
        id: crypto.randomUUID(), 
        date: validatedData.date || new Date().toISOString().split('T')[0],
        type: validatedData.type,
        category: validatedData.category,
        description: validatedData.description || "",
        amount: parseFloat(validatedData.amount)
      };
      
      setTransactions([...transactions, newTransactionRecord]);
    
    setNewTransaction({
        type: "Expense",
        amount: "",
        category: "Other",
        description: ""
    });
      
      console.log("Adding validated transaction:", validatedData);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-2">GT-SHPE</h1>
      <h2 className="text-2xl font-semibold mb-6">Transactions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transaction History Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Transaction History</h3>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
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
                  <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`text-right ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    ${transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add Transaction Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select 
                  value={newTransaction.type} 
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Expense">Expense</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newTransaction.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Membership">Membership</SelectItem>
                    <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input 
                  value={newTransaction.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full bg-green-700 hover:bg-green-800" 
                onClick={handleAddTransaction}
              >
                Add Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}