import { teachersData } from '@/data/teachers';

export function generateStaticParams() {
  return teachersData.map((teacher) => ({
    id: teacher.id,
  }));
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
