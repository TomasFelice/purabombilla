
import { ProductCard } from "@/components/product/product-card"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { category, search } = await searchParams
    const supabase = await createClient()

    // Fetch categories
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name')

    const categories = (categoriesData as any[]) || []

    // Fetch products
    let query = supabase
        .from('products')
        .select('*, categories(name, slug)')

    if (category) {
        // Use !inner to filter by the related table
        query = supabase
            .from('products')
            .select('*, categories!inner(name, slug)')
            .eq('categories.slug', category as string)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data: productsData, error } = await query

    if (error) {
        console.error("Error fetching products:", error)
    }

    const products = (productsData as any[])?.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || "",
        category: p.categories?.slug || "general",
        slug: p.slug,
        featured: p.featured
    })) || []


    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Catálogo</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-64 shrink-0">
                        <h3 className="font-semibold mb-4">Categorías</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/productos">
                                <Button variant={!category ? "secondary" : "ghost"} className="w-full justify-start">
                                    Todos
                                </Button>
                            </Link>
                            {categories.map((c) => (
                                <Link key={c.slug} href={`/productos?category=${c.slug}`}>
                                    <Button variant={category === c.slug ? "secondary" : "ghost"} className="w-full justify-start capitalize">
                                        {c.name}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </aside>

                    {/* Grid */}
                    <div className="flex-1">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No se encontraron productos en esta categoría.</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
