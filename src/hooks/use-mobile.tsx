import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Função para atualizar o estado baseado no tamanho da tela
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Configura o estado inicial com a correspondência do `matchMedia`
    setIsMobile(mql.matches);

    // Adiciona o ouvinte de evento quando o componente monta
    mql.addEventListener("change", onChange);

    // Limpeza do ouvinte de evento quando o componente desmonta
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []); // Este efeito roda apenas uma vez, quando o componente monta

  return isMobile;
}
