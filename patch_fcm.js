const fs = require('fs');
const path = 'hooks/use-fcm.ts';
let content = fs.readFileSync(path, 'utf8');

// Add translation import
if (!content.includes('next-intl')) {
  content = content.replace(
    'import { toast } from "sonner"\n',
    'import { toast } from "sonner"\nimport { useTranslations } from "next-intl"\n'
  );
}

// Add hook inside
if (!content.includes('useTranslations("Common")')) {
  content = content.replace(
    'export function useFCM() {\n  const { user } = useAuth()',
    'export function useFCM() {\n  const t = useTranslations("Common")\n  const { user } = useAuth()'
  );
}

// Replace hardcoded "New Notification" string
content = content.replace(
  'const title = payload.notification?.title || "New Notification"',
  'const title = payload.notification?.title || t("newNotification")'
);

fs.writeFileSync(path, content, 'utf8');
