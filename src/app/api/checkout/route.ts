
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
// In a real app, this should be an environment variable
const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const { name, phone, email, address, city, province, zip, notes, deliveryType, shippingOption, cart, total } = data
        const supabase = await createClient()

        // 1. Determine Delivery Details
        let deliveryLabel = ''
        let deliveryDetails = ''

        if (deliveryType === 'retiro') {
            deliveryLabel = 'Retiro por Local'
            deliveryDetails = 'El cliente retirará por el local.'
        } else if (deliveryType === 'envio_express') {
            deliveryLabel = 'Envío Express (AMBA)'
            deliveryDetails = `${address}, ${city}, ${province}, CP ${zip}${notes ? `\n(Obs: ${notes})` : ''}`
        } else if (deliveryType === 'correo_argentino') {
            const mode = shippingOption === 'sucursal' ? 'A Sucursal' : 'A Domicilio'
            deliveryLabel = `Correo Argentino (${mode})`
            deliveryDetails = `${address}, ${city}, ${province}, CP ${zip}${notes ? `\n(Obs: ${notes})` : ''}`
        }

        // 2. Create Order in Supabase
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                customer_address: deliveryDetails.replace(/\n/g, ' '), // Flatten for simple column
                total: total,
                status: 'pending',
                metadata: {
                    deliveryType,
                    shippingOption,
                    city,
                    province,
                    zip,
                    notes,
                    address
                }
            } as any)
            .select()
            .single()

        const order = orderData as any

        if (orderError) {
            console.error('Error creating order:', orderError)
            throw new Error('Failed to create order')
        }

        // 3. Create Order Items
        const orderItems = cart.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Error creating order items:', itemsError)
        }

        // 3.5 Deduct Stock
        // 3.5 Deduct Stock
        for (const item of cart) {
            // Get current stock
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single()

            if (product && !fetchError) {
                // @ts-ignore
                const currentStock = product.stock || 0
                const newStock = currentStock - item.quantity

                await supabase
                    .from('products')
                    .update({ stock: newStock } as any)
                    .eq('id', item.id)
            }
        }

        // 4. Format Message for Telegram
        const itemsList = cart.map((item: any) => `- ${item.quantity}x ${item.name} ($${item.price})`).join('\n')
        const message = `
📦 *NUEVO PEDIDO WEB* #${order.id.slice(0, 8)}

👤 *Cliente:* ${name}
📞 *WhatsApp:* ${phone}
📧 *Email:* ${email}

🚚 *Método:* ${deliveryLabel}
${deliveryType !== 'retiro' ? `📍 *Destino:* ${deliveryDetails}` : ''}

🛒 *Productos:*
${itemsList}

💰 *Total Productos:* $${total.toLocaleString('es-AR')}
${deliveryType !== 'retiro' ? '_(Envío a coordinar)_' : ''}
        `

        // Send to Telegram
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            })
        } else {
            console.warn('Telegram credentials not set')
        }

        // Generate WhatsApp Link for user redirection
        const whatsappMessage = `Hola purabombilla! Realicé el pedido #${order.id.slice(0, 8)} (${name}). Quería coordinar el pago y envío.`
        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`

        return NextResponse.json({ success: true, whatsappUrl, orderId: order.id })
    } catch (error) {
        console.error('Checkout Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
