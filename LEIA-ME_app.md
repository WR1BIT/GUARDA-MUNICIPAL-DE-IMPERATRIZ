# Missão Aprovação — Agente Municipal de Trânsito

## Abrir o app

Abra `index.html` em um navegador moderno. Não há instalação de dependências. O modo local funciona sem entrar em uma conta e salva o progresso neste navegador.

## Rotina do estudo

- O app mantém o horário diário das **20h às 21h** e a ordem semanal do guia e do calendário: CTB na segunda e quarta, Português na terça, Informática na quinta, Direito na sexta, Imperatriz no sábado e simulado/revisão no domingo.
- A trilha tem 12 semanas e distribui os tópicos descritos no guia. Ela é uma organização sugerida; não altera o cronograma `.ics`.
- A sessão completa usa o ciclo **10–20–20–10**. Uma missão de dois minutos com uma questão também conta como atividade.
- A **Sala de Estudos** conduz uma aula individual em quatro etapas: revisão ativa (4 questões), teoria guiada (4), treinamento (8) e consolidação (2). A primeira aula disponível é Informática · Semana 1.
- Na Sala, responda uma questão por vez e marque sua confiança (certeza, dúvida ou chute). O app mostra a justificativa e explica cada uma das cinco alternativas; ao concluir, apresenta acertos por etapa, diagnóstico por assunto e prioridades para o caderno de erros.
- O treino e a consolidação adaptam a ordem das questões aos erros e às respostas inseguras das etapas anteriores, retomando temas relacionados primeiro.
- Respostas erradas ou corretas com dúvida/chute são agendadas para D+1. Ao acertar a revisão, ela avança para D+3 e depois D+7; errar novamente traz a retomada para D+1. Fechar a aula no meio não apaga o andamento.
- A ofensiva é flexível: o painel conta dias praticados, pausas não removem XP e não zeram progresso.
- Questões erradas entram na fila de revisão em 1, 3 e 7 dias. Questões certas podem ser marcadas para revisão quando houve dúvida ou chute.
- Cada tentativa recebe feedback imediato. O painel acompanha XP, níveis, conquistas, acertos por matéria e simulados; a meta de 85% é pessoal, não uma nota de corte.

## Tutora IA e teoria completa

Na aba **Tutora**, selecione uma das quatro matérias e um módulo do edital. **Aula completa** pede explicação gradual, objetivos, conceitos, exemplos resolvidos, diferenças entre temas próximos, exceções, pegadinhas, estratégia para a prova, resumo e glossário. Também é possível fazer perguntas de acompanhamento, simplificar, pedir exemplos e gerar resumos.

O botão **Me teste** conduz uma avaliação adaptativa de 18 questões, uma por vez: revisão ativa (4), teoria guiada (4), treinamento (8) e consolidação/caderno de erros (2). Antes de confirmar a alternativa, marque certeza, dúvida ou chute. A tutora explica todas as cinco opções, atualiza os acertos, mantém dúvidas/chutes separados e prioriza os temas mais difíceis nas etapas seguintes. As questões de IA também concedem XP; pausas não reduzem pontos.

### Ativar a Tutora

O HTML não contém nem recebe uma chave de IA. A chamada passa pela Edge Function `study-tutor` no Supabase, configurada para exigir um token de usuário Supabase válido.

1. Publique no projeto Supabase conectado os arquivos `supabase/functions/study-tutor/index.ts` e `deno.json` deste repositório, com verificação JWT ligada.
2. No painel do Supabase, adicione o segredo `OPENAI_API_KEY` em **Edge Functions → Secrets**. Nunca coloque essa chave no HTML, no GitHub ou no chat.
3. Opcional: defina `OPENAI_MODEL`. Sem essa variável, a função usa `gpt-6-luna`.
4. Abra **Nuvem**, entre com sua conta Supabase e volte à aba **Tutora**.

O projeto Supabase conectado pode receber a função diretamente pelo fluxo de publicação do projeto. Se o segredo ainda não estiver definido, a tela mostrará a configuração que falta. O provedor de IA é a API da OpenAI; a cobrança de API é separada do plano ChatGPT e depende do volume de uso e do modelo. Consulte os [preços da API](https://openai.com/api/pricing/) antes de habilitar a chave.

As mensagens e diagnósticos da Tutora ficam no armazenamento local deste navegador, separados por usuário. Eles **não** entram no envio manual da tabela de progresso do Supabase e não migram automaticamente para outro aparelho. As mensagens são transmitidas à API da OpenAI para gerar respostas; não envie senhas ou informações pessoais sensíveis. A função envia solicitações com `store:false`.

O conteúdo da tutora parte dos módulos do Edital 002/2019 e do guia do projeto, mas não faz busca automática no texto integral de leis ou em notícias atuais. Para leis, resoluções, dados municipais e regras que possam ter mudado, confira a fonte oficial indicada na explicação. O edital e os pesos são históricos.

O plano adaptativo da tutora revisita erros durante as etapas e recomenda retomadas em 1, 3 e 7 dias. A fila automática da aba **Revisões** segue vinculada às questões tradicionais do app.

## Pesos históricos e questões

O simulado incluído tem 20 questões, na proporção do Edital 002/2019: **10 específicas, 5 de Português, 3 de Informática e 2 de História/Geografia de Imperatriz**. São questões autorais para treino, com cinco alternativas e comentários.

O pacote local contém gabaritos e julgamento de recursos, mas não o caderno completo da prova. Por isso, o app não apresenta essas questões como itens oficiais da FSADU nem tenta reconstruir o simulado histórico de 60 questões. A prova futura pode ter outro formato.

## Salvar na nuvem

O app já aponta para o projeto Supabase conectado e usa a tabela existente `public.missao_aprovacao_historico`. A tabela tem uma linha por usuário, `payload` JSONB, RLS ativa, permissões restritas ao papel `authenticated` e políticas que vinculam leitura, inserção e atualização a `auth.uid() = user_id`.

O envio é manual. Entre ou crie uma conta na seção **Nuvem** e escolha **Salvar este aparelho na nuvem**. Para recuperar um progresso, escolha **Carregar cópia da nuvem**. Se houver versões locais e remotas, o app apresenta as duas opções e não mescla nem sobrescreve antes da escolha.

O app não faz alterações no banco, não usa chave de serviço e não envia o progresso em segundo plano. A chave publicável fica no HTML; ela não concede acesso à linha sem uma sessão autenticada e as políticas RLS.

### O que pode exigir configuração

- O provedor de e-mail/senha precisa estar habilitado no Supabase Auth. Se a confirmação de e-mail estiver ativa, confirme o endereço antes de entrar.
- Para concluir a confirmação voltando diretamente ao app, configure a URL onde ele será servido em **Authentication → URL Configuration → Redirect URLs**. O app pode ser usado localmente enquanto isso é configurado.

## Fontes

- Guia e cronograma fornecidos em `sources/` (mantidos sem alterações).
- CTB compilado: [Legislação Federal do Senado](https://legis.senado.leg.br/norma/551379/publicacao/34619690).
- História de Imperatriz: [Prefeitura Municipal de Imperatriz](https://novo.imperatriz.ma.gov.br/portal/imperatriz/historia.html).
- Estrutura histórica do concurso e pesos: Edital 002/2019 indicado no guia; não é previsão de um próximo edital.

