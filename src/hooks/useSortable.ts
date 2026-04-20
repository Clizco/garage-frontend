import { useMemo, useState } from "react"

export type SortDir = "asc" | "desc" | null

export function useSortable<T>(data: T[]) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const toggle = (key: keyof T) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  const sorted = useMemo((): T[] => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = (a as any)[sortKey as any]
      const bv = (b as any)[sortKey as any]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const aNum = Number(av)
      const bNum = Number(bv)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum
      }
      const aStr = String(av).toLowerCase()
      const bStr = String(bv).toLowerCase()
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDir])

  return { sorted, sortKey, sortDir, toggle }
}
