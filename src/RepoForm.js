import React from 'react'
import { useForm, useField } from 'react-final-form-hooks'
import PropTypes from 'prop-types'

function RepoForm({ onSubmit, initialValues }) {
  const { form, handleSubmit } = useForm({
    onSubmit,
    initialValues,
  })
  const repo = useField('repo', form)
  const token = useField('token', form)
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Repo name</label>
        <input {...repo.input} />
      </div>
      <div>
        <label>
          Access token (optional, let&apos;s you make more API requests without
          limitations)
        </label>
        <input {...token.input} />
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
RepoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({}).isRequired,
}

export default RepoForm
