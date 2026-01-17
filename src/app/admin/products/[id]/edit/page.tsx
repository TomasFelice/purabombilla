import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import AdminProductForm from '@/components/admin/admin-product-form'
import Link from 'next/link'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    // Fetch product
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="bg-card border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-border">
                <Link href="/admin">
                    <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">PuraBombilla Admin</h1>
                </Link>
                <div className="text-sm text-muted-foreground font-medium">Editar Producto</div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Editar Producto</h2>
                    <p className="text-muted-foreground mb-6">Modifica los detalles del producto.</p>

                    <AdminProductForm categories={categories || []} initialData={product} />
                </div>
            </main>
        </div>
    )
}
