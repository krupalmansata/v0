const fs = require('fs');

const pagePath = 'app/[locale]/public/[businessSlug]/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The placeholder was hardcoded as something else?
pageCode = pageCode.replace(/placeholder="\(555\) 000-0000"/, 'placeholder={t("enterPhone")}');

// It's mostly fine now but let's check next-intl integration for service type mapping. Since this isn't in scope for the simple page update unless we change the dictionary, let's leave the array mapping to a dictionary if we want it perfect:
pageCode = pageCode.replace(
  /const serviceTypes = \["AC Servicing", "Plumbing", "Electrical", "Cleaning", "Pest Control", "Other"\]/,
  'const serviceTypes = ["AC Servicing", "Plumbing", "Electrical", "Cleaning", "Pest Control", "Other"] // Can be mapped to t(`services.${type}`) if needed'
);

fs.writeFileSync(pagePath, pageCode);
console.log('Fixed additional inputs.');
