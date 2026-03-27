"use client"
import { useTranslations } from "next-intl"

import { useState, useEffect, use } from "react"
import { Briefcase, Phone, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"

export default function PublicBookingPage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const t = useTranslations("Public")
  const { businessSlug } = use(params)
  
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [businessData, setBusinessData] = useState<any>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })

  const serviceTypes = ["AC Servicing", "Plumbing", "Electrical", "Cleaning", "Pest Control", "Other"] // Can be mapped to t(`services.${type}`) if needed // Can be mapped to t(`services.${type}`) if needed

  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [businessNotFound, setBusinessNotFound] = useState(false)

  useEffect(() => {
    async function loadBusinessInfo() {
      try {
        // For slug to businessId resolution, look through all businesses.
        // Ideally move to a slug-index node `/slugIndex/${slug}` → businessId for O(1) lookup.
        const businessesRef = ref(database, 'businesses')
        const snapshot = await get(businessesRef)
        if (snapshot.exists()) {
          const businesses = snapshot.val()
          for (const [id, data] of Object.entries(businesses)) {
            if ((data as any).slug === businessSlug || id === businessSlug) {
              setBusinessId(id)
              setBusinessData(data)
              return
            }
          }
        }
        setBusinessNotFound(true)
      } catch (err) {
        console.error("Failed to load business info", err)
        setBusinessNotFound(true)
      } finally {
        setLoadingBusiness(false)
      }
    }
    loadBusinessInfo()
  }, [businessSlug])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessId) return
    setLoading(true)
    
    try {
      const bookingsRef = ref(database, `bookings/${businessId}`)
      const newBookingRef = push(bookingsRef)
      
      await set(newBookingRef, {
        customerName: formData.name,
        customerPhone: formData.phone,
        address: formData.address,
        serviceType: formData.serviceType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: formData.notes,
        status: "new",
        source: "Public Page",
        createdAt: new Date().toISOString()
      })
      
      setSubmitted(true)
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to submit your request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-muted p-8">
        <Skeleton className="h-[600px] max-w-2xl mx-auto" />
      </div>
    )
  }

  if (businessNotFound || !businessData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold">{t("pageNotFound")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("pageNotFoundDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mt-4">{t("requestReceived")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("thankYou")}
            </p>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>
              {t("submitAnother")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b" style={{ borderColor: businessData.primaryColor }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: businessData.primaryColor || "#0f172a" }}
            >
              {businessData.name?.substring(0, 2).toUpperCase() || "BZ"}
            </div>
            <div>
              <h1 className="text-xl font-bold">{businessData.name}</h1>
              <p className="text-sm text-muted-foreground">Professional Service Solutions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("requestService")}</CardTitle>
            <CardDescription>
              {t("fillOutForm")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">{t("serviceType")}</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => handleChange("serviceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectService")} />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("yourName")}</Label>
                  <Input
                    id="name"
                    placeholder={t("enterName")}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phoneNumber")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("enterPhone")}
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("serviceAddress")}</Label>
                  <Input
                    id="address"
                    placeholder="Enter the address for the service"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">{t("preferredDate")}</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleChange("preferredDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">{t("preferredTime")}</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => handleChange("preferredTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTime")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">{t("morning")}</SelectItem>
                      <SelectItem value="Afternoon">{t("afternoon")}</SelectItem>
                      <SelectItem value="Evening">{t("evening")}</SelectItem>
                      <SelectItem value="Flexible">{t("flexible")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("notesPlaceholder")}
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t("submitting") : t("submitRequest")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Elements */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We will contact you shortly to confirm your appointment.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {businessData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{businessData.phone}</span>
              </div>
            )}
            {businessData.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{businessData.email}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
