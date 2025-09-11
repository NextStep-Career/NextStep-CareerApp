# NextStep - Your Career Companion 🚀

**Discover your career path with personalized guidance, AI coaching, and structured learning paths.**

NextStep is a comprehensive career guidance platform that helps users discover their ideal career paths through personality assessments, AI-powered coaching, curated learning resources, and job search assistance.

## ✨ Features

### 🧠 **Personality Quiz**
- Comprehensive personality and interests assessment
- Discover your strengths and ideal career matches
- Science-backed evaluation methods

### 🎯 **Career Matching**
- Personalized career recommendations based on quiz results
- Detailed career path information and requirements
- Industry insights and growth prospects

### 👥 **AI Career Coach**
- Chat with our AI-powered career coach anytime
- Get personalized advice and guidance
- Career planning and strategy sessions

### 📚 **Learning Paths**
- Curated courses and resources for your chosen career
- Structured learning progression
- Skills development tracking

### 📈 **Progress Tracking**
- Monitor your learning journey
- Celebrate milestones and achievements
- Set and track career goals

### 💼 **Job Hunt Assistant**
- Find relevant job opportunities and internships
- Location-based job search
- Application tracking and management

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore + Authentication)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Fonts:** Space Grotesk & DM Sans (Google Fonts)

## 🏗️ Project Structure

```
nextstep-career-app/
├── app/                          # Next.js App Router pages
│   ├── coach/                    # AI Career Coach
│   ├── dashboard/                # User Dashboard
│   ├── jobs/                     # Job Search
│   ├── learning/                 # Learning Paths
│   ├── login/                    # Authentication
│   ├── profile/                  # User Profile
│   ├── quiz/                     # Personality Quiz
│   ├── signup/                   # User Registration
│   ├── verify-email/             # Email Verification
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # Home Page
│   └── globals.css               # Global Styles
├── components/                   # Reusable Components
│   ├── auth/                     # Authentication Components
│   ├── ui/                       # UI Component Library
│   ├── mobile-nav.tsx            # Mobile Navigation
│   └── theme-provider.tsx        # Theme Context
├── lib/                          # Utility Libraries
│   ├── contexts/                 # React Contexts
│   ├── firebase.admin.ts         # Firebase Admin SDK
│   ├── firebase.client.ts        # Firebase Client SDK
│   └── utils.ts                  # Utility Functions
├── scripts/                      # Database Scripts
│   ├── seed-firestore.ts         # Database Seeding
│   └── cleanup-career-matches.ts # Data Cleanup
├── public/                       # Static Assets
├── next.config.mjs              # Next.js Configuration
├── tailwind.config.ts           # Tailwind Configuration
├── tsconfig.json                # TypeScript Configuration
├── firebase.json                # Firebase Configuration
├── firestore.rules              # Firestore Security Rules
├── firestore.indexes.json       # Firestore Indexes
└── package.json                 # Dependencies & Scripts
```

## 📋 Prerequisites

Before setting up NextStep, ensure you have the following installed:

- **Node.js** (version 18.17 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Firebase account** for backend services

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nextstep-career-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

#### Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" and follow the setup wizard
3. Enable Authentication and Firestore Database
4. Set up Authentication providers (Email/Password, Google)

#### Get Firebase Configuration
1. In the Firebase Console, go to Project Settings
2. Scroll down to "Your apps" and click "Web app"
3. Copy the configuration object

#### Generate Service Account Key (for Admin SDK)
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Client Configuration (NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
```

**⚠️ Important Security Notes:**
- Never commit `.env.local` to version control
- Use individual environment variables instead of the full service account JSON
- Ensure proper escaping of the private key with `\n` characters

### 5. Firebase Configuration

#### Set up Firestore Security Rules
The project includes `firestore.rules` - deploy them using:

```bash
firebase deploy --only firestore:rules
```

#### Initialize Database (Optional)
Run the seeding script to populate initial data:

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed Firestore database |

## 🎯 Usage Guide

### For Users

1. **Take the Quiz**: Start with the personality assessment to discover your strengths
2. **Explore Careers**: Review personalized career recommendations
3. **Chat with AI Coach**: Get guidance and advice for your career journey
4. **Follow Learning Paths**: Access curated resources for skill development
5. **Track Progress**: Monitor your learning and career development
6. **Find Jobs**: Search for relevant opportunities and internships

### For Developers

#### Adding New Pages
Create new pages in the `app/` directory following Next.js App Router conventions:

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  )
}
```

#### Creating Components
Add reusable components to the `components/` directory:

```typescript
// components/my-component.tsx
interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>
}
```

#### Database Operations
Use the Firebase utilities in the `lib/` directory:

```typescript
import { db } from '@/lib/firebase.client'
import { collection, addDoc } from 'firebase/firestore'

// Add document to Firestore
const docRef = await addDoc(collection(db, 'collection-name'), {
  field: 'value'
})
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Other Platforms
The app can be deployed on any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔧 Configuration

### Tailwind CSS Customization
Modify `tailwind.config.ts` to customize the design system:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
      },
      fontFamily: {
        // Add custom fonts
      }
    }
  }
}
```

### Firebase Configuration
Update Firebase settings in:
- `firebase.json` - Project configuration
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

## 🤝 Contributing

We welcome contributions to NextStep! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write descriptive commit messages
- Add comments for complex logic
- Ensure responsive design for all components

### Testing
- Test all new features thoroughly
- Ensure mobile responsiveness
- Verify Firebase integration works correctly
- Test authentication flows

## 🐛 Troubleshooting

### Common Issues

**Firebase Connection Issues**
- Verify all environment variables are set correctly
- Check Firebase project configuration
- Ensure proper escaping of private keys

**Build Failures**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`
- Verify Next.js configuration

**Authentication Problems**
- Confirm Firebase Auth is enabled
- Check authentication provider configuration
- Verify redirect URIs in Firebase console

**Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify custom fonts are loading correctly

### Getting Help
- Check existing [Issues](https://github.com/your-repo/issues)
- Create a new issue with detailed reproduction steps
- Include error messages and environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Lucide](https://lucide.dev/) for the icon library
- [Firebase](https://firebase.google.com/) for backend services
- [Vercel](https://vercel.com/) for deployment and analytics

## 📞 Support

For support, please:
1. Check the [FAQ](#-troubleshooting) section
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Made with ❤️ by the NextStep Team**

*Empowering careers, one step at a time.*
