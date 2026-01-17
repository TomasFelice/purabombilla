import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://purabombilla.com'
    const supabase = await createClient()

    // Static routes
    const routes = [
        '',
        '/productos',
        // Add other static routes here like /about, /contact if they exist
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic routes (Products)
    const { data } = await supabase
        .from('products')
        .select('slug,updated_at')

    const products = data as { slug: string; updated_at: string | null }[] | null

    const productRoutes = products?.map((product) => ({
        url: `${baseUrl}/producto/${product.slug}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    })) || []

    return [...routes, ...productRoutes]
}
