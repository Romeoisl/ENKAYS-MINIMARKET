import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";

export default async function BrandsPage() {
  await requireRole("EDITOR");
  redirect("/admin/categories");
}
