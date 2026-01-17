"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
    className?: string
    onSearch?: () => void
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState("")

    useEffect(() => {
        // Initialize with URL param if present
        const searchQuery = searchParams.get("search")
        if (searchQuery) {
            setQuery(searchQuery)
        }
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams(searchParams.toString())

        if (query.trim()) {
            params.set("search", query.trim())
        } else {
            params.delete("search")
        }

        // Always navigate to /productos even if we are already there, to update params
        // But if we want to reset other filters, we might want to just go to /productos?search=...
        // For now, let's keep existing category filters if possible, or maybe it's better to clear them?
        // Usually search is global. Let's start with global search.

        router.push(`/productos?${params.toString()}`)

        if (onSearch) {
            onSearch()
        }
    }

    return (
        <form onSubmit={handleSearch} className={cn("relative w-full", className)}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-9 h-9 bg-background border-input focus-visible:ring-ring w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    )
}
