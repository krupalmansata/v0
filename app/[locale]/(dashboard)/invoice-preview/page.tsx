"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Download, Palette, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/ui/use-toast"

export default function InvoicePreviewPage() {
  const t = useTranslations("InvoicePreview")
  const { userData } = useAuth()
  const businessId = userData?.businessId
  const { toast } = useToast()
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoices, setInvoices] = useState<any[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const selectedRef = useRef<any>(null)

  useEffect(() => {
    if (!businessId) return

    let invoicesLoaded = false
    let businessLoaded = false

    const invoicesDbRef = ref(database, `invoices/${businessId}`)
    const businessDbRef = ref(database, `businesses/${businessId}`)

    const unsubscribeInvoices = onValue(invoicesDbRef, (snapshot) => {
      invoicesLoaded = true
      if (snapshot.exists()) {
        const data = snapshot.val()
        const items = Object.keys(data).map(key => ({ id: key, ...data[key] }))
        setInvoices(items)
        if (items.length > 0 && !selectedRef.current) {
          selectedRef.current = items[0]
          setSelectedInvoice(items[0])
        }
      } else {
        setInvoices([])
        selectedRef.current = null
        setSelectedInvoice(null)
      }
      if (businessLoaded) setLoading(false)
    })

    const unsubscribeBusiness = onValue(businessDbRef, (snapshot) => {
      businessLoaded = true
      if (snapshot.exists()) {
        setBusiness(snapshot.val())
      }
      if (invoicesLoaded) setLoading(false)
    })

    // Ensure loading finishes after a reasonable timeout
    const timeout = setTimeout(() => setLoading(false), 3000)

    return () => {
      unsubscribeInvoices()
      unsubscribeBusiness()
      clearTimeout(timeout)
    }
  }, [businessId])

  const captureInvoice = useCallback(async () => {
    if (!invoiceRef.current) return null
    const html2canvas = (await import("html2canvas-pro")).default
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })
    return canvas
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    if (!invoiceRef.current || !selectedInvoice) return
    setDownloading(true)
    try {
      const canvas = await captureInvoice()
      if (!canvas) return
      const { jsPDF } = await import("jspdf")
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      // A4: 210mm x 297mm
      const pdfWidth = 210
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth
      const pdf = new jsPDF({
        orientation: pdfHeight > 297 ? "portrait" : "portrait",
        unit: "mm",
        format: [pdfWidth, Math.max(pdfHeight, 297)],
      })
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${selectedInvoice.invoiceNumber || selectedInvoice.id}.pdf`)
      toast({ title: t("pdfSuccess"), description: t("pdfSuccessDesc") })
    } catch {
      toast({ title: t("pdfError"), description: t("pdfErrorDesc"), variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }, [selectedInvoice, captureInvoice, toast, t])

  const handleShareWhatsApp = useCallback(async () => {
    if (!selectedInvoice || !businessId) return
    setSharing(true)
    
    try {
      let publicUrl = selectedInvoice.publicPreviewUrl

      // Only upload if we haven't already cached the URL for this invoice
      if (!publicUrl) {
        if (!invoiceRef.current) throw new Error("Invoice not rendered yet")
        
        const canvas = await captureInvoice()
        if (!canvas) throw new Error("Failed to capture invoice")

        // Convert to JPEG blob at 0.7 quality — readable but storage-efficient
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
            "image/jpeg",
            0.7
          )
        })

        // Upload to Supabase Storage
        const filePath = `invoices/${businessId}/${selectedInvoice.id}.jpg`
        const { error: uploadError } = await supabase.storage
          .from("invoice-images")
          .upload(filePath, blob, { contentType: "image/jpeg", upsert: true })
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage
          .from("invoice-images")
          .getPublicUrl(filePath)
        publicUrl = urlData.publicUrl
        
        // Persist URL in DB so future shares skip the upload
        const invoiceDbRef = ref(database, `invoices/${businessId}/${selectedInvoice.id}`)
        await update(invoiceDbRef, { publicPreviewUrl: publicUrl })
        
        setSelectedInvoice((prev: any) => prev ? { ...prev, publicPreviewUrl: publicUrl } : prev)
      }

      // Open WhatsApp with the shareable link
      const invoiceNumber = selectedInvoice.invoiceNumber || selectedInvoice.id
      const text = `${t("invoiceLabel")} ${invoiceNumber} - ${selectedInvoice.customerName} - $${selectedInvoice.totalAmount}\n\nView Invoice: ${publicUrl}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
      
    } catch (err: any) {
      console.error("WhatsApp share error:", err)
      toast({ title: t("shareError"), description: String(err?.message || t("shareErrorDesc")), variant: "destructive" })
    } finally {
      setSharing(false)
    }
  }, [selectedInvoice, businessId, captureInvoice, toast, t])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("loading")} />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground">{t("recentInvoices")}</h2>
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground text-sm">
                {t("noInvoices")}
              </CardContent>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className={`cursor-pointer transition-colors ${
                  selectedInvoice?.id === invoice.id
                    ? "ring-2 ring-foreground"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  selectedRef.current = invoice
                  setSelectedInvoice(invoice)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{invoice.invoiceNumber || invoice.id}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                    </div>
                    <StatusBadge status={invoice.status || "draft"} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{invoice.issueDate}</span>
                    <span className="font-medium">${invoice.totalAmount}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>{t("invoicePreview")}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings/branding">
                        <Palette className="h-4 w-4 me-2" />{t("editBranding")}
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                    >
                      <Download className="h-4 w-4 me-2" />
                      {downloading ? t("generating") : t("downloadPdf")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShareWhatsApp}
                      disabled={sharing}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Share2 className="h-4 w-4 me-2" />
                      {sharing ? t("generating") : t("shareWhatsApp")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={invoiceRef} className="p-4 sm:p-8 bg-white text-black">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-8 gap-6 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: business?.primaryColor || "#0f172a" }}
                      >
                        {business?.name?.substring(0,2).toUpperCase() || "BZ"}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{business?.name || ""}</p>
                        <p className="text-sm text-gray-500">{business?.email || ""}</p>
                        <p className="text-sm text-gray-500">{business?.phone || ""}</p>
                      </div>
                    </div>
                    <div className="text-start sm:text-end">
                      <h1 className="text-3xl font-bold tracking-tight text-gray-800">{t("invoiceLabel")}</h1>
                      <p className="text-sm text-gray-500 mt-1">{selectedInvoice.invoiceNumber || selectedInvoice.id}</p>
                      <StatusBadge status={selectedInvoice.status || "draft"} className="mt-2" />
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 border-t border-b border-gray-100 py-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{t("billedTo")}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerPhone}</p>
                    </div>
                    <div className="text-start sm:text-end">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-800">{t("issueDate")}</span>{" "}
                        <span className="text-gray-600">{selectedInvoice.issueDate}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold text-gray-800">{t("jobReference")}</span>{" "}
                        <span className="text-gray-600">{selectedInvoice.jobId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-8">
                    <table className="w-full text-sm text-start">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-2 sm:px-4 font-semibold">{t("descriptionCol")}</th>
                          <th className="py-3 px-2 sm:px-4 font-semibold text-end">{t("amountCol")}</th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedInvoice.lineItems ? selectedInvoice.lineItems.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-3 px-2 sm:px-4 text-gray-600">{item.description}</td>
                              <td className="py-3 px-2 sm:px-4 text-gray-600 text-end">${item.amount}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td className="py-3 px-2 sm:px-4 text-gray-600">{t("servicePrefix")}{selectedInvoice.serviceType || t("generalService")}</td>
                              <td className="py-3 px-2 sm:px-4 text-gray-600 text-end">${selectedInvoice.totalAmount}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-start sm:justify-end mb-16 px-2 sm:px-0">
                      <div className="w-full sm:w-64 space-y-3">
                        <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-3">
                          <span className="text-gray-800">{t("totalDue")}</span>
                          <span className="text-gray-800">${selectedInvoice.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-gray-200 mt-auto">
                      <p className="text-sm text-gray-500">{business?.invoiceFooter || t("defaultFooter")}</p>
                    </div>
                  </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">{t("selectPreview")}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
