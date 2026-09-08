# Production deployment

Deploy this Vite SPA to Vercel. The API is deployed separately from the API
repository to Render, and it uses Neon PostgreSQL.

## Vercel configuration

1. Import this GitHub repository as a Vercel project. Vercel detects Vite;
   use `npm run build` and `dist` if it does not.
2. After creating the Render API service, edit `vercel.json` and add this
   rewrite **before** the SPA rewrite:

   ```json
   { "source": "/api/:path*", "destination": "https://<render-api-host>/:path*" }
   ```

3. In Vercel Production environment variables, set `VITE_API_BASE_URL=/`.
   The value contains no secret and makes browser requests use the Vercel
   origin, where the API rewrite preserves the existing session cookies.
4. Deploy only after the Render health endpoint is healthy. Then use the
   canonical `https://<project>.vercel.app` URL as both `FRONTEND_URL` and
   `CORS_ALLOWED_ORIGIN` in Render.

The existing SPA rewrite in `vercel.json` is required for direct navigation to
React Router routes such as `/questions` or `/manager`.

## Do not use a direct Render API URL in production

Setting `VITE_API_BASE_URL` to the public `onrender.com` URL would make browser
API calls cross-site. The application deliberately uses HttpOnly `SameSite=Lax`
cookies, so authentication must stay behind the Vercel `/api` rewrite instead.
