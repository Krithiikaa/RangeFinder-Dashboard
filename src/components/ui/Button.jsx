import React from 'react'
export default function Button({ children, variant='primary', onClick, className='' }) {
  const base = 'px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-transform duration-150';
  const styles = {
    primary: 'bg-primary text-white hover:translate-y-[-2px] shadow-sm',
    ghost: 'bg-white border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-600 text-white'
  }
  return <button onClick={onClick} className={`${base} ${styles[variant] || styles.primary} ${className}`}>{children}</button>
}
