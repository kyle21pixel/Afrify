'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-white/90 mb-8">
            Get exclusive deals, new arrivals, and special offers delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Subscribing...' : (
                <>
                  Subscribe
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
