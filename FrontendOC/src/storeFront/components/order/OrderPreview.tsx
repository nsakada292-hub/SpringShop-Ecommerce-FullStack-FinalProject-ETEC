import { Package } from 'lucide-react'
import type { Order, OrderItem } from '@/shared/types'
import { cn } from '@/shared/utils/cn'
import { getImageGradient } from '@/shared/utils/imageGradient'

type GetImage = (productId: number) => string | undefined

function InitialsTag({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter((n) => n?.trim())
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return <span className="text-xs font-bold">{initials}</span>
}

interface ThumbProps {
  item: OrderItem
  getImage: GetImage
  variant: 'large' | 'small'
}

function Thumb({ item, getImage, variant }: ThumbProps) {
  const image = getImage(item.productId)
  if (image) {
    return (
      <img
        src={image}
        alt={item.productName}
        loading="lazy"
        className={cn(
          'shrink-0 rounded-lg object-cover ring-1 ring-white dark:ring-white/10',
          variant === 'large' ? 'h-12 w-12' : 'h-8 w-8'
        )}
      />
    )
  }
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg text-white ring-1 ring-white/20',
        variant === 'large' ? 'h-12 w-12' : 'h-8 w-8'
      )}
      style={{ background: getImageGradient(item.productId) }}
    >
      <InitialsTag name={item.productName} />
    </span>
  )
}

interface OrderPreviewProps {
  order: Order
  getImage: GetImage
  max?: number
  size?: 'sm' | 'md'
}

export function OrderPreview({ order, getImage, max = 3, size = 'md' }: OrderPreviewProps) {
  const items = order.items.slice(0, max)
  const remaining = order.items.length - items.length
  const large = size === 'md'
  const overlap = large ? '-ml-3 first:ml-0' : '-ml-2 first:ml-0'

  return (
    <div className="flex items-center" aria-hidden>
      {items.map((item, i) => (
        <span key={item.id ?? `${item.productId}-${i}`} className={cn('ring-0', overlap)}>
          <Thumb item={item} getImage={getImage} variant={large ? 'large' : 'small'} />
        </span>
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399] to-[#22c55e] font-bold text-white ring-1 ring-white dark:ring-white/10',
            large ? 'h-12 w-12 -ml-3 text-sm' : 'h-8 w-8 -ml-2 text-[11px]'
          )}
        >
          +{remaining}
        </span>
      )}
      {items.length === 0 && (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500',
            large ? 'h-12 w-12' : 'h-8 w-8'
          )}
        >
          <Package className={large ? 'h-5 w-5' : 'h-4 w-4'} />
        </span>
      )}
    </div>
  )
}