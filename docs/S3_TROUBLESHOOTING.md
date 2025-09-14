# S3 Upload Troubleshooting Guide

## Common Issues and Solutions

### 1. "Upload failed" Error

**Symptoms:**
- File upload fails with generic error message
- No specific error details in console

**Solutions:**
1. Check AWS credentials in `.env.local`:
   ```env
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET_NAME=your-bucket-name
   ```

2. Test S3 configuration:
   ```
   GET /api/test-s3
   ```

3. Check browser console for detailed error messages

### 2. "AWS credentials not configured" Error

**Symptoms:**
- Upload fails with credential error
- Environment variables not loaded

**Solutions:**
1. Ensure `.env.local` file exists in project root
2. Restart the development server after adding credentials
3. Check that environment variables are not empty

### 3. "S3 bucket not configured or accessible" Error

**Symptoms:**
- Bucket permission or configuration issues

**Solutions:**
1. Verify bucket name is correct
2. Check bucket permissions in AWS console
3. Ensure bucket allows public read access for uploaded files
4. Verify bucket region matches `AWS_REGION`

### 4. File Size Issues

**Symptoms:**
- Large files fail to upload

**Solutions:**
- Current limit is 10MB per file
- Check file size before upload
- Consider compressing images if needed

### 5. Network/Connectivity Issues

**Symptoms:**
- Upload hangs or times out

**Solutions:**
1. Check internet connection
2. Verify AWS service status
3. Check firewall/proxy settings
4. Try uploading smaller files first

## Testing S3 Configuration

### 1. Test Endpoint
Visit: `http://localhost:3000/api/test-s3`

This endpoint will:
- Verify AWS credentials
- Test S3 bucket access
- Upload a test file
- Return success/failure with details

### 2. Manual Testing
```javascript
// In browser console or test file
const testUpload = async () => {
  const response = await fetch('/api/test-s3');
  const result = await response.json();
  console.log(result);
};
```

### 3. Environment Variables Check
```javascript
// Check if variables are loaded
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
console.log('Credentials exist:', !!process.env.AWS_ACCESS_KEY_ID);
```

## AWS S3 Setup

### 1. Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select appropriate region
5. Configure public access settings

### 2. Bucket Permissions
Add this bucket policy for public read access:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 3. CORS Configuration
Add CORS configuration in bucket settings:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

## Fallback Options

If S3 upload fails, users can still:
1. Enter direct URLs for images/PDFs
2. Use the URL input fields as fallback
3. Continue creating quotations without file uploads

## Debug Logging

Enable detailed logging by checking:
- Server console for S3 service errors
- Browser network tab for API request/response
- AWS CloudWatch logs for S3 operations

## Support

If issues persist:
1. Check AWS service status dashboard
2. Verify IAM user permissions
3. Test with different files/regions
4. Contact AWS support if needed