import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(window.innerWidth < MOBILE_BREAKPOINT);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Adiciona o ouvinte de eventos quando o componente monta
    mql.addEventListener("change", onChange);

    // Configura o estado inicialmente com o valor correto
    setIsMobile(mql.matches);

    // Limpeza do ouvinte de eventos quando o componente desmonta
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return isMobile;
}
