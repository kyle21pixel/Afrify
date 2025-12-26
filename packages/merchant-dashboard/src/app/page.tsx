import Link from 'next/link';
import { Store, Package, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Afrify</span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Start Your Online Store in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build, manage, and scale your e-commerce business with Afrify. 
            Optimized for African markets with local payment integrations and mobile-first design.
          </p>
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Create Your Store - Free
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Package className="h-10 w-10 text-primary-600" />}
            title="Product Management"
            description="Easily manage products, variants, inventory, and pricing"
          />
          <FeatureCard
            icon={<ShoppingCart className="h-10 w-10 text-primary-600" />}
            title="Order Processing"
            description="Track orders, manage fulfillment, and handle refunds"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary-600" />}
            title="Customer Management"
            description="Build relationships with customer profiles and history"
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary-600" />}
            title="Analytics & Reports"
            description="Get insights on sales, customers, and store performance"
          />
          <FeatureCard
            icon={<Settings className="h-10 w-10 text-primary-600" />}
            title="Theme Customization"
            description="Choose from beautiful themes and customize your store"
          />
          <FeatureCard
            icon={<Store className="h-10 w-10 text-primary-600" />}
            title="Local Payments"
            description="Accept M-Pesa, Airtel Money, Paystack, and more"
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600">10K+</div>
            <div className="text-gray-600 mt-2">Active Stores</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">$2M+</div>
            <div className="text-gray-600 mt-2">Monthly Sales</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">99.9%</div>
            <div className="text-gray-600 mt-2">Uptime</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
