const fs = require('fs');
const targetFile = 'app/[locale]/(dashboard)/invoice-preview/page.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

if (!content.includes('next-intl')) {
    content = content.replace(
        'import { Skeleton } from "@/components/ui/skeleton"',
        'import { Skeleton } from "@/components/ui/skeleton"\nimport { useTranslations } from "next-intl"'
    );
}

if (!content.includes('useTranslations("InvoicePreview")')) {
    content = content.replace(
        'export default function InvoicePreviewPage() {',
        'export default function InvoicePreviewPage() {\n  const t = useTranslations("InvoicePreview")'
    );
}

const replacers = [
    ['<PageHeader title="Invoices" description="Loading..." />', '<PageHeader title={t("title")} description={t("loading")} />'],
    ['<PageHeader title="Invoices" description="View and manage your invoices" />', '<PageHeader title={t("title")} description={t("description")} />'],
    ['<h2 className="font-medium text-sm text-muted-foreground">Recent Invoices</h2>', '<h2 className="font-medium text-sm text-muted-foreground">{t("recentInvoices")}</h2>'],
    [/>No invoices found</g, '>{t("noInvoices")}<'],
    [/<CardTitle>Invoice Preview<\/CardTitle>/g, '<CardTitle>{t("invoicePreview")}</CardTitle>'],
    [/>\s*Edit Branding\s*</g, '>{t("editBranding")}<'],
    [/mr-2/g, 'me-2'],
    [/ml-2/g, 'ms-2'],
    [/>\s*Download PDF\s*</g, '>{t("downloadPdf")}<'],
    [/>INVOICE</g, '>{t("invoiceLabel")}<'],
    [/>Billed To:</g, '>{t("billedTo")}<'],
    [/>Issue Date:</g, '>{t("issueDate")}<'],
    [/>Job Reference:</g, '>{t("jobReference")}<'],
    [/text-left/g, 'text-start'],
    [/text-right/g, 'text-end'],
    [/>Description</g, '>{t("descriptionCol")}<'],
    [/>Amount</g, '>{t("amountCol")}<'],
    [/Service: /g, '{t("servicePrefix")}'],
    [/"General Service"/g, 't("generalService")'],
    [/>Total Due</g, '>{t("totalDue")}<'],
    [/"Thank you for your business!"/g, 't("defaultFooter")'],
    [/>Select an invoice to preview</g, '>{t("selectPreview")}<'],
    [/\|\| "draft"/g, '|| t("draft")']
];

replacers.forEach(([oldStr, newStr]) => {
    content = content.replace(oldStr, newStr);
});

fs.writeFileSync(targetFile, content);
console.log('Invoice component patched.');
