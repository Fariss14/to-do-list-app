import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Dialog({
  title,
  onClose,
  children,
  className = ''
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby="dialog-title" onCancel={onClose} onClick={e => {
    if (e.target === ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose();
    }
  }}>
    <div className="dialog-heading">
      <div>
        <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
        <h2 id="dialog-title">{title}</h2>
      </div>
      <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
    {children}
  </dialog>;
}
