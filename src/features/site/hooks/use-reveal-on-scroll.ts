import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevelado(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevelado(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevelado(true);
          observer.unobserve(elemento);
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(elemento);

    return () => observer.disconnect();
  }, []);

  return { ref, revelado };
}
