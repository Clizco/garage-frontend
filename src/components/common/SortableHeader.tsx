import { ChevronDown, ChevronUp } from "lucide-react"
import type { SortDir } from "../../hooks/useSortable"

interface Props {
  label: string
  sortKey: any
  currentKey: any
  dir: SortDir
  onToggle: (key: any) => void
  /** Fully replaces the default <th> className when provided */
  className?: string
}

export default function SortableHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onToggle,
  className,
}: Props) {
  const active = currentKey === sortKey
  const thClass =
    className ??
    "px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300 cursor-pointer select-none whitespace-nowrap group"

  return (
    <th onClick={() => onToggle(sortKey)} className={thClass}>
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col">
          <ChevronUp
            className={`w-3 h-3 transition-opacity ${
              active && dir === "asc"
                ? "text-indigo-500 opacity-100"
                : "opacity-30 group-hover:opacity-70"
            }`}
          />
          <ChevronDown
            className={`w-3 h-3 -mt-0.5 transition-opacity ${
              active && dir === "desc"
                ? "text-indigo-500 opacity-100"
                : "opacity-30 group-hover:opacity-70"
            }`}
          />
        </span>
      </span>
    </th>
  )
}
