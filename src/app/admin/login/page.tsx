import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Sign In — Eterna Vida",
  description: "Ingrese a la administración de Eterna Vida",
};

export default function AdminLoginPage() {
  redirect("/login?redirectTo=/admin/leads");
}
