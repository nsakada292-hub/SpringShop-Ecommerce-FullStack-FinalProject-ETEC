import { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      inputsRef.current[0]?.focus()
    }
  }, [])

  const handleChange = (index: number, digit: string) => {
    const onlyDigits = digit.replace(/\D/g, '')
    if (!onlyDigits) return

    const next = value.split('')
    next[index] = onlyDigits[onlyDigits.length - 1]
    const nextValue = next.join('').slice(0, length)
    onChange(nextValue)

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
    if (nextValue.length === length) {
      inputsRef.current[index]?.blur()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = value.split('')
      if (next[index]) {
        next[index] = ''
      } else if (index > 0) {
        next[index - 1] = ''
        inputsRef.current[index - 1]?.focus()
      }
      onChange(next.join(''))
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={value[index] ?? ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'h-14 w-11 sm:h-16 sm:w-14 rounded-xl border-2 bg-white text-center text-2xl font-bold text-gray-900 outline-none transition-all duration-200 dark:bg-surface-900 dark:text-white',
              'focus:ring-4 disabled:opacity-60',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/20'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
    </div>
  )
}
