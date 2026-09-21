'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { PERMISSION_MODULES, type PermissionModule } from '@/core/permissions/codes';
import { MODULE_ICONS } from './module-icons';

interface PermissionModuleRailProps {
  activeModule: PermissionModule;
  onSelect: (module: PermissionModule) => void;
  isModuleEnabled: (module: PermissionModule) => boolean;
}

export function PermissionModuleRail({
  activeModule,
  onSelect,
  isModuleEnabled,
}: PermissionModuleRailProps) {
  const t = useTranslations('permissions.modules');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-1">
      {Object.values(PERMISSION_MODULES).map((module) => {
        const Icon = MODULE_ICONS[module];
        const isActive = module === activeModule;
        const enabled = isModuleEnabled(module);
        return (
          <button
            key={module}
            type="button"
            onClick={() => onSelect(module)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-start text-sm transition-colors',
              isActive ? 'bg-brand-muted text-brand' : 'text-zinc-600 hover:bg-zinc-50',
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4 shrink-0" />
              {t(module)}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400',
              )}
            >
              {enabled ? tCommon('on') : tCommon('off')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
