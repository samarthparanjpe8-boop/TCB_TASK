# Deploying to Render.com

This project is configured for easy deployment on Render using the included `render.yaml` blueprint.

## Steps to Deploy

1.  **Push your code** to a GitHub or GitLab repository.
2.  Log in to [Render.com](https://dashboard.render.com).
3.  Click **New +** and select **Blueprint**.
4.  Connect your repository.
5.  Render will automatically detect the `render.yaml` and prompt you for the following Environment Variables:

### Required Backend Variables:
*   `MONGODB_URI`: Your MongoDB connection string (Atlas or Render Managed).
*   `SUPABASE_URL`: Your Supabase Project URL.
*   `SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key.
*   `SUPABASE_JWT_SECRET`: Your Supabase JWT Secret (found in Settings > API).

### Required Email Variables (For Teacher Verification):
*   `SMTP_USER`: Your email address.
*   `SMTP_PASS`: Your email app password.
*   `SMTP_HOST`: e.g., `smtp.gmail.com`.
*   `SMTP_PORT`: e.g., `587`.

## Critical Supabase Configuration

After your deployment is live, you must update Supabase so that authentication redirects correctly:

1.  In your **Supabase Dashboard**, go to **Authentication > URL Configuration**.
2.  Set **Site URL** to your **Frontend URL** (provided by Render, ending in `.onrender.com`).
3.  Add the same URL to **Redirect URLs** (e.g., `https://your-app.onrender.com/**`).

## local Testing
Before deploying, ensure you can build locally:
```bash
# Test backend build
cd backend && npm install && npm run build

# Test frontend build
cd frontend && npm install && npm run build
```

The `render.yaml` handles everything else, including connecting the frontend to the backend URL automatically.
