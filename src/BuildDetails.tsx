export default function BuildDetails({
  build,
  repo,
}: {
  build: Record<string, unknown>
  repo: string
}) {
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
          if (key.startsWith('yearmonth')) {
            return null
          } else if (key.startsWith('github')) {
            const href = `https://github.com/${repo}/actions/runs/${value}`
            return (
              <tr key={key}>
                <td>link</td>
                <td>
                  <a href={href}>{href}</a>
                </td>
              </tr>
            )
          } else {
            return (
              <tr key={key}>
                <td>{`${key}`}</td>
                <td>{`${value}`}</td>
              </tr>
            )
          }
        })}
      </tbody>
    </table>
  )
}
