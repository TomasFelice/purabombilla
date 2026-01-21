
import { notFound } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AddToCartForm } from "@/components/product/add-to-cart-form"
import { createClient } from "@/lib/supabase-server"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!productData) {
        return {
            title: 'Producto no encontrado | purabombilla',
        }
    }

    // Cast to any to avoid TS errors
    const product = productData as any

    const previousImages = (await parent).openGraph?.images || []
    const productImages = product.images || (product.image_url ? [product.image_url] : [])

    return {
        title: product.name,
        description: product.description || `Comprá ${product.name} en purabombilla. Calidad premium y envíos a todo el país.`,
        openGraph: {
            images: [...productImages, ...previousImages],
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: productData, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single()

    if (error || !productData) {
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching product:", error)
        }
        notFound()
    }

    // Cast data for TS
    const p = productData as any

    const product = {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || "",
        images: p.images || (p.image_url ? [p.image_url] : []),
        category: p.categories?.slug || "general",
        slug: p.slug,
        description: p.description || "",
        stock: p.stock
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description,
                        image: product.images,
                        offers: {
                            '@type': 'Offer',
                            price: product.price,
                            priceCurrency: 'ARS',
                            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        },
                    }),
                }}
            />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery (Simple for now) */}
                    <div className="relative bg-muted rounded-lg overflow-hidden border border-border">
                        {product.images && product.images.length > 0 ? (
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {product.images.map((img: string, idx: number) => (
                                        <CarouselItem key={idx}>
                                            <div className="relative aspect-square w-full h-full">
                                                <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </Carousel>
                        ) : (
                            <div className="aspect-square flex h-full w-full items-center justify-center text-muted-foreground">Sin imagen</div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div className="mb-6">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">{p.categories?.name || p.categories?.slug || "General"}</span>
                            <h1 className="text-3xl font-bold text-foreground mt-2 font-sans">{product.name}</h1>
                            <p className="text-2xl font-semibold text-foreground mt-4">${product.price.toLocaleString('es-AR')}</p>
                        </div>

                        <div className="prose prose-stone max-w-none text-muted-foreground mb-8 font-secondary">
                            <p>{product.description}</p>
                        </div>

                        {/* Add to Cart Section */}
                        <AddToCartForm product={product} />

                        <div className="mt-8 pt-8 border-t border-border text-sm text-muted-foreground">
                            <p className="mb-2">🚚 Envíos a todo el país.</p>
                            {product.stock > 0 ? (
                                <p>📦 Stock disponible: {product.stock} unidades.</p>
                            ) : (
                                <p className="text-blue-600 font-medium">📦 Disponible por encargue.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
