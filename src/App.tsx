import { useState } from 'react'
import RepoForm from './RepoForm'
import Graph from './Graph'
import { useGithubActions } from './hooks'

export default function App() {
  const [state, setState] = useState<{ token: string; repo: string }>({
    repo: '',
    token: '',
  })
  const [loading, error, builds] = useGithubActions(state)

  return (
    <>
      <h1>githubgraph-js - GitHub actions graphs</h1>

      <RepoForm onSubmit={res => setState(res)} />

      {error ? (
        <p style={{ color: 'red' }}>{`${error}`}</p>
      ) : loading ? (
        <p>{loading}</p>
      ) : builds.length ? (
        <div style={{ marginTop: 50 }}>
          <Graph builds={builds} query={state} />
        </div>
      ) : null}

      {builds ? (
        <textarea
          style={{ marginTop: 20 }}
          rows={10}
          cols={120}
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
                    .replaceAll('\n', ' ')
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
