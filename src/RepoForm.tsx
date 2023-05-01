import { useState } from 'react'

function RepoForm({
  onSubmit,
  initialRepo = '',
}: {
  onSubmit: (arg: { token: string; repo: string }) => void
  initialRepo?: string
}) {
  const [repo, setRepo] = useState(initialRepo)
  const [token, setToken] = useState('')
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        onSubmit({ repo, token })
      }}
    >
      <div>
        <label style={{ marginRight: 10 }}>Repo name:</label>
        <input value={repo} onChange={event => setRepo(event.target.value)} />
      </div>
      <div>
        <label style={{ marginRight: 10 }}>
          Access token (optional, let&apos;s you make more API requests without
          limitations):
        </label>
        <input value={token} onChange={event => setToken(event.target.value)} />
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
export default RepoForm
