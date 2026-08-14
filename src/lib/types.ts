export interface User {
  uid: string;
  displayName: string;
  phone: string;
  loginCode?: string;
  gender: 'male' | 'female' | 'ذكر' | 'أنثى';
  selectedLanguage: string;
  createdAt: number | Date;
  walletBalance: number;
  role?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  playlistId: string;
  image: string;
  teacherCount: number;
  examCount: number;
  price: number;
  originalPrice?: number;
  durationMonths: number;
  language: string;
  color?: string;
}

export interface Reply {
  id: string;
  userName: string;
  role: 'teacher' | 'support';
  text: string;
  timestamp: string | Date | number;
}

export interface Comment {
  id: string;
  courseId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string | Date | number;
  replies: Reply[];
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
  description: string;
}

export interface Subscription {
  userId: string;
  courseId: string;
  startDate: string | Date | number;
  endDate: string | Date | number;
  active: boolean;
}

export interface WalletTransaction {
  id?: string;
  userId: string;
  userName?: string;
  amount: number;
  type: 'charge' | 'purchase' | 'refund';
  description: string;
  timestamp: string | Date | number | any;
  receiptImage?: string; // Base64 string for the uploaded screenshot
  status?: 'pending' | 'approved' | 'rejected';
}
