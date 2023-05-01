import { useState } from 'react'
import { VegaLite } from 'react-vega'
import BuildDetails from './BuildDetails'

export default function Graph(props: { builds: any; query: any }) {
  const [clickedBuild, setClickedBuild] = useState()
  const { builds, query } = props
  console.log({ builds })

  return (
    <div style={{ display: 'flex' }}>
      <VegaLite
        data={{ values: builds }}
        patch={spec => {
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
          $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
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
