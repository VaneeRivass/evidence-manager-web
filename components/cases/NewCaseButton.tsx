'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CaseFormDialog } from './CaseFormDialog'

// The button and the dialog it opens, together: the list's header and its empty state each
// place one (RF-15, RF-16).
export function NewCaseButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-10">
        <Plus />
        {children}
      </Button>
      <CaseFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
