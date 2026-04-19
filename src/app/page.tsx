import { cookies } from 'next/headers';
import AlchemyGame from '@/components/game/AlchemyGame';

export default async function Home() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('sidebar_state')?.value;
  const defaultOpen = raw !== 'false';
  return <AlchemyGame defaultOpen={defaultOpen} />;
}
