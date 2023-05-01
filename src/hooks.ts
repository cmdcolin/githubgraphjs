import { useState, useEffect } from 'react'
import AbortablePromiseCache from 'abortable-promise-cache'
import QuickLRU from 'quick-lru'
import { filterOutliers, getBuilds, isAbortException } from './util'

const cache = new AbortablePromiseCache({
  cache: new QuickLRU({ maxSize: 1000 }),
  async fill(requestData, signal) {
    const { url, token } = requestData
    const ret = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: token ? `token ${token}` : undefined,
      },
      signal,
    })
    if (!ret.ok) {
      throw new Error(`HTTP ${ret.status} ${ret.statusText}`)
    }
    const json = await ret.json()
    return {
      total: json.total_count,
      result: filterOutliers(
        json.workflow_runs.map(m => ({
          message: (m.head_commit || {}).message.slice(0, 50),
          branch: m.head_branch,
          name: m.name,
          github_link: m.id,
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
  const [total, setTotal] = useState()
  const [loading, setLoading] = useState(query.repo ? 'Loading...' : '')
  const [builds, setBuilds] = useState([])

  useEffect(() => {
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
