import "./App.css";
import { Route, Switch } from "wouter";
import { AuthPage } from "@/pages/auth-page";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { DashBoard } from "./pages/dashboard";

function App() {
  return (
    <>
      <Toaster />
      <div>
        <Switch>
          <Route path="/" component={AuthPage}></Route>
          <AuthGuard>
            <Route path="/dashboard" component={DashBoard}></Route>
          </AuthGuard>
        </Switch>
      </div>
    </>
  );
}

export default App;
