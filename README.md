# Missão Aprovação — Agente Municipal de Trânsito

App de preparação para o concurso histórico de Agente Municipal de Trânsito de Imperatriz–MA.

## Usar

Abra `index.html` em um navegador moderno. O estudo tradicional funciona sem instalação e salva o progresso neste aparelho. A Tutora IA precisa de login Supabase e da função de servidor configurada; consulte [LEIA-ME_app.md](LEIA-ME_app.md).

## Inclui

- Trilha sugerida de 12 semanas com rotina diária das 20h às 21h.
- Missões curtas, XP, níveis, conquistas e pausas sem punição.
- Sala de Estudos guiada e questões com feedback imediato.
- **Tutora IA** com aulas teóricas completas e dúvidas por tema nas quatro disciplinas do edital.
- Avaliação adaptativa de 18 questões, uma por vez, em quatro etapas; corrige todas as alternativas e distingue acertos seguros, acertos com dúvida e erros.
- Revisões espaçadas 1–3–7, simulados e painel de evolução com meta pessoal de 85%.
- Simulado autoral nos pesos históricos 10/5/3/2 do concurso de 2019.

O conteúdo e os pesos são uma referência ao Edital 002/2019; não representam um próximo edital. A tutora sinaliza a necessidade de confirmar legislação e dados locais em fontes oficiais.

## Configurar a Tutora IA

1. A função `supabase/functions/study-tutor` deve estar publicada no projeto Supabase conectado.
2. Cadastre `OPENAI_API_KEY` nos segredos das Edge Functions do Supabase. Opcionalmente, configure `OPENAI_MODEL`; o padrão é `gpt-6-luna`.
3. Entre na seção **Nuvem** do app para autenticar. A Tutora exige sessão autenticada.

A chave fica no servidor, nunca no HTML. A conversa é guardada localmente por usuário e não é incluída na sincronização manual do progresso. As mensagens são enviadas ao serviço da OpenAI para gerar as aulas. O uso da API é cobrado separadamente da assinatura do ChatGPT.

Consulte [LEIA-ME_app.md](LEIA-ME_app.md) para passos e limites.

