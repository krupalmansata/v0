// middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - api, _next, _vercel, or containing a dot (static files)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};