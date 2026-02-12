
"use client"

import { useState } from "react"
import { CheckCircle, MessageCircle } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
    const cart = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [successData, setSuccessData] = useState<{ whatsappUrl: string } | null>(null)
    const [deliveryType, setDeliveryType] = useState<'retiro' | 'correo_argentino' | 'envio_express'>('correo_argentino')
    const [shippingOption, setShippingOption] = useState<'domicilio' | 'sucursal'>('domicilio')

    const total = cart.totalPrice()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        const orderData = {
            ...data,
            cart: cart.items,
            total,
            deliveryType,
            shippingOption: deliveryType === 'correo_argentino' ? shippingOption : null
        }

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })

            if (response.ok) {
                const result = await response.json()
                cart.clearCart()
                setSuccessData({ whatsappUrl: result.whatsappUrl })
            } else {
                alert('Hubo un error al procesar el pedido. Intenta nuevamente.')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión.')
        } finally {
            setLoading(false)
        }
    }

    if (cart.items.length === 0 && !successData) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                        <Button onClick={() => router.push('/productos')}>Ir al Catálogo</Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (successData) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <Card className="max-w-md w-full text-center p-6">
                        <CardHeader>
                            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-lg text-muted-foreground">
                                Próximamente nos pondremos en contacto con vos para coordinar el envío y el pago.
                            </p>

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                Para finalizar, envianos el detalle de tu pedido por WhatsApp.
                            </div>

                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12 text-lg"
                                    onClick={() => window.open(successData.whatsappUrl, '_blank')}
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Finalizar en WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push('/')}
                                >
                                    Volver al Inicio
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de Contacto y Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input id="name" name="name" required placeholder="Ej: Juan Pérez" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">WhatsApp / Teléfono</Label>
                                    <Input id="phone" name="phone" required placeholder="Ej: 11 1234 5678" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required placeholder="ejemplo@email.com" />
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <Label>Método de Entrega</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition ${deliveryType === 'correo_argentino' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                                            onClick={() => setDeliveryType('correo_argentino')}
                                        >
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">Correo Argentino</div>
                                                <div className="text-xs text-muted-foreground">Todo el país</div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition ${deliveryType === 'envio_express' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                                            onClick={() => setDeliveryType('envio_express')}
                                        >
                                            <div className="bg-yellow-100 p-2 rounded-full">
                                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">Envío Express (En el día)</div>
                                                <div className="text-xs text-muted-foreground">Solo AMBA - Comprando antes de las 13hs</div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition ${deliveryType === 'retiro' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                                            onClick={() => setDeliveryType('retiro')}
                                        >
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">Retiro por Local</div>
                                                <div className="text-xs text-muted-foreground">Buenos Aires, La Matanza</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {deliveryType === 'correo_argentino' && (
                                    <div className="bg-secondary/20 p-4 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        <Label>Preferencia de Entrega</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="shipping_option"
                                                    value="domicilio"
                                                    checked={shippingOption === 'domicilio'}
                                                    onChange={() => setShippingOption('domicilio')}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span>A Domicilio</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="shipping_option"
                                                    value="sucursal"
                                                    checked={shippingOption === 'sucursal'}
                                                    onChange={() => setShippingOption('sucursal')}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span>A Sucursal</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {deliveryType === 'envio_express' && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 text-sm text-yellow-800 animate-in fade-in slide-in-from-top-2">
                                        <div className="shrink-0 mt-0.5">⚠️</div>
                                        <p><strong>Atención:</strong> Este servicio está disponible <strong>EXCLUSIVAMENTE para AMBA</strong>. Si sos del interior, por favor seleccioná Correo Argentino.</p>
                                    </div>
                                )}

                                {deliveryType !== 'retiro' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="province">Provincia</Label>
                                                <Input id="province" name="province" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Localidad</Label>
                                                <Input id="city" name="city" required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <Label htmlFor="address">Dirección (Calle y Altura)</Label>
                                                <Input id="address" name="address" required placeholder="Calle 123" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zip">CP</Label>
                                                <Input id="zip" name="zip" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Observaciones (Opcional)</Label>
                                            <Input id="notes" name="notes" placeholder="Piso, Depto, Entre calles..." />
                                        </div>
                                    </div>
                                )}

                                {deliveryType === 'retiro' && (
                                    <div className="bg-secondary/20 p-4 rounded-lg text-sm text-gray-600 animate-in fade-in">
                                        <p>Te enviaremos la dirección exacta y horarios de retiro por WhatsApp una vez confirmado el pedido.</p>
                                    </div>
                                )}

                                <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md mb-4 flex gap-2">
                                    <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>Serás redirigido a WhatsApp para coordinar el pago {deliveryType !== 'retiro' && 'y el costo del envío'} directamente con nosotros.</p>
                                </div>

                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4" disabled={loading}>
                                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="h-fit sticky top-24">
                        <CardHeader>
                            <CardTitle>Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500">{item.quantity}x</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Productos</span>
                                    <span>${total.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="text-sm text-muted-foreground flex justify-between pt-2">
                                    <span>Envío</span>
                                    <span className="italic">A coordinar</span>
                                </div>
                                <CardDescription className="text-xs mt-2 border-t pt-2">
                                    * El costo de envío se calculará y abonará al finalizar la compra por WhatsApp.
                                </CardDescription>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
