# Environment Setup

To fix the "Failed to Fetch Quotations" error, you need to create a `.env.local` file in the project root with the following environment variables:

## Required Environment Variables

Create a file named `.env.local` in the project root with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/space-quotations

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development

# Email Configuration (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AWS S3 Configuration (if using S3 for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Make sure MongoDB is running on your system
2. Update the `MONGODB_URI` to point to your MongoDB instance
3. The application will create the necessary collections automatically

## JWT Secret

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## After Setup

1. Restart your development server: `npm run dev`
2. The admin quotations page should now load properly
3. Check the browser console and server logs for any remaining issues
