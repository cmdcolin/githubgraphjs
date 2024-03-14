import { useState, useEffect } from 'react'
import AbortablePromiseCache from 'abortable-promise-cache'
import QuickLRU from 'quick-lru'
import { filterOutliers, getBuilds, isAbortException } from './util'

interface Result {
  total_count: number
  branch: string
  duration: string
  github_link: string
  message: string
  updated_at2: number
  name: string
  state: string
  workflow_runs: {
    head_commit?: { message: string }
    head_branch: string
    name: string
    id: string
    updated_at: number
    created_at: number
    conclusion: string
  }[]
}
interface Result2 {
  total: number
  result: Result[]
}
const cache = new AbortablePromiseCache<
  { url: string; token: string },
  Result2
>({
  cache: new QuickLRU({ maxSize: 1000 }),
  // @ts-expect-error
  async fill(requestData: { url: string; token?: string }, signal) {
    const { url, token } = requestData
    const ret = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `token ${token}` } : {}),
      },
      signal,
    })
    if (!ret.ok) {
      throw new Error(`HTTP ${ret.status} ${ret.statusText}`)
    }
    const json = (await ret.json()) as Result
    return {
      total: json.total_count,
      result: filterOutliers(
        json.workflow_runs.map(m => ({
          message: m.head_commit?.message?.slice(0, 50),
          branch: m.head_branch,
          name: m.name,
          github_link: m.id,
          // @ts-expect-error
          duration: (new Date(m.updated_at) - new Date(m.created_at)) / 60000,
          state: m.conclusion,
          updated_at: new Date(m.updated_at),
          updated_at2: m.updated_at,
        })),
      ),
    }
  },
})

export function useGithubActions(query: { repo: string; token: string }) {
  const [counter, setCounter] = useState(0)
  const [error, setError] = useState<unknown>()
  const [total, setTotal] = useState<number>()
  const [loading, setLoading] = useState(query.repo ? 'Loading...' : '')
  const [builds, setBuilds] = useState<Result[]>([])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        if (query?.repo) {
          const url = getBuilds({ ...query, counter: builds.length })
          if (url && total ? total >= builds.length : true) {
            const token = query.token
            const { total, result } = await cache.get(url + token, {
              url,
              token,
            })
            if (result.length) {
              setBuilds([...builds, ...result])
              setTotal(total)
              setLoading(`Loading builds...${builds.length}/${total}`)
            } else {
              setLoading('')
              setCounter(0)
            }
          } else if (!builds.length) {
            setError('No builds loaded')
          } else {
            setLoading('')
            setCounter(0)
          }
        }
      } catch (e) {
        if (!isAbortException(e)) {
          console.error(e)
          setError(e)
        }
      }
    })()
  }, [loading, query, counter, builds, total])

  return [loading, error, builds] as const
}
