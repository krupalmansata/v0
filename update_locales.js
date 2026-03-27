const fs = require('fs');

const enAuth = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const arAuth = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

enAuth.Branding = {
  "title": "Branding Settings",
  "loading": "Loading...",
  "description": "Customize your business branding for invoices and public pages",
  "businessInfo": "Business Information",
  "businessInfoDesc": "Basic information displayed on invoices and booking page",
  "businessNameLabel": "Business Name",
  "phoneLabel": "Phone Number",
  "emailLabel": "Email Address",
  "logo": "Logo",
  "logoDesc": "Upload your business logo",
  "uploadHelp": "Click to upload or drag and drop",
  "uploadLimits": "PNG, JPG up to 2MB",
  "chooseFile": "Choose File",
  "brandColor": "Brand Color",
  "brandColorDesc": "Choose your primary brand color",
  "invoiceFooter": "Invoice Footer",
  "invoiceFooterDesc": "Text displayed at the bottom of invoices",
  "saving": "Saving...",
  "saveChanges": "Save Changes",
  "errorFetching": "Error fetching data",
  "errorFetchingDesc": "Could not load business settings.",
  "settingsSaved": "Settings Saved",
  "settingsSavedDesc": "Your branding settings have been updated successfully.",
  "errorSaving": "Error saving data",
  "errorSavingDesc": "Could not save business settings.",
  "publicPage": "Public Booking Page",
  "publicPageDesc": "Preview of your customer-facing page",
  "viewFull": "View Full",
  "requestService": "Request a Service",
  "invoicePreview": "Invoice Preview",
  "invoicePreviewDesc": "Preview of your invoice design"
};

arAuth.Branding = {
  "title": "إعدادات العلامة التجارية",
  "loading": "جاري التحميل...",
  "description": "تخصيص العلامة التجارية لعملك للفواتير والصفحات العامة",
  "businessInfo": "معلومات العمل",
  "businessInfoDesc": "المعلومات الأساسية المعروضة على الفواتير وصفحة الحجز",
  "businessNameLabel": "اسم العمل",
  "phoneLabel": "رقم الهاتف",
  "emailLabel": "عنوان البريد الإلكتروني",
  "logo": "الشعار",
  "logoDesc": "قم بتحميل شعار عملك",
  "uploadHelp": "انقر للتحميل أو اسحب وأفلت",
  "uploadLimits": "PNG, JPG حتى 2 ميغابايت",
  "chooseFile": "اختر ملف",
  "brandColor": "لون العلامة التجارية",
  "brandColorDesc": "اختر لون علامتك التجارية الأساسي",
  "invoiceFooter": "تذييل الفاتورة",
  "invoiceFooterDesc": "النص المعروض في أسفل الفواتير",
  "saving": "جاري الحفظ...",
  "saveChanges": "حفظ التغييرات",
  "errorFetching": "خطأ في جلب البيانات",
  "errorFetchingDesc": "تعذر تحميل إعدادات العمل.",
  "settingsSaved": "تم حفظ الإعدادات",
  "settingsSavedDesc": "تم تحديث إعدادات علامتك التجارية بنجاح.",
  "errorSaving": "خطأ في حفظ البيانات",
  "errorSavingDesc": "تعذر حفظ إعدادات العمل.",
  "publicPage": "صفحة الحجز العامة",
  "publicPageDesc": "معاينة صفحتك الموجهة للعملاء",
  "viewFull": "عرض كامل",
  "requestService": "طلب خدمة",
  "invoicePreview": "معاينة الفاتورة",
  "invoicePreviewDesc": "معاينة تصميم فاتورتك"
};

fs.writeFileSync('messages/en.json', JSON.stringify(enAuth, null, 2));
fs.writeFileSync('messages/ar.json', JSON.stringify(arAuth, null, 2));

console.log("Locales updated!");
