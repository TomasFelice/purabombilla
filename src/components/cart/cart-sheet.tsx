
"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

export function CartSheet() {
    const [isMounted, setIsMounted] = useState(false)
    const cart = useCart()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="relative" aria-label="Carrito">
                <ShoppingCart className="h-5 w-5" />
            </Button>
        )
    }

    const itemCount = cart.totalItems()
    const total = cart.totalPrice()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Carrito">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-green-600 text-xs text-white px-0 pointer-events-none">
                            {itemCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Tu Carrito ({itemCount})</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />

                <div className="flex-1 overflow-y-auto px-4">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-400 text-xs">Sin foto</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                                            <div className="text-sm font-semibold mt-1">${item.price.toLocaleString('es-AR')}</div>
                                            {(item.quantity > (item.stock ?? 0)) && (
                                                <div className="text-xs text-blue-600 mt-1 font-medium">
                                                    {(item.stock ?? 0) <= 0 ? "• Se trae por encargue" : "• Parte del pedido se trae por encargue"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => {
                                                if (item.quantity > 1) cart.updateQuantity(item.id, item.quantity - 1)
                                                else cart.removeItem(item.id)
                                            }}>-</Button>
                                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}>+</Button>
                                            <Button variant="ghost" size="sm" className="ml-auto text-xs text-red-500 h-7" onClick={() => cart.removeItem(item.id)}>Quitar</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t font-medium px-4 pb-4">
                    <div className="flex justify-between text-lg mb-4">
                        <span>Total</span>
                        <span>${total.toLocaleString('es-AR')}</span>
                    </div>
                    <Link href="/checkout">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg" disabled={cart.items.length === 0}>
                            Finalizar Compra
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    )
}
