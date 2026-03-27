const fs = require('fs');

const pagePath = 'app/[locale]/public/[businessSlug]/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// I seem to have missed fixing the 'Request Submitted' state variables directly, because my search term was exactly "Request Received!" but the component has "Request Submitted" and "Thank you for your booking request..."

pageCode = pageCode.replace(/>Request Submitted<\/h2>/g, '>{t("requestReceived")}</h2>');
pageCode = pageCode.replace(/>\s*Thank you for your booking request\. We will contact you shortly to confirm\s*your appointment\.\s*<\/p>/g, '>\n              {t("thankYou")}\n            </p>');

fs.writeFileSync(pagePath, pageCode);
console.log('Fixed success state.');
