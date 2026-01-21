
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingBag, Trash, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getOrderStatusLabel } from "@/lib/utils"
import Link from "next/link"
import { deleteProduct } from "@/lib/actions/product-actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function AdminDashboard() {
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [productToDelete, setProductToDelete] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const { data: productsData } = await supabase
                .from('products')
                .select('*, categories(name)')
                .order('name')

            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (productsData) setProducts(productsData)
            if (ordersData) setOrders(ordersData)
            setLoading(false)
        }

        fetchData()
    }, [])

    const handleDeleteProduct = async () => {
        if (!productToDelete) return

        setIsDeleting(true)
        try {
            const result = await deleteProduct(productToDelete.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setProducts(products.filter(p => p.id !== productToDelete.id))
                toast.success("Producto eliminado correctamente")
                setProductToDelete(null)
            }
        } catch (error) {
            toast.error("Error al eliminar el producto")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-card border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-border">
                <Link href="/admin">
                    <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">PuraBombilla Admin</h1>
                </Link>
                <div className="text-sm text-muted-foreground font-medium">Panel de Control</div>
            </header>

            <main className="flex-1 p-6 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                            <a href="/admin/products/new">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                            </a>
                        </Button>
                    </div>

                    <Tabs defaultValue="products" className="w-full">
                        <TabsList className="bg-card p-1 rounded-md border border-border w-full sm:w-auto grid grid-cols-2 sm:flex">
                            <TabsTrigger value="products">Productos ({products.length})</TabsTrigger>
                            <TabsTrigger value="orders">Pedidos ({orders.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="products" className="mt-6">
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle>Inventario</CardTitle>
                                    <CardDescription>Gestioná tu catálogo de productos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-8">Cargando productos...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {products.map((product) => (
                                                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors border-border">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground capitalize">{product.categories?.name || 'Sin categoría'} · Stock: {product.stock}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-medium text-foreground">${product.price.toLocaleString('es-AR')}</div>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={`/admin/products/${product.id}/edit`}>Editar</a>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setProductToDelete(product)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {products.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">No hay productos.</div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-6">
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle>Pedidos Recientes</CardTitle>
                                    <CardDescription>Seguimiento de ventas.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-8">Cargando pedidos...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors gap-4 border-border">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                                                            <ShoppingBag className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">Pedido #{order.id.slice(0, 8)}</div>
                                                            <div className="text-sm text-muted-foreground">{order.customer_name} · {new Date(order.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                                                        <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'paid' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {getOrderStatusLabel(order.status)}
                                                        </div>
                                                        <div className="font-medium text-foreground min-w-[80px] text-right">
                                                            ${order.total.toLocaleString('es-AR')}
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={`/admin/orders/${order.id}`}>Ver Detalle</a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">No hay pedidos registrados.</div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "{productToDelete?.name}" de la base de datos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteProduct} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
