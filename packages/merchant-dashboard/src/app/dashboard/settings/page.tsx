'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Upload, Globe, Mail, Bell, CreditCard, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface StoreSettings {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  currency: string;
  timezone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentGateways: {
    mpesa: {
      enabled: boolean;
      consumerKey?: string;
      consumerSecret?: string;
      shortcode?: string;
    };
    paystack: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
    flutterwave: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
  };
  shipping: {
    freeShippingThreshold: number;
    flatRate: number;
    zones: Array<{
      name: string;
      states: string[];
      rate: number;
    }>;
  };
  notifications: {
    emailOnNewOrder: boolean;
    emailOnLowStock: boolean;
    emailOnPayment: boolean;
    lowStockThreshold: number;
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'shipping' | 'notifications'>('general');

  // Fetch store settings
  const { data: settings, isLoading } = useQuery<StoreSettings>({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await api.get('/stores/me/settings');
      return response.data;
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      const response = await api.patch('/stores/me/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Settings updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/storage/upload-image', formData);
      return response.data.url;
    },
    onSuccess: (url) => {
      updateMutation.mutate({ logo: url });
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">General Information</h2>
          
          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {settings.logo ? (
                  <img src={settings.logo} alt="Store logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG or SVG. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
              <input
                type="text"
                defaultValue={settings.name}
                onChange={(e) => updateMutation.mutate({ name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                defaultValue={settings.email}
                onChange={(e) => updateMutation.mutate({ email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                defaultValue={settings.phone}
                onChange={(e) => updateMutation.mutate({ phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                defaultValue={settings.website}
                onChange={(e) => updateMutation.mutate({ website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
              <select
                defaultValue={settings.currency}
                onChange={(e) => updateMutation.mutate({ currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="KES">Kenyan Shilling (KSh)</option>
                <option value="GHS">Ghanaian Cedi (GH₵)</option>
                <option value="ZAR">South African Rand (R)</option>
                <option value="TZS">Tanzanian Shilling (TSh)</option>
                <option value="UGX">Ugandan Shilling (USh)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone *</label>
              <select
                defaultValue={settings.timezone}
                onChange={(e) => updateMutation.mutate({ timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                <option value="Africa/Johannesburg">South Africa Time (Johannesburg)</option>
                <option value="Africa/Cairo">Egypt Time (Cairo)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              defaultValue={settings.description}
              onChange={(e) => updateMutation.mutate({ description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Tell customers about your store..."
            />
          </div>

          {/* Address */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Business Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  defaultValue={settings.address.street}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  defaultValue={settings.address.city}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  defaultValue={settings.address.state}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  defaultValue={settings.address.postalCode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  defaultValue={settings.address.country}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Settings */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* M-Pesa */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">M-Pesa</h3>
                <p className="text-sm text-gray-600">Accept payments via M-Pesa (Kenya, Tanzania, Uganda)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.paymentGateways.mpesa.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Key</label>
                <input
                  type="text"
                  defaultValue={settings.paymentGateways.mpesa.consumerKey}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your M-Pesa consumer key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Secret</label>
                <input
                  type="password"
                  defaultValue={settings.paymentGateways.mpesa.consumerSecret}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your M-Pesa consumer secret"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shortcode</label>
                <input
                  type="text"
                  defaultValue={settings.paymentGateways.mpesa.shortcode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your M-Pesa shortcode"
                />
              </div>
            </div>
          </div>

          {/* Paystack */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Paystack</h3>
                <p className="text-sm text-gray-600">Accept card, bank transfer, and USSD payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.paymentGateways.paystack.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                <input
                  type="text"
                  defaultValue={settings.paymentGateways.paystack.publicKey}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                <input
                  type="password"
                  defaultValue={settings.paymentGateways.paystack.secretKey}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>

          {/* Flutterwave */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Flutterwave</h3>
                <p className="text-sm text-gray-600">Pan-African payment gateway</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.paymentGateways.flutterwave.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                <input
                  type="text"
                  defaultValue={settings.paymentGateways.flutterwave.publicKey}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="FLWPUBK_TEST-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                <input
                  type="password"
                  defaultValue={settings.paymentGateways.flutterwave.secretKey}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="FLWSECK_TEST-..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (₦)
              </label>
              <input
                type="number"
                defaultValue={settings.shipping.freeShippingThreshold}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Orders above this amount get free shipping</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Shipping Rate (₦)
              </label>
              <input
                type="number"
                defaultValue={settings.shipping.flatRate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Default shipping fee for all orders</p>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Shipping Zones</h3>
            <div className="space-y-4">
              {settings.shipping.zones.map((zone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                      <input
                        type="text"
                        defaultValue={zone.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">States (comma-separated)</label>
                      <input
                        type="text"
                        defaultValue={zone.states.join(', ')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Rate (₦)</label>
                      <input
                        type="number"
                        defaultValue={zone.rate}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors">
                + Add Shipping Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary-600" />
                  New Order Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">Get email alerts when new orders are placed</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.notifications.emailOnNewOrder}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-600" />
                  Low Stock Alerts
                </h3>
                <p className="text-sm text-gray-600 mt-1">Get notified when product inventory is low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.notifications.emailOnLowStock}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="py-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                defaultValue={settings.notifications.lowStockThreshold}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Alert when inventory falls below this number</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Payment Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">Get notified when payments are received</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={settings.notifications.emailOnPayment}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => updateMutation.mutate(settings)}
          disabled={updateMutation.isPending}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
