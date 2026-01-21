"use client"

import { useState, useId } from "react"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct, uploadProductImage, deleteProduct } from "@/lib/actions/product-actions"
import { generateProductDescription } from "@/lib/actions/ai-actions"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Loader2, Upload, Wand2, X, GripVertical, Trash } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Category {
    id: string
    name: string
}

interface GalleryItem {
    id: string
    url: string
    file?: File
}

interface SortableImageProps {
    id: string
    url: string
    onRemove: (id: string) => void
    isMain: boolean
}

function SortableImage({ id, url, onRemove, isMain }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group aspect-square rounded-md border bg-muted overflow-hidden"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 z-10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20"
            >
                <GripVertical className="bg-white/80 p-1 rounded-sm text-black" />
            </div>

            <img src={url} alt="Product image" className="w-full h-full object-cover" />

            {isMain && (
                <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-md">
                    Principal
                </div>
            )}

            <button
                type="button"
                onClick={() => onRemove(id)}
                className="absolute top-2 right-2 z-20 bg-destructive/90 text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    )
}

interface ProductFormProps {
    categories: Category[]
    initialData?: any // Product data for editing
}

export default function AdminProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
    const [contextOpen, setContextOpen] = useState(false)
    const [additionalContext, setAdditionalContext] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Initialize gallery items from initial data
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
        const items: GalleryItem[] = []

        // Handle legacy single image
        if (initialData?.image_url && !initialData?.images?.length) {
            items.push({
                id: 'legacy-main',
                url: initialData.image_url
            })
        }

        // Handle array of images
        if (initialData?.images && initialData.images.length > 0) {
            initialData.images.forEach((url: string, index: number) => {
                // Avoid duplicate if legacy main is same as first image
                if (index === 0 && items.length > 0 && items[0].url === url) return;

                items.push({
                    id: `existing-${index}`,
                    url: url
                })
            })
        }

        return items
    })

    const id = useId()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        price: initialData?.price || "",
        stock: initialData?.stock || "",
        category_id: initialData?.category_id || "",
        description: initialData?.description || "",
        featured: initialData?.featured || false,
        image_url: initialData?.image_url || "",
        cost_price: initialData?.cost_price || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // ... (keep handleToggle and handleNameBlur unchanged)

    const handleToggle = () => {
        setFormData((prev) => ({ ...prev, featured: !prev.featured }))
    }

    const handleNameBlur = () => {
        if (!formData.slug && formData.name) {
            const slug = formData.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
            setFormData((prev) => ({ ...prev, slug }))
        }
    }

    // ... (keep description handlers)

    // AI Description Generation
    const handleOpenDescriptionModal = () => {
        if (!formData.name && !formData.category_id) {
            toast.error("Falta información", { description: "Ingresa nombre y categoría." })
            return
        }
        setContextOpen(true)
    }

    const confirmGenerateDescription = async () => {
        setContextOpen(false)
        setIsGeneratingDescription(true)

        try {
            const categoryName = categories.find(c => c.id === formData.category_id)?.name || "General"
            const result = await generateProductDescription(formData.name, categoryName, additionalContext)

            if (result.text) {
                setFormData(prev => ({ ...prev, description: result.text }))
                toast.success("Descripción generada")
            } else if (result.error) {
                toast.error("Error", { description: result.error })
            }
        } catch (error) {
            toast.error("Error al generar descripción")
        } finally {
            setIsGeneratingDescription(false)
            setAdditionalContext("")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)

            const newItems: GalleryItem[] = files.map(file => ({
                id: `new-${Math.random().toString(36).substr(2, 9)}`,
                url: URL.createObjectURL(file),
                file: file
            }))

            setGalleryItems(prev => [...prev, ...newItems])

            // Clear file input
            e.target.value = ''
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setGalleryItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleRemoveImage = (id: string) => {
        setGalleryItems(prev => prev.filter(item => item.id !== id))
    }

    const handleDelete = async () => {
        if (!initialData?.id) return

        setLoading(true)
        try {
            const result = await deleteProduct(initialData.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Producto eliminado correctamente")
                router.push('/admin')
            }
        } catch (error) {
            toast.error("Error al eliminar el producto")
        } finally {
            setLoading(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Check session first
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("No hay sesión activa", { description: "Por favor inicia sesión nuevamente." })
                setLoading(false)
                return
            }

            // Process images
            // Process images in parallel
            const uploadPromises = galleryItems.map(async (item) => {
                if (item.file) {
                    // Upload new file
                    const imageFormData = new FormData()
                    imageFormData.append('file', item.file)

                    const result = await uploadProductImage(imageFormData)

                    if (result.error) {
                        console.error("Upload error:", result.error)
                        toast.error(`Error subiendo imagen: ${item.file.name}`)
                        return null
                    }

                    return result.url
                } else {
                    // Keep existing URL
                    return item.url
                }
            })

            const uploadResults = await Promise.all(uploadPromises)
            const finalImageUrls = uploadResults.filter((url): url is string => url !== null)

            if (finalImageUrls.length < galleryItems.length) {
                toast.warning("Algunas imágenes no se pudieron subir")
            }

            // Set main image to the first one in the ordered list
            const mainImageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : ""



            const data = new FormData()
            data.append("name", formData.name)
            data.append("slug", formData.slug)
            data.append("price", formData.price)
            data.append("stock", formData.stock)
            data.append("category_id", formData.category_id)
            data.append("description", formData.description)
            data.append("image_url", mainImageUrl)
            data.append("images", JSON.stringify(finalImageUrls))
            data.append("cost_price", formData.cost_price)
            data.append("featured", String(formData.featured))

            let result
            if (initialData?.id) {
                result = await updateProduct(initialData.id, data)
            } else {
                result = await createProduct(data)
            }

            if (result?.error) {
                alert(result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>{initialData ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Producto</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleNameBlur}
                                    placeholder="Ej: Mate Imperial"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="ej-mate-imperial"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio ($)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost_price">Costo ($)</Label>
                                <Input
                                    id="cost_price"
                                    name="cost_price"
                                    type="number"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                    placeholder="Interno"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoría</Label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="description">Descripción</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenDescriptionModal}
                                    disabled={isGeneratingDescription}
                                >
                                    {isGeneratingDescription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generar con IA
                                </Button>
                            </div>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>

                        <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Galería de Imágenes</Label>
                                <span className="text-xs text-muted-foreground">
                                    {galleryItems.length > 0 ? `${galleryItems.length} imágenes` : "Sin imágenes"}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="imageFile">Subir Archivos</Label>
                                    <Input
                                        id="imageFile"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <p className="text-xs text-muted-foreground">La primera imagen será la principal del producto. Arrastra para reordenar.</p>
                                </div>

                                {galleryItems.length > 0 ? (
                                    <DndContext
                                        id={id}
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={galleryItems.map(item => item.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {galleryItems.map((item, index) => (
                                                    <SortableImage
                                                        key={item.id}
                                                        id={item.id}
                                                        url={item.url}
                                                        onRemove={handleRemoveImage}
                                                        isMain={index === 0}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                ) : (
                                    <div className="h-32 border border-dashed rounded-md flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-sm">No hay imágenes cargadas</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={formData.featured}
                                onChange={handleToggle}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                            />
                            <Label htmlFor="featured">Producto Destacado</Label>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            {initialData?.id ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    disabled={loading}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Eliminar Producto
                                </Button>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {initialData ? "Guardar Cambios" : "Crear Producto"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Description Modal */}
            <Dialog open={contextOpen} onOpenChange={setContextOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generar Descripción con IA</DialogTitle>
                        <DialogDescription>Aporta contexto adicional.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="context" className="mb-2 block">Cualidades adicionales</Label>
                        <Textarea
                            id="context"
                            placeholder="Ej: Es de acero inoxidable..."
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContextOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmGenerateDescription} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Wand2 className="mr-2 h-4 w-4" /> Generar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "{formData.name}" de la base de datos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </>
    )
}
