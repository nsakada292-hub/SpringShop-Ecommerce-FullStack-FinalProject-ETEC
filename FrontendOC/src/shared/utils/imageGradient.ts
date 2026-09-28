const GRADIENTS = [
  'linear-gradient(135deg, #34d399 0%, #22c55e 100%)',
  'linear-gradient(135deg, #4ade80 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #f472b6 0%, #ff6b6b 100%)',
  'linear-gradient(135deg, #34d399 0%, #34d399 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f87171 100%)',
  'linear-gradient(135deg, #818cf8 0%, #e879f9 100%)',
  'linear-gradient(135deg, #22d3ee 0%, #34d399 100%)',
  'linear-gradient(135deg, #fb7185 0%, #fb923c 100%)',
]

export function getImageGradient(id: number): string {
  return GRADIENTS[Math.abs(id) % GRADIENTS.length]
}
