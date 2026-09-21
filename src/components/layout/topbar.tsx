import { Bell } from 'lucide-react';
import { PageHeading } from './page-heading';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-sm">
      <PageHeading />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <LocaleSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
