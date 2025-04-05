import { useState } from 'react'

import Graph from './Graph'
import { useGithubActions } from './hooks'

export default function App() {
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [tmp1, setTmp1] = useState('')
  const [tmp2, setTmp2] = useState('')
  const [loading, error, builds] = useGithubActions({ repo, token })
  return (
    <>
      <h1>githubgraph-js - GitHub actions graphs</h1>
      <form
        onSubmit={event => {
          event.preventDefault()
          setRepo(tmp1)
          setToken(tmp2)
        }}
      >
        <div>
          <label style={{ marginRight: 10 }}>Repo name:</label>
          <input value={tmp1} onChange={event => { setTmp1(event.target.value); }} />
        </div>
        <div>
          <label style={{ marginRight: 10 }}>
            Access token (optional, let&apos;s you make more API requests
            without limitations):
          </label>
          <input value={tmp2} onChange={event => { setTmp2(event.target.value); }} />
        </div>

        <button type="submit">Submit</button>
      </form>
      {error ? (
        <p style={{ color: 'red' }}>{`${error}`}</p>
      ) : loading ? (
        <p>{loading}</p>
      ) : builds.length > 0 ? (
        <div style={{ marginTop: 50 }}>
          <Graph builds={builds} repo={repo} />
        </div>
      ) : null}
      {builds ? (
        <textarea
          style={{ marginTop: 20 }}
          rows={10}
          cols={120}
          onChange={() => {
            /* none */
          }}
          value={[
            [
              'branch',
              'duration',
              'github_link',
              'message',
              'name',
              'state',
              'updated_at',
            ].join('\t'),
            ...builds
              .map(
                b =>
                  `${b.branch}\t${b.duration}\t${b.github_link}\t${b.message
                    ?.replaceAll('\n', ' ')
                    .replaceAll('\t', ' ')}\t${b.name}\t${b.state}\t${
                    b.updated_at2
                  }`,
              )
              .filter(f => !!f.trim()),
          ].join('\n')}
        ></textarea>
      ) : null}
      <div style={{ marginTop: 50 }}>
        <a href="https://github.com/cmdcolin/githubgraphjs/">source code</a>
      </div>
    </>
  )
}
