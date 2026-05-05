export const revalidate = 30;

import { Settings } from "lucide-react";
import { SalarySettingsClient } from "./SalarySettingsClient";

export default function SalarySettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <SalarySettingsClient />
    </div>
  );
}