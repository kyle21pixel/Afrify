import { Currency } from '../enums';
import { CURRENCY_SYMBOLS } from '../constants';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: Currency | string): string {
  const currencyKey = typeof currency === 'string' ? (currency as Currency) : currency;
  const symbol = CURRENCY_SYMBOLS[currencyKey];
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formatted}`;
}

/**
 * Format currency amount (compact)
 */
export function formatCurrencyCompact(amount: number, currency: Currency | string): string {
  const currencyKey = typeof currency === 'string' ? (currency as Currency) : currency;
  const symbol = CURRENCY_SYMBOLS[currencyKey];
  
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currency);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(price: number, discountPercent: number): number {
  return price * (discountPercent / 100);
}

/**
 * Calculate final price after discount
 */
export function applyDiscount(price: number, discountPercent: number): number {
  return price - calculateDiscount(price, discountPercent);
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100);
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
