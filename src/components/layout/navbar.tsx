
"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { CartSheet } from "@/components/cart/cart-sheet"
import { SearchBar } from "@/components/layout/search-bar"


export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/purabombilla-logo-imagotipo.png"
                        alt="purabombilla"
                        width={180}
                        height={50}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/productos" className="text-sm font-medium hover:text-primary/80 transition text-foreground">
                        Catálogo
                    </Link>
                    <Link href="/productos?category=mates" className="text-sm font-medium hover:text-primary/80 transition text-foreground">
                        Mates
                    </Link>
                    <Link href="/productos?category=bombillas" className="text-sm font-medium hover:text-primary/80 transition text-foreground">
                        Bombillas
                    </Link>
                    <Link href="/productos?category=combos" className="text-sm font-medium hover:text-primary/80 transition text-foreground">
                        Combos
                    </Link>
                </nav>

                {/* Mobile Nav & Cart */}
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex relative w-64 mr-2">
                        <Suspense fallback={<div className="w-full h-9 bg-muted rounded-md" />}>
                            <SearchBar />
                        </Suspense>
                    </div>

                    <CartSheet />

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="text-primary font-bold">Menú</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-8 px-4">
                                <Suspense>
                                    <SearchBar />
                                </Suspense>
                                <Link href="/productos" className="text-lg font-medium hover:text-primary transition">Catálogo Completo</Link>
                                <Link href="/productos?category=mates" className="text-lg font-medium hover:text-primary transition">Mates</Link>
                                <Link href="/productos?category=bombillas" className="text-lg font-medium hover:text-primary transition">Bombillas</Link>
                                <Link href="/productos?category=termos" className="text-lg font-medium hover:text-primary transition">Termos</Link>
                                <Link href="/productos?category=combos" className="text-lg font-medium hover:text-primary transition">Combos</Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
