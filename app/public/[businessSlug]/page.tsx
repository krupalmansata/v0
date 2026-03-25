"use client"

import { useState } from "react"
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
import { business, serviceTypes } from "@/lib/mock-data"

export default function PublicBookingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mt-4">Request Submitted</h2>
            <p className="text-muted-foreground mt-2">
              Thank you for your booking request. We will contact you shortly to confirm
              your appointment.
            </p>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{business.name}</h1>
              <p className="text-sm text-muted-foreground">Professional Service Solutions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Request a Service</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you within 24 hours to
              confirm your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => handleChange("serviceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the service you need" />
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
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Service Address</Label>
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
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleChange("preferredDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => handleChange("preferredTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning (8AM - 12PM)</SelectItem>
                      <SelectItem value="Afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="Evening">Evening (5PM - 8PM)</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or details about your request"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Request
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
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{business.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{business.email}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
