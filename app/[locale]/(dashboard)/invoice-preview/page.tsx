"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, ArrowLeft, Palette, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"

export default function InvoicePreviewPage() {
  const { userData } = useAuth()
  const businessId = userData?.businessId
  
  const [invoices, setInvoices] = useState<any[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return

    const invoicesRef = ref(database, `invoices/${businessId}`)
    const businessRef = ref(database, `businesses/${businessId}`)

    const unsubscribeInvoices = onValue(invoicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const items = Object.keys(data).map(key => ({ id: key, ...data[key] }))
        setInvoices(items)
        if (items.length > 0 && !selectedInvoice) {
          setSelectedInvoice(items[0])
        }
      } else {
        setInvoices([])
        setSelectedInvoice(null)
      }
    })
    
    const unsubscribeBusiness = onValue(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        setBusiness(snapshot.val())
      }
      setLoading(false)
    })

    return () => {
      unsubscribeInvoices()
      unsubscribeBusiness()
    }
  }, [businessId]) // removed selectedInvoice from dep array on purpose

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoices" description="Loading..." />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="View and manage your invoices" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground">Recent Invoices</h2>
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground text-sm">
                No invoices found
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
                onClick={() => setSelectedInvoice(invoice)}
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
          {selectedInvoice && business ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle>Invoice Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings/branding">
                      <Palette className="h-4 w-4 mr-2" />
                      Edit Branding
                    </Link>
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Invoice Document */}
                <div className="p-8 bg-white min-h-[600px] text-black">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: business.primaryColor || "#0f172a" }}
                      >
                        {business.name?.substring(0,2).toUpperCase() || "BZ"}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{business.name}</p>
                        <p className="text-sm text-gray-500">{business.email}</p>
                        <p className="text-sm text-gray-500">{business.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-3xl font-bold tracking-tight text-gray-800">INVOICE</h1>
                      <p className="text-sm text-gray-500 mt-1">{selectedInvoice.invoiceNumber || selectedInvoice.id}</p>
                      <StatusBadge status={selectedInvoice.status || "draft"} className="mt-2" />
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-gray-100 py-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Billed To:</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-800">Issue Date:</span>{" "}
                        <span className="text-gray-600">{selectedInvoice.issueDate}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold text-gray-800">Job Reference:</span>{" "}
                        <span className="text-gray-600">{selectedInvoice.jobId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-8">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Description</th>
                          <th className="py-3 px-4 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedInvoice.lineItems ? selectedInvoice.lineItems.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-4 text-gray-600">{item.description}</td>
                            <td className="py-3 px-4 text-gray-600 text-right">${item.amount}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td className="py-3 px-4 text-gray-600">Service: {selectedInvoice.serviceType || "General Service"}</td>
                            <td className="py-3 px-4 text-gray-600 text-right">${selectedInvoice.totalAmount}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-16">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-3">
                        <span className="text-gray-800">Total Due</span>
                        <span className="text-gray-800">${selectedInvoice.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-8 border-t border-gray-200 mt-auto">
                    <p className="text-sm text-gray-500">{business.invoiceFooter || "Thank you for your business!"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select an invoice to preview</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
