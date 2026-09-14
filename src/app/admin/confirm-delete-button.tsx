'use client';

import { Button } from '@mantine/core';
import { Trash2 } from 'lucide-react';

export function ConfirmDeleteButton({
  confirmMessage,
  label = 'Delete',
}: {
  confirmMessage: string;
  label?: string;
}) {
  return (
    <Button
      type="submit"
      variant="subtle"
      color="red"
      size="xs"
      leftSection={<Trash2 size={14} />}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </Button>
  );
}
