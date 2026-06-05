import { ReviewAdminPanel } from "@/features/admin-reviews/components/review-admin-panel";

export const metadata = {
  title: "Admin Reseñas — Dermatologika",
  description: "Moderar y gestionar reseñas de clientes.",
};

export default function AdminReviewsPage() {
  return <ReviewAdminPanel />;
}
