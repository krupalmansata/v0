const fs = require('fs');

const targetFile = 'app/[locale]/(dashboard)/settings/branding/page.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

if (!content.includes('next-intl')) {
    content = content.replace(
        'import { Skeleton } from "@/components/ui/skeleton"',
        'import { Skeleton } from "@/components/ui/skeleton"\nimport { useTranslations } from "next-intl"'
    );
}

if (!content.includes('useTranslations("Branding")')) {
    content = content.replace(
        'export default function BrandingPage() {',
        'export default function BrandingPage() {\n  const t = useTranslations("Branding")'
    );
}

// replacements
const dict = [
    ['<PageHeader title="Branding Settings" description="Loading..." />', '<PageHeader title={t("title")} description={t("loading")} />'],
    ['title="Branding Settings"\n        description="Customize your business branding for invoices and public pages"', 'title={t("title")}\n        description={t("description")}'],
    ['<CardTitle>Business Information</CardTitle>', '<CardTitle>{t("businessInfo")}</CardTitle>'],
    ['<CardDescription>\n                Basic information displayed on invoices and booking page\n              </CardDescription>', '<CardDescription>{t("businessInfoDesc")}</CardDescription>'],
    ['>Business Name<', '>{t("businessNameLabel")}<'],
    ['>Phone Number<', '>{t("phoneLabel")}<'],
    ['>Email Address<', '>{t("emailLabel")}<'],
    ['<CardTitle>Logo</CardTitle>', '<CardTitle>{t("logo")}</CardTitle>'],
    ['>Upload your business logo<', '>{t("logoDesc")}<'],
    ['>Click to upload or drag and drop<', '>{t("uploadHelp")}<'],
    ['>PNG, JPG up to 2MB<', '>{t("uploadLimits")}<'],
    ['>Choose File<', '>{t("chooseFile")}<'],
    ['<CardTitle>Brand Color</CardTitle>', '<CardTitle>{t("brandColor")}</CardTitle>'],
    ['>Choose your primary brand color<', '>{t("brandColorDesc")}<'],
    ['<CardTitle>Invoice Footer</CardTitle>', '<CardTitle>{t("invoiceFooter")}</CardTitle>'],
    ['>Text displayed at the bottom of invoices<', '>{t("invoiceFooterDesc")}<'],
    ['{saving ? "Saving..." : "Save Changes"}', '{saving ? t("saving") : t("saveChanges")}'],
    ['title: "Error fetching data"', 'title: t("errorFetching")'],
    ['description: "Could not load business settings."', 'description: t("errorFetchingDesc")'],
    ['title: "Settings Saved"', 'title: t("settingsSaved")'],
    ['description: "Your branding settings have been updated successfully."', 'description: t("settingsSavedDesc")'],
    ['title: "Error saving data"', 'title: t("errorSaving")'],
    ['description: "Could not save business settings."', 'description: t("errorSavingDesc")'],
    ['<CardTitle className="text-base">Public Booking Page</CardTitle>', '<CardTitle className="text-base">{t("publicPage")}</CardTitle>'],
    ['>Preview of your customer-facing page<', '>{t("publicPageDesc")}<'],
    ['>View Full<', '>{t("viewFull")}<'],
    ['>Request a Service<', '>{t("requestService")}<'],
    ['<CardTitle className="text-base">Invoice Preview</CardTitle>', '<CardTitle className="text-base">{t("invoicePreview")}</CardTitle>'],
    ['>Preview of your invoice design<', '>{t("invoicePreviewDesc")}<'],
    ['mr-2', 'me-2'],
    ['ml-2', 'ms-2']
];

dict.forEach(([oldStr, newStr]) => {
    // some strings appear multiple times, use replaceAll if we want or just regex that captures them, but actually we'll just loop logic
    content = content.replace(oldStr, newStr);
    content = content.replace(oldStr, newStr); // run twice just in case, though some are global
});

content = content.replace(/mr-2/g, 'me-2');
content = content.replace(/ml-2/g, 'ms-2');

fs.writeFileSync(targetFile, content);

console.log("Branding page patched!");
