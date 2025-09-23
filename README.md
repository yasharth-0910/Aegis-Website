# 🛡️ AEGIS - Advanced Emergency and Geographic Information System

AEGIS is a comprehensive safety intelligence platform that provides real-time crime prediction and safety analytics for Chicago. Built with Next.js 15, React 19, and powered by predictive algorithms, AEGIS helps users make informed decisions about their safety and navigation.

## 🚀 Features

### 🏠 **Landing Page**
- Interactive Chicago crime heatmap with real-time data visualization
- Crime statistics and trends dashboard
- Community safety overview with 77 monitored areas
- Responsive design with mobile navigation

### 🔐 **Authentication System**
- User registration and login with bcrypt password hashing
- Session-based authentication with secure cookies
- PostgreSQL database integration for user management
- Protected routes and automatic authentication checks

### 📍 **Location Intelligence**
- Real-time safety heatmap of Chicago
- Interactive Leaflet.js maps with crime markers
- Risk level indicators and safety zones
- Live crime data simulation and visualization

### 🔍 **Safety Search**
- Search any Chicago location for safety scores
- Location-based risk assessment
- Recent searches history
- Personalized safety recommendations

### 🗺️ **Safe Route Guide**
- Calculate safest routes between two locations
- Turn-by-turn directions with safety considerations
- Route optimization based on crime data
- Alternative route suggestions

### 👨‍👩‍👧‍👦 **Family Tracking**
- Monitor family members in potential danger zones
- Safety status tracking and alerts
- Emergency contact management
- Real-time location updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with enhanced features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Modern component library
- **Leaflet.js** - Interactive maps
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Robust relational database
- **bcryptjs** - Password hashing and security
- **node-postgres (pg)** - PostgreSQL client

### Development Tools
- **ESLint** - Code linting and quality
- **Turbopack** - Fast build system
- **TypeScript Strict Mode** - Enhanced type checking

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts       # User authentication
│   │       ├── me/route.ts          # User session check
│   │       ├── signout/route.ts     # User logout
│   │       └── signup/route.ts      # User registration
│   ├── login/page.tsx               # Login page
│   ├── signup/page.tsx              # Registration page
│   ├── profile/
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── location/page.tsx        # Location Intelligence
│   │   ├── search/page.tsx          # Safety Search
│   │   ├── guide/page.tsx           # Safe Route Guide
│   │   └── family/page.tsx          # Family Tracking
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── lib/
│   └── db.ts                        # Database configuration
└── components/
    └── ui/                          # ShadCN UI components
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/aegis_db
   NODE_ENV=development
   ```

4. **Set up the database**
   The database will be automatically initialized when you first run the application. The following table will be created:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       fullname VARCHAR(100) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### 1. **Registration/Login**
- Visit `/signup` to create a new account
- Use `/login` to sign in with existing credentials
- Passwords are securely hashed using bcrypt

### 2. **Dashboard Navigation**
- Access the main dashboard at `/profile`
- Navigate between features using the responsive navigation
- View personalized statistics and recent activity

### 3. **Feature Usage**
- **Location Intelligence**: View real-time crime heatmaps
- **Safety Search**: Search specific locations for safety scores
- **Route Guide**: Plan safe routes between destinations
- **Family Tracking**: Monitor family member safety status

## 🔧 Available Scripts

```bash
# Development with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🎨 Design System

### Color Themes
- **Location Intelligence**: Blue to Cyan gradient
- **Safety Search**: Green to Emerald gradient  
- **Safe Route Guide**: Orange to Red gradient
- **Family Tracking**: Purple to Pink gradient

### Component Library
- Consistent ShadCN UI components across all pages
- Responsive design with mobile-first approach
- Accessible navigation with keyboard support

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure HTTP-only cookies
- **Route Protection**: Authentication checks on all protected routes
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Protection**: Parameterized queries with pg library

## 🗺️ Data Sources

AEGIS uses simulated Chicago crime data for demonstration purposes. In a production environment, this would integrate with:
- Chicago Police Department crime databases
- Real-time incident reporting systems
- Geographic information systems (GIS)
- Community safety reporting platforms

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically with each push

### Other Platforms
- **Railway**: Database and application hosting
- **Heroku**: Full-stack deployment
- **DigitalOcean**: VPS deployment with PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **ShadCN** - For the beautiful UI component library
- **Leaflet** - For interactive mapping capabilities
- **Chicago Data Portal** - For crime data inspiration
- **Vercel** - For seamless deployment platform

---

**Built with ❤️ for community safety and urban intelligence**
