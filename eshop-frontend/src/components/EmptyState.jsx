import { PackageX } from "lucide-react";

export function EmptyState({
  icon: Icon = PackageX,
  title = "Nothing here yet",
  message = "Try adjusting your search or filters.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] px-6 py-16 text-center">
      <div className="rounded-full bg-[#101828]/5 p-4">
        <Icon size={28} className="text-[#101828]/40" />
      </div>
      <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>
      <p className="max-w-sm text-sm text-gray-500">{message}</p>
      {action}
    </div>
  );
}
