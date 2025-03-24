import "./App.css";
import { Redirect, Route, Switch } from "wouter";
import { AuthPage } from "@/pages/auth-page";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { AppLayout } from "@/components/layout/app-layout";
import { Dashboard } from "@/pages/dashboard";
import { MembersPage } from "@/pages/members-page";
import { FeesPage } from "@/pages/fees-page";
import { BudgetsPage } from "@/pages/budgets-page";
import { ReportsPage } from "@/pages/reports-page";
import { TransactionsPage } from "@/pages/transactions-page";

function App() {
  return (
    <>
      <Toaster />
      <div>
        <Switch>
          <Route path="/" component={AuthPage}></Route>
          <AuthGuard>
            <Route path="/app">
              <Redirect to="/app/dashboard" />
            </Route>
            <AppLayout>
              <Switch>
                <Route path="/app/dashboard" component={Dashboard} />
                <Route path="/app/members" component={MembersPage} />
                <Route path="/app/fees" component={FeesPage} />
                <Route path="/app/budgets" component={BudgetsPage} />
                <Route path="/app/reports" component={ReportsPage} />
                <Route path="/app/transactions" component={TransactionsPage} />
              </Switch>
            </AppLayout>
          </AuthGuard>
        </Switch>
      </div>
    </>
  );
}

export default App;
