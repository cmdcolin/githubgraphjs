import React, { useState, useEffect } from 'react'
import { useQueryParams, StringParam } from 'use-query-params'
import { VegaLite } from 'react-vega'
import AbortablePromiseCache from 'abortable-promise-cache'
import QuickLRU from 'quick-lru'
import RepoForm from './RepoForm'
import { filterOutliers, isAbortException } from './util'

const BUILDS_PER_REQUEST = 100

const cache = new AbortablePromiseCache({
  cache: new QuickLRU({ maxSize: 1000 }),
  async fill(requestData, signal) {
    const { url } = requestData
    const ret = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal,
    })
    if (!ret.ok) {
      throw new Error(`HTTP ${ret.status} ${ret.statusText}`)
    }
    const json = await ret.json()
    return {
      total: json.total_count,
      result: filterOutliers(
        json.workflow_runs.map((m) => ({
          message: (m.head_commit || {}).message.slice(0, 50),
          branch: m.head_branch,
          name: m.name,
          github_link: m.id,
          duration: (new Date(m.updated_at) - new Date(m.created_at)) / 60000,
          state: m.conclusion,
          updated_at: new Date(m.updated_at),
        }))
      ),
    }
  },
})

function getBuilds({ counter, repo }) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return `test_data/${Math.floor(counter / BUILDS_PER_REQUEST)}.json`
  } else {
    return `https://api.github.com/repos/${repo}/actions/runs?page=${Math.floor(
      counter / BUILDS_PER_REQUEST
    )}&per_page=${BUILDS_PER_REQUEST}`
  }
}

function useGithubActions(query) {
  const [counter, setCounter] = useState(0)
  const [error, setError] = useState()
  const [total, setTotal] = useState()
  const [loading, setLoading] = useState(query.repo ? 'Loading...' : '')
  const [builds, setBuilds] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        if (query && query.repo) {
          const url = getBuilds({ ...query, counter: builds.length })
          if (url && total ? total >= builds.length : true) {
            const { total, result } = await cache.get(url, {
              url,
            })
            if (result.length) {
              setBuilds([...builds, ...result])
              setTotal(total)
              setLoading(`Loading builds...${builds.length}/${total}`)
            } else {
              setLoading(undefined)
              setCounter(0)
            }
          } else if (!builds.length) {
            setError('No builds loaded')
          } else {
            setLoading(undefined)
            setCounter(0)
          }
        }
      } catch (e) {
        if (!isAbortException(e)) {
          console.error(e)
          setError(e.message)
        }
      }
    })()
  }, [loading, query, counter, builds, total])

  return [loading, error, builds]
}

function BuildDetails(props) {
  const { build, repo } = props
  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(build).map(([key, value]) => {
          if (key.startsWith('yearmonth')) return null
          if (key.startsWith('github')) {
            const href = `https://github.com/${repo}/actions/runs/${value}`
            return (
              <tr>
                <td>link</td>
                <td>
                  <a href={href}>{href}</a>
                </td>
              </tr>
            )
          }
          return (
            <tr key={key}>
              <td>{`${key}`}</td>
              <td>{`${value}`}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Graph(props) {
  const [clickedBuild, setClickedBuild] = useState()
  const { builds, query } = props

  return (
    <div style={{ display: 'flex' }}>
      <VegaLite
        data={{ values: builds }}
        patch={(spec) => {
          spec.signals.push({
            name: 'barClick',
            value: 0,
            on: [{ events: '*:mousedown', update: 'datum' }],
          })
          return spec
        }}
        signalListeners={{
          barClick: (command, args) => {
            setClickedBuild(args)
          },
        }}
        spec={{
          $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
          width: 1000,
          height: 400,
          mark: { type: 'point', tooltip: { content: 'data' } },
          data: { name: 'values' },
          selection: {
            grid: {
              type: 'interval',
              bind: 'scales',
            },
          },
          encoding: {
            y: {
              field: 'duration',
              type: 'quantitative',
              axis: {
                title: 'Duration (minutes)',
              },
            },
            x: {
              field: 'updated_at',
              timeUnit: 'yearmonthdatehoursminutes',
              type: 'temporal',
              scale: {
                nice: 'week', // add some padding/niceness to domain
              },
              axis: {
                title: 'Date',
              },
            },
            color: {
              field: 'state',
              type: 'nominal',
              scale: {
                domain: ['success', 'skipped', 'failure', 'canceled'],
                range: ['#39aa56', '#ff7f0e', '#db4545', '#9d9d9d'],
              },
            },
          },
        }}
      />
      {clickedBuild ? (
        <BuildDetails repo={query.repo} build={clickedBuild} />
      ) : null}
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useQueryParams({
    repo: StringParam,
  })
  const [, forceRerender] = useState(0)
  const [loading, error, builds] = useGithubActions(query)

  return (
    <>
      <h1>githubgraph-js - GitHub actions graphs</h1>
      <p>Enter a repo name</p>
      <RepoForm
        initialValues={query}
        onSubmit={(res) => {
          setQuery(res)
          forceRerender((c) => c + 1)
        }}
      />
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : loading !== undefined ? (
        <p>{loading}</p>
      ) : (
        <Graph builds={builds} query={query} />
      )}
      <a href="https://github.com/cmdcolin/githubgraphjs/">source code</a>
    </>
  )
}
