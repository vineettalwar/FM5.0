import { useState, useEffect } from "react";

export function AnimatedPage({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(t); }, []);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 300ms ease-out, transform 300ms ease-out' }}>
      {children}
    </div>
  );
}
