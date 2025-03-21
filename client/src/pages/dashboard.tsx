import { logout } from "@/services/auth-service";
export function DashBoard() {
  return (
    <>
      <div>Authenticated </div>
      <button onClick={logout}> Logout </button>
    </>
  );
}
