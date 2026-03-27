const fs = require('fs');

const enPath = 'messages/en.json';
const arPath = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

en.Public = {
  pageNotFound: "Page Not Found",
  pageNotFoundDesc: "This booking page does not exist or may have been removed.",
  requestReceived: "Request Received!",
  thankYou: "Thank you for your request. We will be in touch with you shortly to confirm your appointment.",
  submitAnother: "Submit Another Request",
  requestService: "Request a Service",
  fillOutForm: "Fill out the form below and we'll get back to you within 24 hours to confirm your appointment.",
  serviceType: "Service Type",
  selectService: "Select the service you need",
  yourName: "Your Name",
  enterName: "Enter your full name",
  phoneNumber: "Phone Number",
  enterPhone: "Enter your phone number",
  serviceAddress: "Service Address",
  enterAddress: "Enter your full address",
  preferredDate: "Preferred Date",
  preferredTime: "Preferred Time",
  selectTime: "Select time",
  morning: "Morning (8AM - 12PM)",
  afternoon: "Afternoon (12PM - 5PM)",
  evening: "Evening (5PM - 8PM)",
  flexible: "Flexible",
  notes: "Additional Notes (Optional)",
  notesPlaceholder: "Any special instructions or details about your request",
  submitRequest: "Submit Request",
  submitting: "Submitting...",
  secureBooking: "Secure Booking",
  professionalService: "Professional Service",
  guaranteedSatisfaction: "Guaranteed Satisfaction"
};

ar.Public = {
  pageNotFound: "الصفحة غير موجودة",
  pageNotFoundDesc: "صفحة الحجز هذه غير موجودة أو ربما تمت إزالتها.",
  requestReceived: "تم استلام الطلب!",
  thankYou: "شكراً لك على طلبك. سنتواصل معك قريبًا لتأكيد موعدك.",
  submitAnother: "تقديم طلب آخر",
  requestService: "طلب خدمة",
  fillOutForm: "املأ النموذج أدناه وسنرد عليك خلال 24 ساعة لتأكيد موعدك.",
  serviceType: "نوع الخدمة",
  selectService: "اختر الخدمة التي تحتاجها",
  yourName: "الاسم",
  enterName: "أدخل الاسم الكامل",
  phoneNumber: "رقم الهاتف",
  enterPhone: "أدخل رقم الهاتف",
  serviceAddress: "عنوان الخدمة",
  enterAddress: "أدخل العنوان الكامل",
  preferredDate: "التاريخ المفضل",
  preferredTime: "الوقت المفضل",
  selectTime: "اختر الوقت",
  morning: "صباحاً (8 ص - 12 م)",
  afternoon: "بعد الظهر (12 م - 5 م)",
  evening: "مساءً (5 م - 8 م)",
  flexible: "مرن",
  notes: "ملاحظات إضافية (اختياري)",
  notesPlaceholder: "أي تعليمات خاصة أو تفاصيل حول طلبك",
  submitRequest: "إرسال الطلب",
  submitting: "جاري الإرسال...",
  secureBooking: "حجز آمن",
  professionalService: "خدمة احترافية",
  guaranteedSatisfaction: "رضا مضمون"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));


let pageCode = fs.readFileSync('app/[locale]/public/[businessSlug]/page.tsx', 'utf8');

if (!pageCode.includes('import { useTranslations }')) {
    pageCode = pageCode.replace(/"use client"\n/, '"use client"\nimport { useTranslations } from "next-intl"\n');
}

if (!pageCode.includes('const t = useTranslations("Public")')) {
    pageCode = pageCode.replace(/(export default function PublicBookingPage.*\{\n)(\s*const \{ businessSlug \} |)/, '$1  const t = useTranslations("Public")\n$2');
}

pageCode = pageCode.replace(/>Page Not Found<\/h2>/g, '>{t("pageNotFound")}</h2>');
pageCode = pageCode.replace(/>\s*This booking page does not exist or may have been removed\.\s*<\/p>/g, '>\n              {t("pageNotFoundDesc")}\n            </p>');
pageCode = pageCode.replace(/>Request Received!<\/h2>/g, '>{t("requestReceived")}</h2>');
pageCode = pageCode.replace(/>\s*Thank you for your request\. We will be in touch with you shortly to confirm your appointment\.\s*<\/p>/g, '>\n              {t("thankYou")}\n            </p>');
pageCode = pageCode.replace(/>\s*Submit Another Request\s*<\/Button>/g, '>\n              {t("submitAnother")}\n            </Button>');

pageCode = pageCode.replace(/>Request a Service<\/CardTitle>/g, '>{t("requestService")}</CardTitle>');
pageCode = pageCode.replace(/>\s*Fill out the form below and we(?:&apos;|')ll get back to you within 24 hours to\s*confirm your appointment\.\s*<\/CardDescription>/g, '>\n              {t("fillOutForm")}\n            </CardDescription>');

pageCode = pageCode.replace(/>Service Type<\/Label>/g, '>{t("serviceType")}</Label>');
pageCode = pageCode.replace(/placeholder="Select the service you need"/g, 'placeholder={t("selectService")}');

pageCode = pageCode.replace(/>Your Name<\/Label>/g, '>{t("yourName")}</Label>');
pageCode = pageCode.replace(/placeholder="Enter your full name"/g, 'placeholder={t("enterName")}');

pageCode = pageCode.replace(/>Phone Number<\/Label>/g, '>{t("phoneNumber")}</Label>');
pageCode = pageCode.replace(/placeholder="Enter your phone number"/g, 'placeholder={t("enterPhone")}');

pageCode = pageCode.replace(/>Service Address<\/Label>/g, '>{t("serviceAddress")}</Label>');
pageCode = pageCode.replace(/placeholder="Enter your full address"/g, 'placeholder={t("enterAddress")}');

pageCode = pageCode.replace(/>Preferred Date<\/Label>/g, '>{t("preferredDate")}</Label>');
pageCode = pageCode.replace(/>Preferred Time<\/Label>/g, '>{t("preferredTime")}</Label>');
pageCode = pageCode.replace(/placeholder="Select time"/g, 'placeholder={t("selectTime")}');

pageCode = pageCode.replace(/>Morning \(8AM \- 12PM\)<\/SelectItem>/g, '>{t("morning")}</SelectItem>');
pageCode = pageCode.replace(/>Afternoon \(12PM \- 5PM\)<\/SelectItem>/g, '>{t("afternoon")}</SelectItem>');
pageCode = pageCode.replace(/>Evening \(5PM \- 8PM\)<\/SelectItem>/g, '>{t("evening")}</SelectItem>');
pageCode = pageCode.replace(/>Flexible<\/SelectItem>/g, '>{t("flexible")}</SelectItem>');

pageCode = pageCode.replace(/>Additional Notes \(Optional\)<\/Label>/g, '>{t("notes")}</Label>');
pageCode = pageCode.replace(/placeholder="Any special instructions or details about your request"/g, 'placeholder={t("notesPlaceholder")}');

pageCode = pageCode.replace(/\{loading \? "Submitting\.\.\." : "Submit Request"\}/g, '{loading ? t("submitting") : t("submitRequest")}');

pageCode = pageCode.replace(/>Secure Booking<\/p>/g, '>{t("secureBooking")}</p>');
pageCode = pageCode.replace(/>Professional Service<\/p>/g, '>{t("professionalService")}</p>');
pageCode = pageCode.replace(/>Guaranteed Satisfaction<\/p>/g, '>{t("guaranteedSatisfaction")}</p>');

fs.writeFileSync('app/[locale]/public/[businessSlug]/page.tsx', pageCode);
console.log('DONE!');
