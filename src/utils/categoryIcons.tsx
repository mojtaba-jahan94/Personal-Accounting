import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Receipt,
  HeartPulse,
  Coffee,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  MoreHorizontal,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  ShieldCheck,
  Compass,
  FileText,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Home,
  Receipt,
  HeartPulse,
  Coffee,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  MoreHorizontal,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  ShieldCheck,
  Compass,
  FileText,
  DollarSign,
};

export const getCategoryIcon = (iconName: string, className = 'w-5 h-5'): React.ReactNode => {
  const IconComponent = iconMap[iconName] || MoreHorizontal;
  return <IconComponent className={className} />;
};
