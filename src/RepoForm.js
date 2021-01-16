import React from 'react'
import { useForm, useField } from 'react-final-form-hooks'
import PropTypes from 'prop-types'

function RepoForm({ onSubmit, initialValues }) {
  const { form, handleSubmit, pristine, submitting } = useForm({
    onSubmit,
    initialValues,
  })
  const repo = useField('repo', form)
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Repo name</label>
        <input {...repo.input} />
      </div>

      <button type="submit" disabled={pristine || submitting}>
        Submit
      </button>
    </form>
  )
}
RepoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({}).isRequired,
}

export default RepoForm
