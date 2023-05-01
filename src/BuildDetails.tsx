//@ts-nocheck
export default function BuildDetails(props) {
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
