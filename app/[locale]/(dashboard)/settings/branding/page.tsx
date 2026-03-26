"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Upload, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/lib/auth-context"
import { dbGet, dbUpdate } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const colorPresets = [
  { name: "Dark", value: "#0f172a" },
  { name: "Blue", value: "#1e40af" },
  { name: "Green", value: "#166534" },
  { name: "Red", value: "#b91c1c" },
  { name: "Orange", value: "#c2410c" },
]

export default function BrandingPage() {
  const { userData } = useAuth()
  const businessId = userData?.businessId
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slug, setSlug] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    primaryColor: "#0f172a",
    invoiceFooter: "",
  })

  useEffect(() => {
    async function loadBusinessData() {
      if (!businessId) return
      setLoading(true)
      try {
        const data = await dbGet(`businesses/${businessId}`)
        if (data) {
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            primaryColor: data.primaryColor || "#0f172a",
            invoiceFooter: data.invoiceFooter || "",
          })
          setSlug(data.slug || businessId)
        }
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: "Could not load business settings.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadBusinessData()
  }, [businessId, toast])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!businessId) return
    setSaving(true)
    try {
      await dbUpdate(`businesses/${businessId}`, formData)
      toast({
        title: "Settings Saved",
        description: "Your branding settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "Could not save business settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Branding Settings" description="Loading..." />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding Settings"
        description="Customize your business branding for invoices and public pages"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Basic information displayed on invoices and booking page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Upload your business logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Color</CardTitle>
              <CardDescription>Choose your primary brand color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChange("primaryColor", color.value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.primaryColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Footer</CardTitle>
              <CardDescription>
                Text displayed at the bottom of invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.invoiceFooter}
                onChange={(e) => handleChange("invoiceFooter", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Previews */}
        <div className="space-y-6">
          {/* Public Page Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Public Booking Page</CardTitle>
                <CardDescription>Preview of your customer-facing page</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/public/${slug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Full
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-background border-b">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      <span className="text-white font-bold text-sm">
                        {formData.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{formData.name}</p>
                      <p className="text-xs text-muted-foreground">Request a Service</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted">
                  <div className="space-y-2">
                    <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-8 bg-background rounded border" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                    <div className="h-8 bg-background rounded border" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Invoice Preview</CardTitle>
                <CardDescription>Preview of your invoice design</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/invoice-preview">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{formData.name}</p>
                      <p className="text-xs text-muted-foreground">{formData.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">INVOICE</p>
                    <p className="text-xs text-muted-foreground">INV-2026-0042</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Service</span>
                    <span>$95.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>$95.00</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {formData.invoiceFooter}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
