import { redirect } from "next/navigation";

export default function AdminGatherPage() {
  redirect("/admin/submissions?section=gather");
}
