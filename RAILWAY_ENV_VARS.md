# Railway Environment Variables

Add these environment variables to your Railway deployment:

## Required for Email Functionality
```
SENDGRID_API_KEY=<your-complete-sendgrid-api-key>
```

## Required for Report Banner Images (Client-side variables)
```
NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68c0f9d6fc36707db01f8ff6.jpeg
NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg
NEXT_PUBLIC_REPORT_IMAGE_ROADMAP=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp
NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg
NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91cac6682b0fc37eeb.jpeg
NEXT_PUBLIC_REPORT_IMAGE_FALLBACK=https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg
```

## How to Add in Railway

1. Go to your Railway project
2. Click on the service
3. Go to Variables tab
4. Add each variable above
5. Railway will automatically redeploy

Note: The NEXT_PUBLIC_ prefix is required for client-side access to these variables.