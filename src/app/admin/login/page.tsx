import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Sign In — Dermatologika",
  description: "Ingrese a la administración de Dermatologika",
};

export default function AdminLoginPage() {
  redirect("/login?redirectTo=/admin/leads");
}
