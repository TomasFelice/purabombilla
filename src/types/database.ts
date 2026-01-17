export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    stock: number
                    image_url: string | null
                    category_id: string | null
                    slug: string
                    featured: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    stock?: number
                    image_url?: string | null
                    category_id?: string | null
                    slug: string
                    featured?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    stock?: number
                    image_url?: string | null
                    category_id?: string | null
                    slug?: string
                    featured?: boolean | null
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    created_at: string
                    status: string
                    total: number
                    customer_name: string
                    customer_email: string | null
                    customer_phone: string | null
                    customer_address: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    status?: string
                    total?: number
                    customer_name: string
                    customer_email?: string | null
                    customer_phone?: string | null
                    customer_address?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    status?: string
                    total?: number
                    customer_name?: string
                    customer_email?: string | null
                    customer_phone?: string | null
                    customer_address?: string | null
                    metadata?: Json | null
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string | null
                    product_id: string | null
                    quantity: number
                    unit_price: number
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price: number
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price?: number
                }
            }
        }
    }
}
