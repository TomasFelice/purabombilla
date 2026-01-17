'use server'

import { createClient } from '@/lib/supabase-server'

export type OrderDetails = {
    id: string
    created_at: string
    status: string
    total: number
    customer_address: string
    delivery_type: string
    items: {
        product: {
            name: string
            image_url: string
        }
        quantity: number
        unit_price: number
    }[]
}

export async function getPublicOrder(orderId: string) {
    if (!orderId) return { error: 'Order ID is required' }

    const supabase = await createClient()

    // Query order with items and product details
    // Note: We need to make sure the relationship exists in Supabase. 
    // Usually it's automatic if foreign keys are set up.
    // If not, we might need to do two queries.

    // First, try a joined query assuming relations are set up.
    // We select specific fields to avoid leaking sensitive data (though createClient is server-side, returning all data to client might be bad).
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            status,
            total,
            customer_address,
            metadata,
            order_items (
                quantity,
                unit_price,
                products (
                    name,
                    image_url
                )
            )
        `)
        .eq('id', orderId)
        .single()

    if (error) {
        console.error('Error fetching order:', error)
        return { error: 'No se encontró el pedido o hubo un error.' }
    }

    if (!order) {
        return { error: 'Pedido no encontrado.' }
    }

    // Transform to a cleaner structure if needed, or return as is.
    // Extract metadata values for convenience
    const metadata = order.metadata as any
    const deliveryType = metadata?.deliveryType || (order.customer_address === 'Retiro por local' ? 'retiro' : 'envio')

    return {
        success: true,
        order: {
            ...order,
            delivery_type: deliveryType,
            items: order.order_items.map((item: any) => ({
                quantity: item.quantity,
                unit_price: item.unit_price,
                product: item.products
            }))
        }
    }
}
