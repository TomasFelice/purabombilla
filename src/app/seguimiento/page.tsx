import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getOrderStatusLabel } from "@/lib/utils"
import { getPublicOrder } from "@/lib/actions/order"
import { Search, Package, MapPin, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
    title: 'Seguimiento de Pedido | purabombilla',
    description: 'Revisá el estado de tu pedido en tiempo real.',
}

export default async function TrackingPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const { id } = await searchParams
    let orderResult = null

    if (id) {
        orderResult = await getPublicOrder(id)
    }

    const { order, error } = orderResult || {}

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[60vh]">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Seguimiento de Pedido</h1>
                <p className="text-muted-foreground">
                    Ingresá tu número de pedido para ver el estado y los detalles.
                </p>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <form action="/seguimiento" method="GET" className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="id"
                                placeholder="Ej: 550e8400-e29b..."
                                defaultValue={id}
                                className="pl-9"
                                required
                            />
                        </div>
                        <Button type="submit">
                            Buscar Pedido
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {id && error && (
                <div className="text-center py-12 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                        <Package className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-1">No encontramos ese pedido</h3>
                    <p className="text-red-700 max-w-md mx-auto">
                        {error} Verificá que el ID sea correcto e tentalo nuevamente.
                    </p>
                </div>
            )}

            {id && order && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Status Card */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">Pedido #{order.id.slice(0, 8)}</CardTitle>
                                <CardDescription>
                                    Realizado el {new Date(order.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Badge className="text-base px-4 py-1 capitalize" variant={
                                order.status === 'pending' ? 'secondary' :
                                    order.status === 'completed' ? 'default' :
                                        'outline'
                            }>
                                {getOrderStatusLabel(order.status)}
                            </Badge>
                        </CardHeader>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Order Details */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Productos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="relative h-16 w-16 min-w-16 rounded-md overflow-hidden bg-muted border">
                                                {item.product?.image_url && (
                                                    <Image
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium line-clamp-2">{item.product?.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Cantidad: {item.quantity} x ${item.unit_price.toLocaleString('es-AR')}
                                                </p>
                                            </div>
                                            <div className="font-medium">
                                                ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                                            </div>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg pt-2">
                                        <span>Total</span>
                                        <span>${order.total.toLocaleString('es-AR')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Entrega</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium capitalize">{order.delivery_type === 'envio' ? 'Envío a domicilio' : 'Retiro por local'}</p>
                                            <p className="text-muted-foreground mt-1">{order.customer_address}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Link href="/" className="block">
                                <Button variant="outline" className="w-full gap-2">
                                    Volver a la tienda
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


