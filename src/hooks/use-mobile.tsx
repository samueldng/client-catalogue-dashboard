import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;  // exemplo de valor para a quebra de responsividade

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    // Inicializa o estado baseado na largura atual da janela
    onChange();

    // Adiciona o event listener para mudanças na largura da tela
    mql.addEventListener("change", onChange);

    // Limpeza do evento ao desmontar o componente
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return isMobile;
}
