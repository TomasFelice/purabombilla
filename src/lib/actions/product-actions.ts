'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// @ts-ignore
import convert from 'heic-convert'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const category_id = formData.get('category_id') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string
    const images = JSON.parse(formData.get('images') as string || '[]')
    const cost_price = parseFloat(formData.get('cost_price') as string || '0')
    const featured = formData.get('featured') === 'true'

    if (!name || !slug || !price || !category_id) {
        return { error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase
        .from('products')
        // @ts-ignore
        .insert({
            name,
            slug,
            price,
            stock,
            category_id,
            description,
            image_url,
            images,
            cost_price,
            featured
        } as any)

    if (error) {
        console.error('Error creating product:', error)
        return { error: 'Error al crear el producto' }
    }

    revalidatePath('/admin')
    revalidatePath('/products')
    redirect('/admin')
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const category_id = formData.get('category_id') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string
    const images = JSON.parse(formData.get('images') as string || '[]')
    const cost_price = parseFloat(formData.get('cost_price') as string || '0')
    const featured = formData.get('featured') === 'true'

    const { error } = await supabase
        .from('products')
        // @ts-ignore
        .update({
            name,
            slug,
            price,
            stock,
            category_id,
            description,
            image_url,
            images,
            cost_price,
            featured
        } as any)
        .eq('id', id)

    if (error) {
        console.error('Error updating product:', error)
        return { error: 'Error al actualizar el producto' }
    }

    revalidatePath('/admin')
    revalidatePath('/products')
    redirect('/admin')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: 'Error al eliminar el producto' }
    }

    revalidatePath('/admin')
    revalidatePath('/products')
}

export async function uploadProductImage(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File

    if (!file) {
        return { error: 'No file provided' }
    }

    let fileBuffer = Buffer.from(await file.arrayBuffer())
    let contentType = file.type
    let fileName = file.name

    // Check if HEIC
    if (contentType === 'image/heic' || contentType === 'image/heif' || fileName.toLowerCase().endsWith('.heic') || fileName.toLowerCase().endsWith('.heif')) {
        try {
            const outputBuffer = await convert({
                buffer: fileBuffer,
                format: 'JPEG',
                quality: 0.8
            });
            fileBuffer = Buffer.from(outputBuffer);
            contentType = 'image/jpeg';
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        } catch (e) {
            console.error("Error converting HEIC:", e);
            return { error: 'Error converting HEIC image' }
        }
    }

    // sanitize filename
    const fileExt = fileName.split('.').pop()
    const uniqueName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${uniqueName}`

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, fileBuffer, {
            contentType: contentType,
            upsert: false
        })

    if (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: 'Error uploading image' }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

    return { url: publicUrl }
}
