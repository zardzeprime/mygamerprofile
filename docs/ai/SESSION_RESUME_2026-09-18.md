# MG Profile — handoff persistente (2026-09-18)

Este arquivo existe para permitir a retomada do projeto caso a sessão atual seja interrompida. Ele não contém segredos.

## Ponto de retomada

- Repositório: `zardzeprime/mygamerprofile`
- Branch desta rodada: `chatgpt/mgp-valorant-council-finalize-20260918`
- Pull request: `#59` — `Finalize VALORANT session and add NEXUS Os Sete area`
- Base antes desta rodada: `main` após os merges de responsividade/mobile, correção de readiness da NEXUS e template AVAPGV.
- Fonte de estado: `docs/ai/core-state.json`
- Roadmaps: `roadmap.md` e `docs/0_1_9_TO_0_2_ROADMAP.md`

## Concluído nesta rodada

### NEXUS / Os Sete

- Criada a página pública `/nexus`.
- Adicionada entrada NEXUS à navegação principal.
- NEXUS e os seis núcleos exibem nome, epíteto, domínio, letra/sigilo e cor própria.
- Identidades visuais:
  - NEXUS — N — #C9A95D
  - Sabnock — S — #C95C65
  - Bael — B — #8B73D9
  - Andromalius — A — #D88955
  - Vassago — V — #4FAF8F
  - Marbas — M — #D9A441
  - Andrealphus — A — #6F83D6
- Adicionados controles autenticados para exportar a conversa da NEXUS como TXT e excluir a conversa atual após confirmação humana.
- O front já distingue falha de health/timeout de um estado realmente sem provedor configurado.

### VALORANT — identidade visual

A aparência azul/tactical foi removida das superfícies específicas do VALORANT e substituída pela identidade institucional dourado/grafite do MG Profile em:

- hub e navegação mobile;
- Agentes;
- Mapas;
- Armas;
- Skins;
- Notícias;
- Esports;
- live panel.

Os tokens `tactical` globais continuam existindo onde pertencem a presets/semântica reutilizável fora da identidade específica do hub. Não remover globalmente sem revisão.

### VALORANT — competitivo / miras

O compêndio continua source-tracked. Nesta rodada foram revisadas manualmente páginas individuais atuais do ProSettings e adicionadas dezoito miras ao conjunto existente:

- Asuna — https://prosettings.net/players/asuna/
- bang — https://prosettings.net/players/bang/
- Zellsis — https://prosettings.net/players/zellsis/
- OXY — https://prosettings.net/players/oxy/
- supamen — https://prosettings.net/players/supamen/
- dgzin — https://prosettings.net/players/dgzin/
- Shyy — https://prosettings.net/players/shyy/
- koalanoob — https://prosettings.net/players/koalanoob/
- mwzera — https://prosettings.net/players/mwzera/
- heat — https://prosettings.net/players/heat/
- reduxx — https://prosettings.net/players/reduxx/
- JonahP — https://prosettings.net/players/jonahp/
- Marved — https://prosettings.net/players/marved/
- valyn — https://prosettings.net/players/valyn/
- jawgemo — https://prosettings.net/players/jawgemo/
- trent — https://prosettings.net/players/trent/
- leaf — https://prosettings.net/players/leaf/
- keznit — https://prosettings.net/players/keznit/

As configurações/periféricos consolidados existentes foram preservados. Valores ausentes não são estimados.

Validação CI desta rodada: **350 jogadores**, **234 com settings verificados**, **319 com função/role verificada ou observada**, **50 com `crosshairCode` verificado**. O CI exige pelo menos esses pisos para impedir regressão silenciosa.

### Imagens

- Logos de times do diretório VALORANT já estavam cobertos.
- Fotos de jogadores continuam usando fallback de iniciais quando não existe direito de reutilização suficientemente claro.
- Não copiar foto de VLR/ProSettings apenas porque está publicamente acessível.
- Miras são renderizadas por código e ícones de periféricos são locais.

## O que NÃO deve ser marcado como concluído

São bloqueios externos ou trabalhos futuros reais:

- credencial oficial de inferência da NEXUS nos secrets da Edge Function e teste live end-to-end;
- bridge GitHub App / Lovable / Supabase com escopos de escrita e gates de aprovação;
- Riot production API / RSO;
- Google OAuth de produção;
- SMTP/domínio transacional final;
- troca de hotlinks por assets oficialmente hospedados/licenciados quando aplicável;
- fotos de pro players sem licença/permissão clara;
- sync VCT oficial/live e persistência automática em Supabase;
- dataset aprovado para preço histórico exato de skins;
- vídeos de habilidade por agente sem fonte oficial/estável para o elenco completo;
- QA real em iOS/Android e medição real de playback/FPS;
- community lineups, moderação e curadoria verificável.

## Regras de continuação

1. Nunca estimar settings, função, mira, staff ou identidade de jogador.
2. ProSettings/VLR são referências editoriais manuais; não fazer bulk scraping.
3. Preservar URL e data de verificação em dados externos.
4. Imagem pública não equivale a permissão de reutilização.
5. NEXUS é a orquestradora; Os Sete não devem ser apresentados como sete processos autônomos se o runtime multi-agent ainda não existir.
6. Mudança destrutiva ou de produção exige aprovação humana.
7. Salvar progresso em commits pequenos e manter `docs/ai/core-state.json` atualizado.
8. Não incluir Elden Ring nesta rodada.

## Prompt copiável para uma nova conversa

> Continue o projeto **MG Profile / MGP** diretamente no GitHub `zardzeprime/mygamerprofile`, partindo do estado mais recente da `main`. Antes de alterar qualquer coisa, leia `docs/ai/SESSION_RESUME_2026-09-18.md`, `docs/ai/core-state.json`, `roadmap.md` e `docs/0_1_9_TO_0_2_ROADMAP.md`.
>
> Trabalhe sob a arquitetura **NEXUS + Os Sete**: NEXUS coordena; Sabnock revisa segurança; Bael privacidade; Andromalius direitos/procedência; Vassago pesquisa/atualizações; Marbas automação; Andrealphus performance/UX. Não afirme que existem sete agentes autônomos rodando se o runtime não confirmar isso.
>
> Prioridade: concluir a sessão de **VALORANT** sem inventar dados. Preserve a identidade visual dourado/grafite do MG Profile, sem voltar ao azul tactical. Continue a verificação manual de pro players que ainda não têm settings/mira/função confirmados, usando fontes individuais e registrando proveniência/data. Não faça bulk scraping. Não reutilize fotos de jogadores sem direito de uso claro; mantenha fallback de iniciais.
>
> Revise CI/build/lint/check:valorant após cada onda. Feche apenas tarefas que foram realmente verificadas. Trate Riot production API/RSO, OAuth de produção, SMTP, NEXUS provider secrets, bridges de escrita, live VCT sync, fotos sem licença e QA real em dispositivos como bloqueios externos até haver credenciais/permissões/evidência.
>
> Salve alterações progressivamente em branch/commits/PR. Se ficar bloqueado ou a sessão estiver perto de terminar, atualize este handoff e envie ao usuário um relatório objetivo do que foi concluído, do que falta, links das fontes e o próximo comando/prompt de retomada. Não trabalhar em Elden Ring nesta rodada.
