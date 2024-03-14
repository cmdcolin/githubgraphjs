// stackoverflow
export function filterOutliers(
  someArray: { duration: number; updated_at: unknown }[] = [],
) {
  if (!someArray.length) {
    return []
  }
  const values = someArray.concat()
  values.sort((a, b) => a.duration - b.duration)

  const q1 = values[Math.floor(values.length / 4)].duration
  const q3 =
    values[Math.min(Math.ceil(values.length * (3 / 4)), values.length - 1)]
      .duration
  const iqr = q3 - q1

  const maxValue = q3 + iqr * 3
  const minValue = q1 - iqr * 3

  return values.filter(
    x => x.duration < maxValue && x.duration > minValue && !!x.updated_at,
  )
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
