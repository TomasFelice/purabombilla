import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase-server"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "purabombilla | Mates y Accesorios Premium",
  description: "Descubrí nuestra selección exclusiva de mates, bombillas y accesorios de diseño. Envíos a todo el país.",
}

export default async function Home() {
  const supabase = await createClient()

  const { data: featuredProductsData, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("featured", true)
    .limit(4)

  if (error) {
    console.error("Error fetching featured products:", error)
  }

  // Cast the data to avoid "never" inference issues with complex joins
  const products = featuredProductsData as any[]

  const featuredProducts = products?.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image_url || "",
    category: product.categories?.slug || "general",
    slug: product.slug,
    featured: product.featured || false,
    stock: product.stock
  })) || []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-24 px-4 text-center border-b border-border">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-6xl mb-6 font-sans">
              Mate Argentino, Estilo Premium.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 font-secondary">
              Descubrí nuestra selección exclusiva de mates, bombillas y accesorios. Diseño moderno, tradición artesanal.
            </p>
            <div className="flex justify-center gap-4 flex-col sm:flex-row">
              <Link href="/productos">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 w-full sm:w-auto">
                  Ver Colección
                </Button>
              </Link>
              <Link href="/productos?category=combos">
                <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                  Ver Combos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground font-sans">Destacados</h2>
              <Link href="/productos" className="text-sm font-semibold text-primary hover:underline font-secondary">
                Ver todo &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* About / Values Section - Optional */}
        <section className="py-16 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 font-sans">¿Por qué purabombilla?</h2>
            <p className="max-w-2xl mx-auto text-primary-foreground/90 mb-8 font-secondary">
              Nos dedicamos a comercializar los mejores productos materos del país, asegurando calidad, diseño y un servicio de entrega eficiente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-primary-foreground/80">
              <div>
                <div className="font-bold text-primary-foreground mb-2">Calidad Asegurada</div>
                <p className="text-sm">Tenemos una variante para cada bolsillo.</p>
              </div>
              <div>
                <div className="font-bold text-primary-foreground mb-2">Envío a Todo el País</div>
                <p className="text-sm">Llevamos el mate a tu puerta, estés donde estés.</p>
              </div>
              <div>
                <div className="font-bold text-primary-foreground mb-2">Atención Personalizada</div>
                <p className="text-sm">Estamos para asesorarte en tu elección ideal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
