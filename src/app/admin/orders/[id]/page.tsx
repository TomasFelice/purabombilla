"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Package, Truck, User, CreditCard } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { getOrderStatusLabel } from "@/lib/utils"

export default function AdminOrderDetails() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!params.id) return

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single()

            if (orderError) {
                console.error("Error fetching order:", orderError)
                return
            }

            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', params.id)

            if (itemsError) {
                console.error("Error fetching items:", itemsError)
                return
            }

            setOrder(orderData)
            setItems(itemsData || [])
            setLoading(false)
        }

        fetchOrderDetails()
    }, [params.id])

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return
        setUpdating(true)

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', order.id)

        if (error) {
            console.error("Error updating status:", error)
            alert("Error al actualizar el estado")
        } else {
            setOrder({ ...order, status: newStatus })
        }
        setUpdating(false)
    }

    if (loading) {
        return <div className="p-8 text-center">Cargando detalles del pedido...</div>
    }

    if (!order) {
        return <div className="p-8 text-center">Pedido no encontrado</div>
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="bg-card border-b px-6 py-4 sticky top-0 z-10 border-border">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Pedido #{order.id.slice(0, 8)}</h1>
                        <div className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" /> Productos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 py-2">
                                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-border">
                                            {item.products?.image_url ? (
                                                <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{item.products?.name || "Producto eliminado"}</div>
                                            <div className="text-sm text-muted-foreground">Cantidad: {item.quantity}</div>
                                        </div>
                                        <div className="font-medium">
                                            ${item.unit_price.toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                    <span>Total</span>
                                    <span>${order.total.toLocaleString('es-AR')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" /> Estado del Pedido
                                </CardTitle>
                                <CardDescription>Actualizar el estado actual de este pedido.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Select
                                        value={order.status}
                                        onValueChange={handleStatusChange}
                                        disabled={updating}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="paid">Pagado</SelectItem>
                                            <SelectItem value="processing">En preparación</SelectItem>
                                            <SelectItem value="shipped">Enviado</SelectItem>
                                            <SelectItem value="delivered">Entregado</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {updating && <span className="text-sm text-muted-foreground animate-pulse">Actualizando...</span>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" /> Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Nombre</div>
                                    <div>{order.customer_name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                                    <div className="break-all">{order.customer_email || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Teléfono</div>
                                    <div>{order.customer_phone || "-"}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping/Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" /> Envío
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Dirección</div>
                                    <div className="whitespace-pre-wrap">{order.customer_address || "Retiro en tienda / No especificada"}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method (Placeholder if not in DB) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" /> Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Estado</div>
                                    <div className="capitalize">{getOrderStatusLabel(order.status)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
