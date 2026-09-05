"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { login } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)

    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-depth flex items-center justify-center min-h-screen w-full relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-500 rounded-2xl blur opacity-20 animate-pulse"></div>
        <Card className="w-full glass-card border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <CardHeader className="space-y-2 text-center flex flex-col items-center pt-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner backdrop-blur-md">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">Admin Portal</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your administrator credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wider uppercase text-muted-foreground" htmlFor="email">
                  Email Address
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  className="glass-input h-12 text-base"
                  placeholder="admin@example.com" 
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-400 font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wider uppercase text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  className="glass-input h-12 text-base"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-400 font-medium">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              {error && (
                <div className="p-4 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm animate-in fade-in">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg mt-4" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In to Admin Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
