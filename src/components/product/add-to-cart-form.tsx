"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart, Plus, Minus } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    image: string
    slug: string
}

export function AddToCartForm({ product }: { product: Product }) {
    const cart = useCart()
    const cartItem = cart.items.find(item => item.id === product.id)
    const quantityInCart = cartItem ? cartItem.quantity : 0

    // Local state is only needed if not in cart yet, or we can just use 1 if not in cart.
    // Actually, if it's not in cart, we want to allow picking a quantity before adding.
    const [localQuantity, setLocalQuantity] = useState(1)

    const quantityToDisplay = quantityInCart > 0 ? quantityInCart : localQuantity

    const handleAddToCart = () => {
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: localQuantity,
            slug: product.slug
        })
    }

    // When item is in cart, these modify cart directly
    // When item is NOT in cart, these modify local state
    const increment = () => {
        if (quantityInCart > 0) {
            cart.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1, // Add 1
                slug: product.slug
            })
        } else {
            setLocalQuantity(q => q + 1)
        }
    }

    const decrement = () => {
        if (quantityInCart > 0) {
            if (quantityInCart > 1) {
                cart.updateQuantity(product.id, quantityInCart - 1)
            } else {
                cart.removeItem(product.id)
            }
        } else {
            setLocalQuantity(q => (q > 1 ? q - 1 : 1))
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Cantidad:</span>
                <div className="flex items-center border rounded-md">
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={decrement} disabled={quantityToDisplay <= 1 && quantityInCart === 0}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{quantityToDisplay}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={increment}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {quantityInCart > 0 && <span className="text-sm text-green-600 font-medium animate-in fade-in">¡En tu carrito!</span>}
            </div>

            {quantityInCart > 0 ? (
                <Button size="lg" className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white" asChild>
                    <Link href="/checkout">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Terminar Compra
                    </Link>
                </Button>
            ) : (
                <Button size="lg" className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Agregar al Carrito
                </Button>
            )}
        </div>
    )
}
