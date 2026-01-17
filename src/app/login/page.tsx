
"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert(error.message)
        } else {
            router.push('/admin')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
            <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg border border-border">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-primary font-sans">Iniciar Sesión</h2>
                    <p className="mt-2 text-sm text-muted-foreground font-secondary">Acceso exclusivo administradores (purabombilla)</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@admin.com" className="bg-background border-input" />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-background border-input" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
