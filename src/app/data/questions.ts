export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  structure: string;
  category: string;
}

export const questions: Question[] = [
  {
    id: 0,
    question: "Qual estrutura do sistema límbico é fundamental para a formação de novas memórias declarativas?",
    options: ["Amígdala", "Hipocampo", "Tálamo", "Cerebelo"],
    correct: 1,
    explanation:
      "O Hipocampo converte memórias de curto prazo em longo prazo. Lesões bilaterais causam amnésia anterógrada grave — como no icônico caso H.M. (Henry Molaison), que não conseguia mais formar novas memórias após a cirurgia.",
    structure: "Hipocampo",
    category: "Sistema Límbico",
  },
  {
    id: 1,
    question: "A amígdala é primariamente conhecida por seu papel em qual função cerebral?",
    options: [
      "Coordenação motora fina",
      "Processamento da linguagem",
      "Resposta ao medo e emoções",
      "Regulação do sono",
    ],
    correct: 2,
    explanation:
      "A Amígdala processa estímulos emocionais, especialmente medo e ameaça. Ela ativa a resposta de luta-ou-fuga via hipotálamo e é crucial para o condicionamento emocional e a memória emocional de longo prazo.",
    structure: "Amígdala",
    category: "Sistema Límbico",
  },
  {
    id: 2,
    question: "Qual lobo cerebral contém o córtex motor primário, responsável pelo controle voluntário dos movimentos?",
    options: ["Lobo Temporal", "Lobo Occipital", "Lobo Parietal", "Lobo Frontal"],
    correct: 3,
    explanation:
      "O Lobo Frontal contém o giro pré-central (área 4 de Brodmann), o córtex motor primário. Cada região controla uma parte do corpo — representado pelo Homúnculo de Penfield, onde mãos e boca têm área desproporcional.",
    structure: "Lobo Frontal",
    category: "Córtex Cerebral",
  },
  {
    id: 3,
    question: "O cerebelo é responsável principalmente por qual função do sistema nervoso?",
    options: [
      "Processamento visual primário",
      "Coordenação motora e equilíbrio",
      "Regulação hormonal",
      "Memória semântica",
    ],
    correct: 1,
    explanation:
      "O Cerebelo coordena movimentos voluntários, equilíbrio e aprendizado motor. Apesar de representar ~10% do volume cerebral, contém ~80% de todos os neurônios do SNC. Lesões causam ataxia e dismetria.",
    structure: "Cerebelo",
    category: "Tronco e Cerebelo",
  },
  {
    id: 4,
    question: "A área de Broca, essencial para a produção da fala, está localizada em qual região?",
    options: [
      "Giro frontal inferior esquerdo",
      "Lobo temporal superior direito",
      "Giro angular parietal",
      "Córtex occipital",
    ],
    correct: 0,
    explanation:
      "A Área de Broca (áreas 44 e 45 de Brodmann) no giro frontal inferior do hemisfério dominante controla a produção motora da fala. Lesões causam afasia de Broca: compreensão preservada, mas fala telegráfica e laboriosa.",
    structure: "Área de Broca",
    category: "Linguagem",
  },
  {
    id: 5,
    question: "Qual estrutura atua como principal estação de retransmissão (relay) sensorial para o córtex cerebral?",
    options: ["Hipotálamo", "Tálamo", "Putâmen", "Substância Negra"],
    correct: 1,
    explanation:
      "O Tálamo é o portal sensorial do cérebro: quase todas as informações sensoriais (exceto olfação) passam por seus núcleos específicos antes de atingir o córtex. Também regula consciência e ciclos de sono-vigília.",
    structure: "Tálamo",
    category: "Estruturas Subcorticais",
  },
  {
    id: 6,
    question: "O hipotálamo regula a homeostase. Qual das opções NÃO é uma função hipotalâmica?",
    options: [
      "Regulação da temperatura corporal",
      "Controle da fome e saciedade",
      "Processamento da linguagem",
      "Controle do ciclo circadiano",
    ],
    correct: 2,
    explanation:
      "O Hipotálamo regula temperatura, fome, sede, sono e ciclo circadiano. O processamento de linguagem é função do córtex (áreas de Broca e Wernicke). O hipotálamo não participa do processamento linguístico.",
    structure: "Hipotálamo",
    category: "Estruturas Subcorticais",
  },
  {
    id: 7,
    question: "O corpo caloso é a maior comissura cerebral. Qual é sua principal função?",
    options: [
      "Produzir liquor cefalorraquidiano",
      "Conectar os dois hemisférios cerebrais",
      "Regular o sistema imune cerebral",
      "Processar informações auditivas",
    ],
    correct: 1,
    explanation:
      "O Corpo Caloso (~200-300 milhões de axônios) integra informações entre os hemisférios. Sua secção (calosotomia) causa síndrome do 'cérebro dividido', onde os hemisférios funcionam de forma independente e desintegrada.",
    structure: "Corpo Caloso",
    category: "Comissuras",
  },
  {
    id: 8,
    question: "Qual neurotransmissor é deficiente na via nigroestriatal e causa a Doença de Parkinson?",
    options: ["Serotonina", "Acetilcolina", "Dopamina", "GABA"],
    correct: 2,
    explanation:
      "A Dopamina produzida pela substância negra projeta-se para o estriado. Na doença de Parkinson, 60-80% desses neurônios dopaminérgicos degeneram, causando tremor em repouso, rigidez plástica e bradicinesia.",
    structure: "Substância Negra",
    category: "Neurotransmissores",
  },
  {
    id: 9,
    question: "O córtex pré-frontal dorsolateral está envolvido principalmente em quais funções cognitivas?",
    options: [
      "Visão e percepção de cor",
      "Memória de trabalho e funções executivas",
      "Audição e processamento musical",
      "Controle reflexo da pupila",
    ],
    correct: 1,
    explanation:
      "O CPFDL é o substrato das funções executivas: planejamento, memória de trabalho, tomada de decisões e controle inibitório. Lesões causam síndrome disexecutiva — dificuldade em planejar sequências e manter informações online.",
    structure: "Córtex Pré-frontal",
    category: "Funções Executivas",
  },
];

export const TOTAL_QUESTIONS = questions.length;
