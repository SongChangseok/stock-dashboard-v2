import React from 'react'
import { ActionButtonGroupProps } from '../../types/components'
import LoadingButton from './LoadingButton'

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  onEdit,
  onDelete,
  onCompare,
  isLoading = false,
  deleteText = "Delete",
  editText = "Edit",
  compareText = "Compare"
}) => {
  return (
    <div className="flex gap-2" role="group" aria-label="Action buttons">
      <LoadingButton
        onClick={onEdit}
        isLoading={isLoading}
        variant="secondary"
        className="flex-1"
      >
        {editText}
      </LoadingButton>
      
      {onCompare && (
        <LoadingButton
          onClick={onCompare}
          isLoading={isLoading}
          variant="primary"
          className="flex-1"
        >
          {compareText}
        </LoadingButton>
      )}
      
      <LoadingButton
        onClick={onDelete}
        isLoading={isLoading}
        variant="danger"
        className="flex-1"
      >
        {deleteText}
      </LoadingButton>
    </div>
  )
}

export default ActionButtonGroup