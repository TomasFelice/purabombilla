
"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { Badge } from "@/components/ui/badge"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface Product {
    id: string
    name: string
    price: number
    image: string
    images?: string[] // Optional array of images
    category: string
    slug: string
    featured?: boolean
    stock?: number
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const cart = useCart()

    // Check if product is in cart
    const cartItem = cart.items.find(item => item.id === product.id)
    const quantityInCart = cartItem ? cartItem.quantity : 0

    const onAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            slug: product.slug,
            stock: product.stock
        })
    }

    const onIncrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            slug: product.slug,
            stock: product.stock
        })
    }

    const onDecrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (cartItem) {
            if (cartItem.quantity > 1) {
                cart.updateQuantity(product.id, cartItem.quantity - 1)
            } else {
                cart.removeItem(product.id)
            }
        }
    }

    const isPreOrder = (product.stock ?? 0) <= 0

    return (
        <Link href={`/producto/${product.slug}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200/50 group-hover:opacity-100 transition-opacity">
                {product.images && product.images.length > 1 ? (
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {product.images.map((img, idx) => (
                                <CarouselItem key={idx} className="p-0">
                                    <div className="relative aspect-square w-full h-full">
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* Only show arrows on hover for cleaner look */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <CarouselPrevious className="left-2 h-8 w-8" />
                            <CarouselNext className="right-2 h-8 w-8" />
                        </div>
                    </Carousel>
                ) : (
                    product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-sm">
                            Sin imagen
                        </div>
                    )
                )}

                {product.featured && (
                    <Badge className="absolute left-2 top-2 bg-black/80 text-white hover:bg-black/80 pointer-events-none z-10">Destacado</Badge>
                )}

                {isPreOrder && (
                    <Badge variant="secondary" className="absolute right-2 top-2 bg-blue-100 text-blue-800 hover:bg-blue-100 pointer-events-none z-10 font-medium border-blue-200">
                        Por encargue
                    </Badge>
                )}

                {/* Overlay cart counter if in cart */}
                {quantityInCart > 0 && (
                    <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                        {quantityInCart}
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-between items-start gap-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">{product.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">${product.price.toLocaleString('es-AR')}</p>
                </div>

                {quantityInCart > 0 ? (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-1 py-1 shadow-sm" onClick={(e) => e.preventDefault()}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50"
                            onClick={onDecrement}
                        >
                            <span className="font-bold">-</span>
                        </Button>
                        <span className="text-sm font-semibold w-4 text-center">{quantityInCart}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50"
                            onClick={onIncrement}
                        >
                            <span className="font-bold">+</span>
                        </Button>
                    </div>
                ) : (
                    <Button size="icon" className="rounded-full shrink-0 bg-white border border-gray-200 text-gray-900 hover:bg-green-700 hover:text-white" onClick={onAddToCart}>
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Agregar al carrito</span>
                    </Button>
                )}
            </div>
        </Link>
    )
}
