"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ArrowLeft, Palette, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { invoices, business } from "@/lib/mock-data"

export default function InvoicePreviewPage() {
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0])

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="View and manage your invoices" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground">Recent Invoices</h2>
          {invoices.map((invoice) => (
            <Card
              key={invoice.id}
              className={`cursor-pointer transition-colors ${
                selectedInvoice.id === invoice.id
                  ? "ring-2 ring-foreground"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedInvoice(invoice)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{invoice.issueDate}</span>
                  <span className="font-medium">${invoice.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-2">
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
              <div className="p-8 bg-white min-h-[600px]">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                      <FileText className="h-6 w-6 text-background" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{business.name}</p>
                      <p className="text-sm text-muted-foreground">{business.email}</p>
                      <p className="text-sm text-muted-foreground">{business.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">INVOICE</p>
                    <p className="text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Bill To
                    </p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.customerPhone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.customerAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">Issue Date</p>
                      <p className="font-medium">{selectedInvoice.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service Type</p>
                      <p className="font-medium">{selectedInvoice.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mt-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.lineItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="py-4 font-bold">Total</td>
                        <td className="py-4 text-right font-bold text-lg">
                          ${selectedInvoice.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    {business.invoiceFooter}
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
