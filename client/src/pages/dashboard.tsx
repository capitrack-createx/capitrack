import { logout } from "@/services/auth-service";
import TransactionsPage from "./transactions-page";
export function DashBoard() {
  return (
    <>
      <h1>Txn Test</h1>
      <TransactionsPage></TransactionsPage>
    </>
  );
}
