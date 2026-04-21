export const getCitiesForDestination = (dest: string, orig: string = "SANTA LUZIA-MG"): string[] => {
  const d = dest.toUpperCase();
  
  if (d.includes("ARIQUEMES")) {
    return ["SANTA LUZIA-MG", "Brasília/DF", "Cuiabá/MT", "Ariquemes/RO"];
  }
  if (d.includes("BEBEDOURO")) {
    return ["SANTA LUZIA-MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "São Sebastião do Paraíso/MG", "Batatais/SP", "Ribeirão Preto/SP", "Bebedouro/SP"];
  }
  if (d.includes("BRASILIA") || d.includes("BRASÍLIA")) {
    return ["SANTA LUZIA-MG", "Sete Lagoas/MG", "Felixlândia/MG", "Três Marias/MG", "João Pinheiro/MG", "Paracatu/MG", "Cristalina/GO", "Brasília/DF"];
  }
  if (d.includes("CAMBE") || d.includes("CAMBÉ")) {
    return ["SANTA LUZIA-MG", "Divinópolis/MG", "Passos/MG", "Ribeirão Preto/SP", "Marília/SP", "Londrina/PR", "Cambé/PR"];
  }
  if (d.includes("CAMPO GRANDE")) {
    return ["SANTA LUZIA-MG", "Araxá/MG", "Uberlândia/MG", "Campo Grande/MS"];
  }
  if (d.includes("CASTRO")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Sorocaba/SP", "Itapetininga/SP", "Itapeva/SP", "Jaguariaíva/PR", "Piraí do Sul/PR", "Castro/PR"];
  }
  if (d.includes("CUIABA") || d.includes("CUIABÁ")) {
    return ["SANTA LUZIA-MG", "Nova Serrana/MG", "Araxá/MG", "Uberlândia/MG", "Itumbiara/GO", "Rio Verde/GO", "Alto Araguaia/MT", "Rondonópolis/MT", "Cuiabá/MT"];
  }
  if (d.includes("CURITIBA")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Curitiba/PR"];
  }
  if (d.includes("EUSEBIO") || d.includes("EUSÉBIO")) {
    if (d.includes("NATAL")) {
      return ["SANTA LUZIA-MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Paulo Afonso/BA", "Euclides da Cunha/BA", "Salgueiro/PE", "Caruaru/PE", "Recife/PE", "João Pessoa/PB", "Natal/RN", "Eusébio/CE"];
    }
    return ["SANTA LUZIA-MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Euclides da Cunha/BA", "Salgueiro/PE", "Eusébio/CE"];
  }
  if (d.includes("GUARULHOS")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Guarulhos/SP"];
  }
  if (d.includes("GOV. CELSO RAMOS") || d.includes("GOVERNADOR CELSO RAMOS")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", "Gov. Celso Ramos/SC"];
  }
  if (d.includes("XAXIM")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Jarinu/SP", "Osasco/SP", "Juquitiba/SP", "Registro/SP", "São José dos Pinhais/PR", "São Mateus do Sul/PR", "União da Vitória/PR", "Gen. Carneiro/PR", "Ponte Serrada/SC", "Xanxerê/SC", "Xaxim/SC"];
  }
  if (d.includes("JUIZ DE FORA")) {
    return ["SANTA LUZIA-MG", "Contagem/MG", "Conselheiro Lafaiete/MG", "Barbacena/MG", "Juiz de Fora/MG"];
  }
  if (d.includes("LINHARES")) {
    return ["SANTA LUZIA-MG", "Vargem Linda/MG", "Rio Casca/MG", "Manhuaçu/MG", "Venda Nova do Imigrante/ES", "Linhares/ES"];
  }
  if (d.includes("NATAL")) {
    return ["SANTA LUZIA-MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Paulo Afonso/BA", "Caruaru/PE", "Recife/PE", "João Pessoa/PB", "Natal/RN"];
  }
  if (d.includes("PINHAIS")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Pinhais/PR"];
  }
  if (d.includes("PATROCINIO PAULISTA") || d.includes("PATROCÍNIO PAULISTA")) {
    return ["SANTA LUZIA-MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "Patrocínio Paulista/SP"];
  }
  if (d.includes("RIO DE JANEIRO")) {
    return ["SANTA LUZIA-MG", "Congonhas/MG", "Barbacena/MG", "Santos Dumont/MG", "Juiz de Fora/MG", "Petrópolis/RJ", "Rio de Janeiro/RJ"];
  }
  if (d.includes("SALVADOR")) {
    if (d.includes("VALADARES") || d.includes("ANTONIO DIAS") || d.includes("ANTÔNIO DIAS")) {
      return ["SANTA LUZIA-MG", "Antônio Dias/MG", "Governador Valadares/MG", "Teófilo Otoni/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
    }
    return ["SANTA LUZIA-MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
  }
  if (d.includes("SUMARE") || d.includes("SUMARÉ")) {
    return ["SANTA LUZIA-MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Campinas/SP", "Sumaré/SP"];
  }
  if (d.includes("VIANA")) {
    return ["SANTA LUZIA-MG", "Vargem Linda/MG", "Rio Casca/MG", "Manhuaçu/MG", "Venda Nova do Imigrante/ES", "Viana/ES"];
  }
  if (d.includes("GRAVATAI") || d.includes("GRAVATAÍ")) {
    return [
      "SANTA LUZIA-MG",
      "Carmópolis de Minas/MG",
      "Pouso Alegre/MG",
      "Juquitiba/SP",
      "Pinhais/PR",
      "Joinville/SC",
      "Tubarão/SC",
      "Osório/RS",
      "Gravatai/RS"
    ];
  }
  
  // Default fallback if no match
  return [orig, "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", dest];
};

export interface ForbiddenStopsInfo {
  stops: string[];
  overnight?: string;
}

export const getForbiddenStopsForDestination = (dest: string): ForbiddenStopsInfo => {
  const d = dest.toUpperCase();

  if (d.includes("SALVADOR")) {
    return {
      stops: ["Salinas/MG", "Jequié/BA", "Simões Filho/BA", "Itaquara-MG", "Cambuí/MG", "Itatiaiuçu-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG"],
      overnight: "Rede Graal"
    };
  }
  if (d.includes("VIANA")) {
    return { stops: ["João Monlevade/MG"] };
  }
  if (d.includes("PATROCINIO PAULISTA") || d.includes("PATROCÍNIO PAULISTA")) {
    return {
      stops: ["Itaquara-MG", "Cambuí/MG", "Itatiaiuçu-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG"],
      overnight: "Rede Graal"
    };
  }
  if (d.includes("PINHAIS")) {
    return {
      stops: ["Cambuí/MG", "Itatiaiuçu-MG", "Itaquara-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG", "Itapeva-MG", "Varginha-MG", "Embu das Artes-SP", "Miracatu-SP"],
      overnight: "REDE GRAAL"
    };
  }
  if (d.includes("NATAL")) {
    return {
      stops: ["Goiana/PE (exceto Posto Fiscal)", "Águas Belas/PE", "Mamanguape/PB", "(Proibido o trânsito pela BR101 no estado de Sergipe, tendo como opção o tráfego pela BR116.)"]
    };
  }
  if (d.includes("LONDRINA")) {
    return { stops: ["Ribeirão Preto/SP", "Uberaba/MG"] };
  }
  if (d.includes("MONTES CLAROS")) {
    return { stops: ["Região Metropolitana de BH até Paraopebas/MG (só pode parar com 150 km rodados)"] };
  }
  if (d.includes("LINHARES")) {
    return { stops: ["João Monlevade/MG"] };
  }
  if (d.includes("JUIZ DE FORA")) {
    return { stops: ["BELO HORIZONTE MG", "CONTAGEM MG", "CONGONHAS MG", "ANTONIO CARLOS MG", "CRISTIANO OTONI MG"] };
  }
  if (d.includes("XAXIM")) {
    return {
      stops: ["Cambuí/MG", "Itatiaiuçu-MG", "Itaquara-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG", "Itapeva-MG", "Varginha-MG", "Osasco-SP", "Embu das Artes-SP", "Guarulhos-SP (exceto P. Sakamoto)", "Itapecerica da Serra-SP", "Miracatu-SP"]
    };
  }
  if (d.includes("GOV. CELSO RAMOS") || d.includes("GOVERNADOR CELSO RAMOS")) {
    return {
      stops: ["Cambuí/MG", "Itatiaiuçu-MG", "Itaquara-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG", "Itapeva-MG", "Varginha-MG", "Embu das Artes-SP", "Guarulhos-SP (exceto P. Sakamoto)", "Itapecerica da Serra-SP", "Miracatu-SP"]
    };
  }
  if (d.includes("GUARULHOS")) {
    return {
      stops: ["Cambuí/MG", "Itatiaiuçu-MG", "Itaquara-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG", "Itapeva-MG", "Varginha-MG", "Embu das Artes-SP", "Guarulhos-SP (exceto P. Sakamoto)", "Itapecerica da Serra-SP", "Miracatu-SP"]
    };
  }
  if (d.includes("EUSEBIO")) {
    if (d.includes("NATAL")) {
      return {
        stops: ["Antes da Cidade de Curvelo/MG (exceto problema mecânico/elétrico)", "Salinas/MG", "Goiana/PE (exceto Posto Fiscal)", "Águas Belas/PE", "Mamanguape/PB", "OBS(Obrigatório informar imediatamente via teclado do rastreador (Proibido o trânsito pela BR101 no estado de Sergipe, tendo como opção o tráfego pela BR116.)"]
      };
    }
    return {
      stops: ["Antes da Cidade de Curvelo/MG (exceto problema mecânico/elétrico)", "Salinas/MG", "OBS(Obrigatório informar imediatamente via teclado do rastreador)"]
    };
  }
  if (d.includes("CURITIBA")) {
    if (d.includes("DESTRO")) {
      return {
        stops: ["Cambuí/MG", "Itatiaiuçu-MG", "Itaquara-MG", "Extrema-MG", "Pouso Alegre-MG", "Campanha-MG", "Carmópolis de Minas-MG", "Igarapé-MG", "Itapeva-MG", "Varginha-MG", "Embu das Artes-SP", "Miracatu-SP", "Guarulhos-SP (exceto P. Sakamoto)", "Itapecerica da Serra-SP"],
        overnight: "REDE GRAAL"
      };
    }
    if (d.includes("CONDOR")) {
      return {
        stops: ["Cambuí/MG", "Campanha-MG", "Varginha-MG", "Guarulhos-SP (exceto P. Sakamoto)", "Itatiaiuçu-MG", "Carmópolis de Minas-MG", "Itaquara-MG", "Itapecerica da Serra-SP", "Extrema-MG", "Igarapé-MG", "Embu das Artes-SP", "Pouso Alegre-MG", "Itapeva-MG", "Miracatu-SP"],
        overnight: "REDE GRAAL"
      };
    }
  }
  if (d.includes("CUIABA") || d.includes("CUIABÁ")) {
    return { stops: ["Uberlândia/MG"] };
  }
  if (d.includes("CASTRO")) {
    return {
      stops: ["Cambuí/MG", "Campanha-MG", "Varginha-MG", "Guarulhos-SP (exceto P. Sakamoto)", "Itatiaiuçu-MG", "Carmópolis de Minas-MG", "Itaquara-MG", "Itapecerica da Serra-SP", "Extrema-MG", "Igarapé-MG", "Embu das Artes-SP", "Pouso Alegre-MG", "Itapeva-MG", "Miracatu-SP"],
      overnight: "REDE GRAAL"
    };
  }
  if (d.includes("CAMPO GRANDE")) {
    return { stops: ["Uberlândia-MG"] };
  }
  if (d.includes("CAMBE") || d.includes("CAMBÉ")) {
    return { stops: ["Ribeirão Preto/SP"] };
  }
  if (d.includes("BRASILIA") || d.includes("BRASÍLIA")) {
    return { stops: ["Região metropolitana de Brasília/DF"] };
  }
  if (d.includes("BEBEDOURO")) {
    return { stops: ["Itaquara-MG", "Campanha-MG", "Cambuí/MG", "Carmópolis de Minas-MG", "Itatiaiuçu-MG", "Igarapé-MG", "Extrema-MG", "Pouso Alegre-MG"] };
  }
  if (d.includes("RIO DE JANEIRO")) {
    return {
      stops: [
        "Contagem/MG",
        "Betim/MG",
        "Barbacena/MG",
        "Santos Dumont/MG",
        "Juiz de Fora/MG",
        "Petrópolis/RJ"
      ]
    };
  }
  // Default forbidden stops
  return {
    stops: [
      "Cambuí/MG",
      "Campanha/MG",
      "Embu das Artes/SP",
      "Itatiaiuçu/MG",
      "Carmópolis de Minas/MG",
      "Guarulhos/SP (exceto P. Sakamoto)",
      "Itaguara/MG",
      "Igarapé/MG",
      "Itapecerica da Serra/SP",
      "Extrema/MG",
      "Itapeva/MG",
      "Miracatu/SP",
      "Pouso Alegre/MG",
      "Varginha/MG",
      "Três Corações/MG"
    ]
  };
};
