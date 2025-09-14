# Startupzila Space - Agency Management System

A comprehensive agency management system built with Next.js, Ant Design, and TypeScript. Features secure authentication with Email OTP, role-based access control, and a modern responsive UI.

## 🚀 Features

- **Secure Authentication**: Email OTP verification for signup and login
- **Role-Based Dashboards**: Separate Admin and Client dashboards with different interfaces
- **MongoDB Atlas**: Cloud database integration for scalable data storage
- **Unified Login**: Single login page that redirects to appropriate dashboard
- **Admin Dashboard**: User management, system analytics, and administrative controls
- **Client Dashboard**: Project management, task tracking, and progress monitoring
- **Settings Management**: Profile, password, and MFA settings
- **Responsive Design**: Mobile-friendly with Ant Design components
- **TypeScript**: Full type safety throughout the application

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Gmail account (for email OTP functionality)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd startupzila-space
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Copy `.env.local` and update the values:

   ```env
   # Database (for production, use a real database)
   DATABASE_URL="your-database-url-here"

   # JWT Secret (change this in production)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Email Configuration (Gmail SMTP)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_SECURE="false"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   EMAIL_FROM="your-email@gmail.com"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   ```

4. **Gmail Setup for Email OTP**

   a. Enable 2-Factor Authentication on your Gmail account
   b. Generate an App Password:
      - Go to Google Account settings
      - Security → 2-Step Verification → App passwords
      - Generate password for "Mail"
      - Use this password in `EMAIL_PASS`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── auth/              # Authentication pages (login, signup, forgot-password)
│   ├── dashboard/         # Dashboard pages and layout
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page with auth redirect
├── components/            # Reusable React components
├── lib/                   # Utility functions and services
│   ├── auth-context.tsx   # Authentication context
│   ├── auth-middleware.ts # Security middleware
│   └── email.ts           # Email service
├── types/                 # TypeScript type definitions
└── .env.local             # Environment variables
```

## 🔐 Authentication Flow

1. **Signup**: User creates account → Email OTP sent → Verify OTP → Welcome email
2. **Login**: User enters credentials → Email OTP sent → Verify OTP → Dashboard access
3. **Forgot Password**: Email OTP sent → Verify OTP → Reset password

## 👥 User Roles

- **Admin**: Full access to all features and admin-specific dashboard sections
- **Team**: Standard user access with limited permissions

## 🛡️ Security Features

- JWT token-based authentication
- Email OTP verification (mandatory)
- Password hashing with bcrypt
- Input validation and sanitization
- XSS prevention
- Secure cookie storage

## 🎨 UI/UX

- **Ant Design**: Professional, accessible component library
- **Responsive**: Mobile-first design approach
- **Dark/Light Theme**: Built-in theme support
- **Loading States**: Proper feedback for all async operations
- **Error Handling**: User-friendly error messages

## 📧 Email Templates

The system includes professional HTML email templates for:
- OTP verification emails
- Welcome emails after successful registration

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and complete authentication
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/reset-password` - Reset user password

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Environment Variables**: Update all environment variables for production
4. **Database**: Replace mock data with a real database (PostgreSQL recommended)
5. **Email Service**: Consider using services like SendGrid for production email delivery

## 📝 Development Notes

- The current implementation uses mock data storage
- Replace mock databases with real databases (Prisma + PostgreSQL recommended)
- Email service can be upgraded to SendGrid, Mailgun, etc. for production
- Add rate limiting for API endpoints in production
- Implement proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Ant Design, and TypeScript**
