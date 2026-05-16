import { redirect } from "next/navigation";

export default function StudentsRootPage() {
    redirect("/students/list");
}
