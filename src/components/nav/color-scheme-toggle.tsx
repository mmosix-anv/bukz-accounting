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
      radius="xl"
      aria-label="Toggle color scheme"
      className="h-11 w-11 border border-slate-200/70 bg-white/78 text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-[#0D1B3E] dark:border-[#2a2d3e] dark:bg-[#171b28] dark:text-slate-400 dark:hover:border-[#3a4056] dark:hover:bg-[#202433] dark:hover:text-white"
    >
      {computedColorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </ActionIcon>
  );
}
