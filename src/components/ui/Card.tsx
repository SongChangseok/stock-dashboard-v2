import React from 'react'
import { CardProps } from '../../types/components'

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = "",
  variant = "default"
}) => {
  const variantClasses = {
    default: 'bg-white/5 border border-white/10',
    outlined: 'bg-white/3 border border-white/20',
    elevated: 'bg-white/10 border border-white/20 shadow-xl'
  }

  return (
    <div className={`
      ${variantClasses[variant]} 
      rounded-2xl backdrop-blur-xl overflow-hidden
      ${className}
    `}>
      {(title || subtitle || actions) && (
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
          <div>
            {title && (
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

export { Card }
export default Card