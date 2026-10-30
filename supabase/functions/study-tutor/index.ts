import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const curriculum: Record<string, Record<string, string>> = {
  especificos: {
    snt: "Sistema Nacional de Trânsito: órgãos, competências e coordenação",
    "ctb-circulacao": "Normas gerais de circulação, conduta e preferência",
    "ctb-sinalizacao": "Sinalização, gestos do agente e hierarquia das ordens",
    "ctb-usuarios": "Pedestres, ciclistas, transporte coletivo e segurança viária",
    "ctb-infracoes": "Infrações: classificação, responsabilidade e autuação",
    "ctb-penalidades": "Penalidades, medidas administrativas e diferenças entre elas",
    "ctb-processo": "Notificações, defesa, recursos e processo administrativo de trânsito",
    "ctb-municipal": "Competência municipal, fiscalização e circunscrição da via",
    contran: "CONTRAN: resoluções e normas de trânsito",
    cf5: "Direitos e garantias fundamentais: Constituição, art. 5º",
    cf144: "Segurança pública e órgãos: Constituição, art. 144",
    maranhao: "Constituição do Maranhão: organização e competências citadas no edital",
    "adm-principios": "Administração pública: princípios, organização e agentes",
    atos: "Atos administrativos: elementos, atributos, validade e controle",
    poderes: "Poderes administrativos e poder de polícia: limites e finalidade",
    servicos: "Serviços públicos, responsabilidade, deveres e controle administrativo",
    penal: "Noções de Direito Penal: crime, dolo, culpa e crimes contra a Administração",
    abuso: "Abuso de autoridade: Lei 13.869/2019 e atualização em relação ao edital",
    servidores: "Estatuto dos servidores municipais: Lei 1.593/2015",
    relacoes: "Relações interpessoais, ética, iniciativa, organização e liderança",
    atualidades: "Atualidades, História e Geografia do Maranhão previstas no edital",
  },
  portugues: {
    interpretacao: "Compreensão, interpretação e inferência em textos",
    generos: "Gêneros, tipologias e funções da linguagem",
    coesao: "Coerência, coesão, referenciação e conectivos",
    registro: "Variação linguística, registro e norma-padrão",
    formacao: "Estrutura e formação de palavras",
    morfologia: "Classes de palavras e flexões",
    sintaxe: "Termos da oração e período simples e composto",
    concordancia: "Concordância verbal e nominal",
    regencia: "Regência verbal e nominal e crase",
    pontuacao: "Pontuação e seus efeitos de sentido",
    acentuacao: "Acentuação gráfica e ortografia",
    semantica: "Semântica, sinonímia, antonímia, polissemia e figuras de linguagem",
  },
  informatica: {
    equipamentos: "Computadores, componentes, periféricos e conexões",
    "redes-moveis": "Redes cabeadas, sem fio e dispositivos móveis",
    dados: "Dados, informação, processamento, armazenamento e bancos de dados",
    sistemas: "Sistemas operacionais Windows e Linux: arquivos, pastas e configurações",
    software: "Software, aplicativos, drivers e linguagens de programação",
    office: "Microsoft Office e LibreOffice: recursos de texto, planilhas e apresentações",
    "sistemas-info": "Sistemas de informação, ERP e colaboração digital",
    "midia-digital": "Recursos gráficos, mapas, realidade virtual e aumentada",
    internet: "Internet, protocolos, navegadores, busca e serviços",
    "redes-internas": "Compartilhamento, intranet, extranet, comunicação e redes sociais",
    nuvem: "Computação em nuvem, virtualização, sincronização e backup",
    seguranca: "Segurança da informação, autenticação, malware, phishing e invasões",
    arquivos: "Formatos, extensões, conversão e organização de arquivos",
    planilhas: "Planilhas eletrônicas: referências, fórmulas, funções e filtros",
  },
  imperatriz: {
    historia: "Formação histórica de Imperatriz e ocupação do território",
    territorio: "Localização, limites, municípios vizinhos e área urbana",
    rio: "Rio Tocantins, relevo, clima e hidrografia",
    populacao: "População, economia, serviços e desenvolvimento municipal",
    simbolos: "Símbolos oficiais e leis municipais mencionadas no edital",
    "fontes-oficiais": "Como estudar dados do IBGE, Prefeitura e fontes públicas locais",
  },
};

const stageTitles = ["Revisão ativa", "Teoria guiada", "Treinamento", "Caderno de erros"];

const questionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    concept: { type: "string" },
    prompt: { type: "string" },
    options: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: { text: { type: "string" }, explanation: { type: "string" } },
        required: ["text", "explanation"],
      },
    },
    correctIndex: { type: "integer", minimum: 0, maximum: 4 },
  },
  required: ["concept", "prompt", "options", "correctIndex"],
};

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    question: { anyOf: [questionSchema, { type: "null" }] },
    assessment: { type: "string", enum: ["none", "correct", "partial", "incorrect"] },
  },
  required: ["reply", "question", "assessment"],
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanStats(raw: any) {
  const allowed = new Set(["correct", "partial", "incorrect"]);
  const responses = Array.isArray(raw?.responses)
    ? raw.responses.slice(-18).flatMap((r: any) => {
      if (!r || !allowed.has(r.assessment) || !Number.isInteger(r.stageIndex) || r.stageIndex < 0 || r.stageIndex > 3) return [];
      return [{ concept: cleanString(r.concept, 100), assessment: r.assessment, stageIndex: r.stageIndex, confidence: ["certeza", "duvida", "chute"].includes(r.confidence) ? r.confidence : "certeza" }];
    })
    : [];
  return {
    total: responses.length,
    correct: responses.filter((r: any) => r.assessment === "correct").length,
    partial: responses.filter((r: any) => r.assessment === "partial").length,
    incorrect: responses.filter((r: any) => r.assessment === "incorrect").length,
    responses,
  };
}

function cleanHistory(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-10).flatMap((item: any) => {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") return [];
    return [{ role: item.role, content: item.content.slice(-4200) }];
  });
}

function instructionsFor(subject: string, topic: string, mode: string, stageIndex: number, stats: ReturnType<typeof cleanStats>, grade?: string) {
  const stage = stageTitles[stageIndex] || stageTitles[0];
  const weak = stats.responses.filter((r: any) => r.assessment !== "correct").map((r: any) => r.concept).filter(Boolean);
  const base = `Você é a Tutora de Estudos do projeto Missão Aprovação para o concurso histórico de Agente Municipal de Trânsito de Imperatriz–MA. Responda sempre em português brasileiro, com acolhimento, precisão e didática. Seu escopo é o edital 002/2019 e o tema selecionado: ${subject} — ${topic}.\n\nA prova de 2019 é apenas referência histórica. Leis e regras de trânsito podem ter mudado: diferencie claramente o que o edital de 2019 cobrava do texto legal vigente. Não invente artigos, prazos, competências, leis municipais, dados locais nem números de resoluções. Se não tiver segurança sobre o texto exato ou atualização, diga isso e indique a conferência em fonte oficial. Para as Leis 4.898/1965 e 13.869/2019, explique que a primeira foi revogada e não trate o texto histórico como vigente. Para CTB, incentive consulta à versão compilada oficial. Use exemplos ligados a uma agente municipal de trânsito e a Imperatriz quando forem pertinentes. Não peça nem revele dados pessoais.\n\nResponda com um objeto JSON estrito conforme o esquema: ` +
    `reply (texto em Markdown simples, seguro para exibição), question (objeto com pergunta de cinco opções e explicação de cada opção, ou null) e assessment. Não escreva cercas de código nem conteúdo fora do JSON. assessment deve ser none, salvo se o servidor avaliar uma resposta. Não repita a pergunta no texto reply quando ela estiver no campo question.\n\n`;
  const modes: Record<string, string> = {
    lesson: `Crie uma aula teórica completa, não apenas uma lista ou resumo curto. Estruture com título; objetivos de aprendizagem; pré-requisitos; explicação gradual dos conceitos centrais; definições; como cada parte funciona e se relaciona; exemplos resolvidos e aplicações; diferenças entre conceitos que a banca costuma confundir; exceções e limites; pegadinhas e palavras de comando (EXCETO, NÃO, SOMENTE, SEMPRE, PODERÁ, DEVERÁ); roteiro de raciocínio para questões; resumo final e um pequeno glossário. Para conteúdo jurídico, diferencie regra do edital histórico e regra vigente sem inventar atualização. Para Imperatriz, não fabrique fatos ou números. Escreva o suficiente para realmente ensinar a matéria e deixe questionamentos para depois; question:null.`,
    question: "Responda à dúvida do estudante com explicação completa, exemplos e relação com o edital. Se útil, corrija alguma ideia equivocada com cuidado. question:null.",
    simplify: "Reexplique o tema em linguagem simples sem perder precisão: comece por uma analogia concreta, apresente o conceito correto e termine com um exemplo curto. question:null.",
    example: "Dê um exemplo resolvido passo a passo, explique por que o raciocínio funciona e mostre uma possível pegadinha de prova. question:null.",
    summary: "Faça um resumo de revisão com conceitos-chave, diferenças que não podem ser confundidas, exceções importantes, palavras de prova e um macete de raciocínio. Não elimine ressalvas legais. question:null.",
    quiz_start: `Inicie uma avaliação adaptativa completa de 18 questões, uma por vez, em quatro etapas: Revisão ativa (4 questões), Teoria guiada (4), Treinamento (8) e Caderno de erros/Consolidação (2). Esta chamada pede somente a primeira questão da Etapa 1, ${stage}. Crie uma questão autoral de múltipla escolha com exatamente cinco alternativas plausíveis. O campo question deve guardar o conceito, enunciado, cinco textos de alternativa, a explicação individual de cada alternativa e o índice zero-based do gabarito. reply deve apenas acolher e orientar a resposta com a confiança (certeza, dúvida ou chute).`,
    quiz_continue: `Continue a avaliação de 18 questões. Estamos na etapa ${stage} (${stageIndex + 1}/4). Faça somente uma questão autoral de múltipla escolha, exatamente cinco alternativas, com explicação individual de cada opção e o índice zero-based do gabarito em question. Adapte o nível e priorize conceitos em que houve erro, dúvida ou chute: ${weak.join(", ") || "ainda sem erros registrados"}. Evite repetir literalmente questões anteriores. Em reply, faça uma transição curta e peça que o estudante marque sua confiança.`,
    quiz_answer: `O estudante respondeu uma questão da etapa ${stage}. A avaliação objetiva do servidor é ${grade}. Corrija a resposta com acolhimento, explique o conceito e o raciocínio correto e analise TODAS as cinco alternativas individualmente, incluindo a razão de cada distrator estar errado. Explique a pegadinha e atualize os números da aula: ${stats.correct} correta(s) com certeza, ${stats.partial} acerto(s) com dúvida/chute, ${stats.incorrect} erro(s), de ${stats.total} questão(ões). Adapte a questão seguinte aos erros/dúvidas registrados: ${weak.join(", ") || "nenhum até agora"}. Se for solicitada uma próxima questão no pedido do usuário, preencha question com uma nova questão; caso contrário, question:null e faça um breve fechamento da etapa sem inventar uma questão.`,
  };
  return base + (modes[mode] || modes.question);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) return json({ error: "Entre na sua conta para usar a tutora." }, 401);

  const rawBody = await req.text();
  if (rawBody.length > 64000) return json({ error: "A conversa enviada está grande demais. Inicie um novo tema e tente novamente." }, 413);
  let body: any;
  try { body = JSON.parse(rawBody); } catch { return json({ error: "Não consegui ler essa solicitação." }, 400); }

  const subject = cleanString(body.subject, 40);
  const topicId = cleanString(body.topicId, 80);
  const mode = cleanString(body.mode, 32);
  const topic = curriculum[subject]?.[topicId];
  const modes = new Set(["lesson", "question", "simplify", "example", "summary", "quiz_start", "quiz_continue", "quiz_answer"]);
  if (!topic || !modes.has(mode)) return json({ error: "Matéria ou módulo não reconhecido." }, 400);

  const prompt = cleanString(body.prompt, 2000);
  if (!prompt) return json({ error: "Escreva uma pergunta ou escolha uma ação de estudo." }, 400);
  const history = cleanHistory(body.history);
  const stageIndex = Number.isInteger(body.stageIndex) ? Math.max(0, Math.min(3, body.stageIndex)) : 0;
  const stats = cleanStats(body.stats);
  let effectiveStats = stats;
  let assessment = "none";
  let gradeContext = "";

  if (mode === "quiz_answer") {
    const q = body.activeQuestion;
    const selectedIndex = Number(body.selectedIndex);
    const confidence = cleanString(body.confidence, 20);
    if (!q || !Array.isArray(q.options) || q.options.length !== 5 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 4 || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 4 || !["certeza", "duvida", "chute"].includes(confidence)) return json({ error: "Não consegui conferir a resposta. Reabra a questão e tente novamente." }, 400);
    assessment = selectedIndex !== q.correctIndex ? "incorrect" : confidence === "certeza" ? "correct" : "partial";
    const qText = cleanString(q.prompt, 900);
    const concept = cleanString(q.concept, 100) || topic;
    effectiveStats = cleanStats({ responses: [...stats.responses, { concept, assessment, stageIndex, confidence }] });
    const options = q.options.map((o: any, i: number) => `${String.fromCharCode(65 + i)}: ${cleanString(o?.text, 500)} — ${cleanString(o?.explanation, 800)}`).join("\n");
    gradeContext = `\n\nDados da questão já aplicada (use apenas para corrigir, não para alterar o gabarito):\nEnunciado: ${qText}\nAlternativas e justificativas: \n${options}\nGabarito calculado: ${String.fromCharCode(65 + q.correctIndex)}\nResposta escolhida: ${String.fromCharCode(65 + selectedIndex)}; confiança: ${confidence}. Resultado: ${assessment}.\nProgresso após esta resposta: ${stats.correct + (assessment === "correct" ? 1 : 0)} acerto(s) seguros, ${stats.partial + (assessment === "partial" ? 1 : 0)} acerto(s) com dúvida/chute, ${stats.incorrect + (assessment === "incorrect" ? 1 : 0)} erro(s), de ${stats.total + 1}.`;
  }

  const stageSizes = [4, 4, 8, 2];
  const stageAnswered = stats.responses.filter((r: any) => r.stageIndex === stageIndex).length;
  const generateNext = mode === "quiz_start" || mode === "quiz_continue" || (mode === "quiz_answer" && body.generateNext === true && stageAnswered < stageSizes[stageIndex] - 1 && stats.total < 17);
  const learnerTurn = `Pedido atual: ${prompt}${gradeContext}\n\nEtapa atual: ${stageTitles[stageIndex]}. Histórico de desempenho validado: ${effectiveStats.correct} correta(s), ${effectiveStats.partial} parcial(is), ${effectiveStats.incorrect} errada(s), ${effectiveStats.total} respondida(s). Gere questão de continuação: ${generateNext ? "sim" : "não"}.`;

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "A tutora está instalada, mas falta configurar OPENAI_API_KEY nos segredos das Edge Functions do Supabase." }, 503);
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: instructionsFor(subject, topic, mode, stageIndex, effectiveStats, assessment) + gradeContext,
        input: [...history, { role: "user", content: learnerTurn }],
        text: { format: { type: "json_schema", name: "study_tutor_turn", strict: true, schema: outputSchema } },
        max_output_tokens: mode === "lesson" ? 3600 : 2200,
        store: false,
      }),
    });
  } catch {
    return json({ error: "O serviço de IA não respondeu. Confira sua conexão e tente novamente." }, 502);
  }
  if (!response.ok) {
    console.error("OpenAI Responses API status:", response.status);
    return json({ error: response.status === 401 ? "A chave da IA configurada no Supabase não foi aceita." : "A IA não conseguiu responder agora. Tente novamente em instantes." }, response.status === 429 ? 429 : 502);
  }

  let data: any;
  try { data = await response.json(); } catch { return json({ error: "A resposta da tutora veio incompleta. Tente novamente." }, 502); }
  const outputText = typeof data.output_text === "string" ? data.output_text : (data.output || []).flatMap((item: any) => item.content || []).find((part: any) => part.type === "output_text")?.text;
  let answer: any;
  try { answer = JSON.parse(outputText || ""); } catch { return json({ error: "Não consegui formatar a resposta da tutora. Tente mais uma vez." }, 502); }
  let question = answer.question && typeof answer.question === "object" && Array.isArray(answer.question.options) && answer.question.options.length === 5 ? answer.question : null;
  if (!generateNext) question = null;
  return json({ reply: cleanString(answer.reply, mode === "lesson" ? 15000 : 9000) || "Não consegui montar a resposta agora.", question, assessment });
});

