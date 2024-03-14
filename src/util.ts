// stackoverflow
export function filterOutliers(
  arr: { duration: number; updated_at: unknown }[] = [],
) {
  if (!arr.length) {
    return []
  }
  const vals = arr.map(s => s.duration)
  let sum = 0
  for (const val of vals) {
    sum += val
  }
  const avg = sum / vals.length

  return arr.filter(x => x.duration < avg * 2)
}
export function isAbortException(exception: unknown) {
  return (
    // DOMException
    // @ts-expect-error
    exception.name === 'AbortError' ||
    // standard-ish non-DOM abort exception
    // @ts-expect-error
    exception.code === 'ERR_ABORTED' ||
    // stringified DOMExc// eption
    // @ts-expect-error
    exception.message === 'AbortError: aborted' ||
    // stringified standard-ish exception
    // @ts-expect-error
    exception.message === 'Error: aborted'
  )
}

const BUILDS_PER_REQUEST = 100

export function getBuilds({
  counter,
  repo,
}: {
  counter: number
  repo: string
}) {
  return `https://api.github.com/repos/${repo}/actions/runs?page=${Math.floor(
    counter / BUILDS_PER_REQUEST,
  )}&per_page=${BUILDS_PER_REQUEST}`
}
