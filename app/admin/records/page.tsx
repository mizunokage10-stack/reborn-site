import { redirect } from "next/navigation";

export default function AdminRecordsPage() {
  redirect("/admin/submissions?section=records");
}
