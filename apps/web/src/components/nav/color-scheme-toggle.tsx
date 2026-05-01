'use client';

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Sun, Moon } from 'lucide-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="subtle"
      size="lg"
      radius="lg"
      aria-label="Toggle color scheme"
      className="text-slate-500 dark:text-slate-400 hover:text-[#0D1B3E] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2d3e] transition-colors"
    >
      {computedColorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </ActionIcon>
  );
}
