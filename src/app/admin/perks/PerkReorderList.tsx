'use client'

import { useState, useTransition, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reorderPerksAction } from '@/app/admin/perks/actions'
import type { Perk } from '@/types'

export function PerkReorderList({ perks }: { perks: Perk[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Perk[]>(perks)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  const serverOrder = perks.map((perk) => perk.id).join(',')

  // Resync to the server order when it changes (adjust state during render
  // instead of an effect — React discards the in-progress render immediately).
  const [syncedOrder, setSyncedOrder] = useState(serverOrder)
  if (syncedOrder !== serverOrder) {
    setSyncedOrder(serverOrder)
    setItems(perks)
  }

  const currentOrder = items.map((perk) => perk.id).join(',')
  const dirty = serverOrder !== currentOrder

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, index: number) {
    event.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setOverIndex(index)
  }

  function handleDrop(index: number) {
    if (dragIndex !== null) {
      move(dragIndex, index)
    }
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await reorderPerksAction(items.map((perk) => perk.id))
      if (result.ok) {
        toast.success('Perk order saved.')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div>
      <ul className="border-[0.5px] border-white/20 bg-[--color-surface] divide-y divide-white/[0.15]">
        {items.map((perk, index) => (
          <li
            key={perk.id}
            draggable={!pending}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 px-4 py-3 select-none transition-colors ${
              pending ? 'cursor-default' : 'cursor-move'
            } ${overIndex === index && dragIndex !== index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'} ${
              dragIndex === index ? 'opacity-40' : ''
            }`}
          >
            <span className="text-base leading-none text-[--color-muted]" aria-hidden>
              ⠿
            </span>
            <span className="w-5 text-center text-[11px] font-mono text-[--color-muted]">
              {index + 1}
            </span>

            {perk.logoDataUrl ? (
              <img
                src={perk.logoDataUrl}
                alt={`${perk.projectName} logo`}
                className="h-9 w-9 flex-shrink-0 border-[0.5px] border-white/20 bg-[--color-bg] object-contain p-1 rounded-sm"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[0.5px] border-white/20 bg-[--color-bg] text-[8px] uppercase tracking-widest text-[--color-muted] font-mono rounded-sm">
                N/A
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[--color-foreground]">
                {perk.projectName}
              </p>
              <p className="truncate text-[11px] text-[--color-muted] font-mono">{perk.offerTitle}</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={pending || index === 0}
                aria-label={`Move ${perk.projectName} up`}
                className="cursor-pointer border-[0.5px] border-white/20 bg-transparent px-2 py-1 text-[11px] leading-none text-[--color-subtle] transition-colors hover:border-white/40 hover:text-[--color-foreground] hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-30 font-mono rounded-sm"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={pending || index === items.length - 1}
                aria-label={`Move ${perk.projectName} down`}
                className="cursor-pointer border-[0.5px] border-white/20 bg-transparent px-2 py-1 text-[11px] leading-none text-[--color-subtle] transition-colors hover:border-white/40 hover:text-[--color-foreground] hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-30 font-mono rounded-sm"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>

      {dirty && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setItems(perks)}
            disabled={pending}
            className="cursor-pointer border-[0.5px] border-white/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-widest text-[--color-subtle] transition-colors hover:border-white/40 hover:text-[--color-foreground] hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50 font-mono rounded-sm"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="btn-primary corner-brackets text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Saving…' : 'Save order'}
          </button>
        </div>
      )}
    </div>
  )
}
