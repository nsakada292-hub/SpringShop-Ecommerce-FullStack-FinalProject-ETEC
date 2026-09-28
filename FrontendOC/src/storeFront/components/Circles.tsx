import type { CSSProperties, ReactNode } from 'react'

export type CirclesDirection = 'clockwise' | 'counterclockwise'
export type CirclesFadeMode = 'in' | 'out' | 'none'

export interface CirclesProps {
  rows: string[][]
  circleSize?: number
  baseRadius?: number
  orbitGap?: number
  rotationDuration?: number
  rowDelay?: number
  direction?: CirclesDirection
  alternateDirection?: boolean
  fadeMode?: CirclesFadeMode
  fadeBlur?: boolean
  showPaths?: boolean
  animate?: boolean
  animationDuration?: number
  animationStagger?: number
  staggerScaleFactor?: number
  className?: string
  itemClassName?: string
  renderItem?: (src: string, rowIndex: number, colIndex: number) => ReactNode
}

export default function Circles({
  rows,
  circleSize = 64,
  baseRadius = 120,
  orbitGap = 100,
  rotationDuration = 20,
  rowDelay = 0.5,
  direction = 'clockwise',
  alternateDirection = false,
  fadeMode = 'none',
  fadeBlur = false,
  showPaths = true,
  animate = true,
  animationDuration = 0.6,
  animationStagger = 0.15,
  staggerScaleFactor = 0,
  className = '',
  itemClassName = '',
  renderItem,
}: CirclesProps) {
  const rowCount = rows.length
  if (rowCount === 0) return null

  const radiusOf = (i: number) => (baseRadius + orbitGap * i) * (1 + staggerScaleFactor * i)
  const maxRadius = radiusOf(rowCount - 1)
  const containerSize = maxRadius * 2 + circleSize * 2

  const baseCounterClockwise = direction === 'counterclockwise'
  const ringDir = (i: number) => {
    let ccw = baseCounterClockwise
    if (alternateDirection && i % 2 === 1) ccw = !ccw
    return ccw ? 'reverse' : 'normal'
  }
  const chipDir = (i: number) => (ringDir(i) === 'reverse' ? 'normal' : 'reverse')

  const targetOpacity = (i: number) => {
    if (fadeMode === 'none') return 1
    const dim = fadeMode === 'out' ? i : rowCount - 1 - i
    return Math.max(0, Math.min(1, 1 - dim / Math.max(1, rowCount)))
  }
  const targetBlur = (i: number) => (fadeMode !== 'none' && fadeBlur ? i * 2 : 0)

  return (
    <div
      className={`relative ${className}`.trim()}
      style={{
        width: containerSize,
        height: containerSize,
        animation: animate ? 'circles-container-fade-in 0.8s ease-out' : undefined,
      }}
    >
      {showPaths && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{ width: containerSize, height: containerSize, transform: 'translate(-50%, -50%)' }}
        >
          {rows.map((_, i) => (
            <circle
              key={i}
              cx="50%"
              cy="50%"
              r={radiusOf(i)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="8 8"
              className="stroke-gray-300 dark:stroke-gray-700"
              style={{
                opacity: 0.5,
                animation: animate
                  ? `circles-path-entrance ${animationDuration}s ease-out ${i * animationStagger}s backwards`
                  : undefined,
              }}
            />
          ))}
        </svg>
      )}

      {rows.map((row, i) => {
        const radius = radiusOf(i)
        const duration = rotationDuration + rowDelay * i
        const delay = animate ? i * animationStagger : 0
        const step = 360 / row.length
        const ringSize = radius * 2

        return (
          <ul
            key={i}
            className="absolute left-1/2 top-1/2 m-0 list-none rounded-full p-0"
            style={{
              width: ringSize,
              height: ringSize,
              transform: 'translate(-50%, -50%)',
              animation: `circles-orbit ${duration}s linear infinite ${ringDir(i)}`,
            }}
          >
            {row.map((src, j) => {
              const angle = -90 + j * step
              const liStyle: CSSProperties = {
                width: circleSize,
                height: circleSize,
                margin: -circleSize / 2,
                transform: `rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)`,
                '--target-opacity': targetOpacity(i),
                '--target-blur': `${targetBlur(i)}px`,
              } as CSSProperties
              return (
                <li key={j} className="absolute left-1/2 top-1/2 block" style={liStyle}>
                  <div
                    className="h-full w-full"
                    style={{
                      opacity: targetOpacity(i),
                      filter: targetBlur(i) ? `blur(${targetBlur(i)}px)` : undefined,
                      animation: animate
                        ? `circles-item-in ${animationDuration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`
                        : undefined,
                    }}
                  >
                    <div
                      className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full shadow-lg ${itemClassName}`.trim()}
                      style={{
                        animation: `circles-counter-orbit ${duration}s linear infinite ${delay}s ${chipDir(i)}`,
                      }}
                    >
                      {renderItem ? (
                        renderItem(src, i, j)
                      ) : (
                        <img
                          src={src}
                          alt={`Circle ${i}-${j}`}
                          loading="lazy"
                          className="h-full w-full rounded-full border-2 border-white object-cover shadow-lg dark:border-gray-800"
                        />
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )
      })}
    </div>
  )
}