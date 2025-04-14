import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dbService } from "@/services/db-service";
import { Transaction, FeeAssignment } from "@shared/types";
import { useOrganization } from "@/context/OrganizationContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]; // for charts

export function Dashboard() {
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    totalRevenue,
    totalExpenses,
    balance,
    revenueByMonth,
    expensesByCategory,
    feeStatus,
    recentTransactions,
  } = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    const revenueByMonthMap = new Map<string, number>();
    const expensesByCategoryMap = new Map<string, number>();
    let paid = 0;
    let unpaid = 0;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date); // YYYY-MM
      const month = date.toISOString().substring(0, 7);

      if (transaction.type === "Revenue") {
        totalRevenue += transaction.amount;

        const currentRevenue = revenueByMonthMap.get(month) || 0;
        revenueByMonthMap.set(month, currentRevenue + transaction.amount);
      } else if (transaction.type === "Expense") {
        totalExpenses += transaction.amount;

        const currentExpense =
          expensesByCategoryMap.get(transaction.category) || 0;
        expensesByCategoryMap.set(
          transaction.category,
          currentExpense + transaction.amount
        );
      }
    });

    feeAssignments.forEach((assignment) => {
      if (assignment.isPaid) {
        paid++;
      } else {
        unpaid++;
      }
    });

    const revenueByMonth = Array.from(revenueByMonthMap, ([month, amount]) => ({
      month,
      amount,
    })).sort((a, b) => a.month.localeCompare(b.month));

    const expensesByCategory = Array.from(
      expensesByCategoryMap,
      ([category, amount]) => ({
        category,
        amount,
      })
    ).sort((a, b) => b.amount - a.amount);

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      revenueByMonth,
      expensesByCategory,
      feeStatus: { paid, unpaid },
      recentTransactions,
    };
  }, [transactions, feeAssignments]);

  useEffect(() => {
    if (!organization?.id) return;

    setIsLoading(true);

    const unsubscribe = dbService.subscribeToTransactions(
      organization.id,
      (fetchedTransactions) => {
        setTransactions(fetchedTransactions);
        setIsLoading(false);
      }
    );

    const fetchFeeAssignments = async () => {
      try {
        const fees = await dbService.getFees(organization.id);

        let allAssignments: FeeAssignment[] = [];
        for (const fee of fees) {
          const assignments = await dbService.getFeeAssignments(fee.id);
          allAssignments = [...allAssignments, ...assignments];
        }

        setFeeAssignments(allAssignments);
      } catch (error) {
        console.error("Error fetching fee assignments:", error);
      }
    };

    fetchFeeAssignments();

    return () => {
      unsubscribe();
    };
  }, [organization?.id]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-left mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          View your organization's financial metrics and activities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500">total revenue received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-gray-500">total expenses paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            <p className="text-sm text-gray-500">net balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fees Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {feeStatus.paid}/{feeStatus.paid + feeStatus.unpaid}
            </p>
            <p className="text-sm text-gray-500">members paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2e7d32"
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expensesByCategory.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee - Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Paid", value: feeStatus.paid },
                    { name: "Unpaid", value: feeStatus.unpaid },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <h3 className="text-xl font-medium mb-4">Recent Transactions</h3>
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
          {recentTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description || "-"}</TableCell>
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
  );
}
