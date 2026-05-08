export default function SoftButton({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`soft-btn soft-btn-${variant}${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}
