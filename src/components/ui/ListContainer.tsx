import { ListContainerProps } from '../../types/components'
import EmptyState from './EmptyState'

const ListContainer = <T,>({
  title,
  items,
  renderItem,
  emptyMessage = "No items to display",
  className = ""
}: ListContainerProps<T>) => {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden ${className}`}>
      <div className="p-4 md:p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      
      {items.length === 0 ? (
        <EmptyState 
          title="No Items Found"
          description={emptyMessage}
          className="p-8 md:p-16"
        />
      ) : (
        <div className="space-y-3 p-4">
          {items.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListContainer