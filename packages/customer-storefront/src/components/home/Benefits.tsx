import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders over ₦10,000',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Multiple secure payment options',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer support team',
  },
  {
    icon: CreditCard,
    title: 'Easy Returns',
    description: '30-day money-back guarantee',
  },
];

export default function Benefits() {
  return (
    <section className="py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
