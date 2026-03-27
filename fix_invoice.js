const fs = require('fs');
const enFile = 'messages/en.json';
const arFile = 'messages/ar.json';

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arFile, 'utf8'));

enData.InvoicePreview = {
  "title": "Invoices",
  "loading": "Loading...",
  "description": "View and manage your invoices",
  "recentInvoices": "Recent Invoices",
  "noInvoices": "No invoices found",
  "invoicePreview": "Invoice Preview",
  "editBranding": "Edit Branding",
  "downloadPdf": "Download PDF",
  "invoiceLabel": "INVOICE",
  "billedTo": "Billed To:",
  "issueDate": "Issue Date:",
  "jobReference": "Job Reference:",
  "descriptionCol": "Description",
  "amountCol": "Amount",
  "servicePrefix": "Service: ",
  "generalService": "General Service",
  "totalDue": "Total Due",
  "defaultFooter": "Thank you for your business!",
  "selectPreview": "Select an invoice to preview",
  "draft": "Draft"
};

arData.InvoicePreview = {
  "title": "الففواتۊر",
  "loading": "جاري التحميل...",
  "description": "عرض وإ٭دارد الففواتۊر الخاصة با",
  "recentInvoices": "الففواتۊر الححدۊةث",
  "noInvoices": "لم يتم العتور على Ɂىواتۊذ",
  "invoicePreview": "معاۊنة الفاتۇرة",
  "editBranding": "تعدۊل العلامة التجاريذ",
  "downloadPdf": "تحخيل PDF",
  "invoiceLabel": "فاتۇرث",
  "billedTo": "فاتۇرث إلي:",
  "issueDate": "تارۊخ الإصدار:",
  "jobReference": "مرجع الوظي؁ة:",
  "descriptionCol": "الوصف",
  "amountCol": "المبلغ",
  "servicePrefix": "الخدمة: ",
  "generalService": "خحدمة عامة",
  "totalDue": "المجمالۊ المستحق",
  "defaultFooter": "شًردا لتعاملكم معنا!",
  "selectPreview": "حدحد فاتۇرة لمعاۊلتها",
  "draft": "مسوحدة"
};

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
fs.writeFileSync(arFile, JSON.stringify(arData, null, 2));
console.log('Added InvoicePreview translations.');