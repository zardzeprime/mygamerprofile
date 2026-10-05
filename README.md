# MGP

# MGP — MY GAMER PROFILE

## BUILD DIRETO — VERSÃO 0.1

Execute esta especificação diretamente.

**NÃO entre em Plan Mode.**
**NÃO produza apenas um plano.**
**NÃO pare para me pedir aprovação da arquitetura.**

Implemente a aplicação descrita abaixo como a primeira versão funcional do MGP.

Só interrompa caso exista alguma ação que necessariamente dependa de mim, como autorizar/conectar um projeto Supabase. Nesse caso, solicite apenas essa ação específica e preserve todo o restante da especificação para continuar depois da autorização.

---

# 1. VISÃO DO PRODUTO

O nome provisório do projeto é:

**MGP — My Gamer Profile**

O MGP é uma plataforma social de identidade gamer.

Ele NÃO é apenas um tracker competitivo.

O objetivo é permitir que cada jogador construa uma identidade central contendo:

* perfil público;
* jogos;
* Game Profiles;
* conquistas;
* preferências pessoais;
* histórico gamer;
* comunidades;
* posts;
* comentários;
* interações;
* pessoas seguidas;
* LFG;
* dados declarados pelo jogador;
* futuramente dados verificados por APIs externas.

O principal conceito é:

> **O perfil é o produto.**

O usuário deve sentir que está construindo uma representação da própria vida nos videogames.

A identidade do MGP deve transmitir também:

* conquista;
* progressão;
* prestígio;
* coleção;
* pertencimento à cultura gamer.

---

# 2. OBJETIVO DESTA V0.1

Esta versão deve ser uma aplicação funcional e navegável.

Implementar nesta versão:

* frontend;
* backend;
* banco de dados;
* autenticação;
* perfis;
* catálogo inicial de jogos;
* Game Hubs;
* Game Profiles;
* follow;
* posts;
* comentários;
* reactions;
* LFG;
* reports;
* upload básico de avatar/banner/imagem;
* português e inglês;
* configurações básicas;
* Light Mode;
* Dark Mode;
* segurança e RLS.

NÃO implementar ainda:

* Steam API real;
* Riot API real;
* scraping;
* chat privado;
* upload de vídeo;
* marketplace;
* pagamentos;
* badges complexos;
* monetização;
* IA de moderação;
* tradução automática de posts;
* mods;
* modpacks;
* servidores Minecraft;
* feed algorítmico;
* aplicativo mobile nativo.

---

# 3. STACK

Utilize a stack web padrão atual do projeto Lovable.

Manter obrigatoriamente:

* React;
* TypeScript;
* Tailwind CSS;
* componentes reutilizáveis;
* arquitetura moderna;
* responsividade.

Não trocar framework ou adicionar dependências grandes sem necessidade.

## Backend

Utilizar **Supabase**.

O Supabase deverá ser um projeto controlado pelo proprietário do MGP.

Utilizar:

* PostgreSQL;
* Supabase Auth;
* Supabase Storage;
* Row Level Security;
* server-side/Edge Functions somente quando realmente necessárias.

NÃO utilizar API keys privadas no frontend.

NÃO expor `service_role`.

NÃO utilizar Lovable Cloud como substituto silencioso caso o projeto tenha sido especificado para Supabase.

Caso ainda não exista conexão com Supabase e seja necessária autorização manual, solicitar a conexão.

---

# 4. IDENTIDADE VISUAL DA MARCA

A identidade principal do MGP será baseada em:

**Dourado + tons neutros sofisticados.**

O dourado é a cor institucional principal da plataforma.

Ele deve representar:

* conquista;
* prestígio;
* progressão;
* identidade;
* raridade;
* destaque.

O MGP NÃO deve utilizar vermelho como cor institucional principal.

Vermelho continuará disponível como cor funcional para:

* erros;
* perigo;
* denúncias;
* ações destrutivas;
* alertas críticos.

---

# 5. PALETA VISUAL

Utilize tokens semânticos.

Não espalhe hexadecimal diretamente em dezenas de componentes.

A seguinte paleta serve como DIREÇÃO INICIAL e pode ser refinada para contraste e acessibilidade:

## Gold

Primary Gold:

`#D4A72C`

Highlight Gold:

`#E4BC4C`

Dark Gold:

`#9B7418`

Essas cores são orientativas.

Se ajustes sutis forem necessários para WCAG/contraste, mantenha a identidade dourada.

---

# 6. DARK MODE

Dark Mode será uma das experiências principais da plataforma.

Base conceitual:

Background:

`#0D0F12`

Surface:

`#15181D`

Elevated Surface:

`#1D2127`

Foreground:

tons próximos ao branco.

Accent:

Gold.

Evitar preto absoluto em todas as superfícies.

Criar profundidade através de:

* contraste entre superfícies;
* bordas discretas;
* shadows suaves;
* highlights;
* transparências controladas.

O Dark Mode deverá parecer premium e confortável para uso prolongado.

---

# 7. LIGHT MODE

Light Mode é OBRIGATÓRIO nesta versão.

Base conceitual:

Background:

`#F6F5F1`

Surface:

`#FFFFFF`

Foreground:

`#17191D`

Accent:

Gold mais escuro quando necessário para contraste.

O Light Mode NÃO deverá ser simplesmente o Dark Mode com cores invertidas.

Ele precisa ser visualmente refinado e totalmente utilizável.

Garantir contraste adequado principalmente para:

* textos;
* botões dourados;
* links;
* badges;
* inputs;
* borders.

---

# 8. THEME SWITCHER

Implementar seletor:

* Light;
* Dark;
* System.

Default recomendado:

`System`

Persistir preferência localmente.

Para usuário autenticado, preparar estrutura para persistir preferência também no perfil.

Evitar flash visual incorreto ao carregar a página.

Se tecnicamente possível, aplicar o tema correto antes da primeira renderização visível.

---

# 9. LOGO E MARCA

Ainda NÃO existe arquivo oficial de logo.

Portanto não inventar uma logo definitiva complexa.

Criar temporariamente uma representação textual elegante:

**MGP**

e quando necessário:

**My Gamer Profile**

A arquitetura do header deverá permitir substituir facilmente esse placeholder por uma logo real enviada posteriormente.

## Conceito da futura logo

A futura logo terá aproximadamente esta ideia:

* símbolo de perfil/usuário;
* headset gamer incorporado;
* círculo dourado ao redor;
* elemento central branco ou neutro;
* possibilidade de o círculo possuir uma abertura sutil, criando personalidade própria;
* potencial de sugerir discretamente a letra "G" ou a identidade MGP.

O símbolo deverá funcionar sozinho em tamanhos pequenos.

Exemplo de uso futuro:

símbolo + `MGP`

e opcionalmente:

`MY GAMER PROFILE`

NÃO tente desenhar uma logo definitiva agora utilizando CSS complexo.

Utilize placeholder substituível.

---

# 10. PERSONALIDADE DA MARCA

O MGP deve parecer:

* gamer;
* social;
* premium;
* moderno;
* limpo;
* visual;
* personalizável;
* confiável.

NÃO deve parecer:

* Steam clone;
* Discord clone;
* Tracker.gg clone;
* cassino;
* site de apostas;
* dashboard empresarial;
* template SaaS genérico;
* site de criptomoeda.

Evitar excesso de:

* neon;
* glow;
* gradients coloridos sem propósito;
* glassmorphism em tudo;
* animações exageradas.

O dourado deverá ser utilizado com controle.

Não transformar toda a aplicação em amarelo.

---

# 11. TIPOGRAFIA

Utilizar tipografia moderna e legível.

Hierarquia:

* display;
* page title;
* section title;
* card title;
* body;
* metadata;
* caption.

Evitar fontes exageradamente futuristas.

A tipografia deve funcionar igualmente bem em:

* português;
* inglês;
* desktop;
* mobile.

---

# 12. INTERNACIONALIZAÇÃO

Implementar i18n desde agora.

Idiomas:

* `pt-BR`
* `en`

Idioma padrão:

`pt-BR`

O usuário deverá poder trocar de idioma.

Persistência:

* antes de login: localStorage/cookie apropriado;
* depois de login: preferência salva também no perfil.

Na autenticação, se existir preferência salva na conta, ela deve prevalecer adequadamente.

Utilizar chaves de tradução.

Exemplos:

`navigation.home`

`navigation.games`

`navigation.communities`

`navigation.lfg`

`profile.follow`

`profile.followers`

`profile.games`

`games.hoursPlayed`

`settings.language`

`settings.theme`

Não duplicar páginas inteiras para cada idioma.

Conteúdo criado por usuários não deve ser traduzido automaticamente.

---

# 13. ROTAS PRINCIPAIS

Implementar pelo menos:

`/`

Home.

`/login`

Login.

`/register`

Cadastro.

`/forgot-password`

Recuperação de senha.

`/games`

Catálogo.

`/games/:slug`

Game Hub.

`/u/:username`

Perfil público.

`/u/:username/games/:slug`

Game Profile público.

`/lfg`

LFG global.

`/settings/profile`

Editar perfil.

`/settings/account`

Conta/configurações.

`/settings/appearance`

Idioma/tema/aparência.

`/admin/reports`

Fila simples de denúncias para administradores.

Utilize a convenção de rotas apropriada da stack existente.

---

# 14. AUTENTICAÇÃO

Implementar Supabase Auth.

Inicialmente:

* e-mail;
* senha.

Implementar:

* cadastro;
* login;
* logout;
* sessão persistente;
* recuperação de senha;
* tratamento apropriado de sessão expirada;
* estados de loading;
* mensagens de erro amigáveis.

Não implementar Google nesta versão.

Nunca armazenar senha manualmente no banco.

---

# 15. USERNAME

Todo usuário precisa possuir username único.

Regras iniciais:

* 3 a 20 caracteres;
* letras minúsculas;
* números;
* underscore;
* sem espaços.

Exemplo:

`zardze`

URL:

`/u/zardze`

O identificador interno do usuário deve continuar sendo UUID.

**Nunca utilizar username como chave primária.**

Username deve possuir unicidade case-insensitive.

Display name é separado do username e pode possuir caracteres especiais e espaços.

---

# 16. BANCO DE DADOS

Crie migrations claras e organizadas.

Evite uma migration gigantesca e confusa quando uma divisão lógica fizer sentido.

Crie as entidades abaixo.

---

## profiles

Relacionamento 1:1 com `auth.users`.

Campos conceituais:

* id UUID PK, correspondente a auth user;
* username;
* display_name;
* bio;
* avatar_url;
* banner_url;
* language;
* theme_preference;
* visibility;
* role;
* created_at;
* updated_at.

`theme_preference`:

* light;
* dark;
* system.

Valores de `role` inicialmente:

* user;
* admin.

Default:

`user`

O usuário NÃO pode elevar o próprio role pelo frontend.

Visibilidade inicial:

`public`

Preparar enum/modelo para:

* public;
* private.

A implementação completa de perfil privado pode ser simplificada nesta versão, mas o modelo precisa ser compatível.

---

## games

Campos:

* id;
* slug;
* name;
* description;
* genre;
* platforms;
* age_rating;
* theme_key;
* active;
* created_at.

Cadastrar inicialmente apenas:

* Dark Souls Remastered;
* Valorant.

Esses registros são catálogo oficial do MGP.

Usuários comuns NÃO podem criar jogos.

---

## game_modules

Relaciona um jogo aos módulos ativos.

Campos:

* id;
* game_id;
* module_key;
* enabled;
* sort_order.

Dark Souls Remastered:

* overview;
* community;
* builds;
* bosses;
* guides;
* lfg.

Valorant:

* overview;
* community;
* agents;
* competitive;
* guides;
* clips;
* lfg.

Nem todos os módulos precisam possuir funcionalidade completa nesta versão.

---

## game_profiles

Campos:

* id;
* user_id;
* game_id;
* profile_data JSONB;
* visibility;
* created_at;
* updated_at.

Constraint:

um único Game Profile por usuário/jogo.

Os dados declarados pelo jogador ficarão em JSONB validado por schemas TypeScript/Zod também no lado apropriado.

Não confiar somente em validação client-side.

---

# 17. GAME PROFILE SCHEMAS

Criar configuração modular por jogo.

## Dark Souls Remastered

Campos manuais:

* favorite_weapon;
* favorite_build;
* favorite_boss;
* hardest_boss;
* starting_class;
* runs_count;
* highest_ng;
* personal_notes.

Marcar esses dados visualmente como:

**Informado pelo jogador**

ou equivalente traduzido.

## Valorant

Campos manuais:

* favorite_agent;
* preferred_role;
* favorite_map;
* favorite_weapon;
* current_rank_manual;
* peak_rank_manual;
* personal_notes.

Rank manual NÃO deve possuir selo de verificado.

Mostrar claramente:

**Informado pelo jogador**

Dados reais Riot serão implementados posteriormente.

---

# 18. PROCEDÊNCIA DE DADOS

Criar conceito reutilizável:

`verified`

`player_provided`

`mock`

`unavailable`

Criar componente visual:

`DataSourceIndicator`

Na aplicação real da v0.1, Game Profile manual usa:

`player_provided`

Dados de demonstração só podem usar:

`mock`

Nunca mostrar mock como dado real/verificado.

---

# 19. FOLLOWS

Criar tabela:

`follows`

Campos:

* follower_id;
* following_id;
* created_at.

Constraint para impedir duplicação.

Usuário não pode seguir a si mesmo.

Implementar:

* Follow;
* Unfollow;
* contagem followers;
* contagem following.

Botões devem atualizar corretamente.

---

# 20. POSTS

Criar tabela:

`posts`

Campos:

* id;
* author_id;
* game_id nullable;
* body;
* image_url nullable;
* created_at;
* updated_at;
* deleted_at nullable.

Um post pode ser:

* geral;
* associado a um Game Hub.

Limitar corpo para um tamanho razoável, por exemplo 2.000 caracteres.

Renderizar conteúdo de usuário como texto seguro.

NÃO permitir HTML arbitrário.

Implementar:

* criação;
* visualização;
* edição pelo autor;
* exclusão/soft delete pelo autor;
* paginação ou carregamento incremental básico.

---

# 21. COMMENTS

Tabela:

`comments`

Campos:

* id;
* post_id;
* author_id;
* body;
* created_at;
* updated_at;
* deleted_at nullable.

Implementar:

* criar;
* editar próprio comentário;
* excluir próprio comentário.

Não implementar threads infinitamente aninhadas.

Comentários de primeiro nível são suficientes.

---

# 22. REACTIONS

MVP simples.

Tabela:

`reactions`

Campos:

* user_id;
* post_id;
* reaction_type;
* created_at.

Nesta versão utilizar apenas:

`like`

Preparar estrutura para novos tipos futuramente.

Impedir múltiplos likes idênticos do mesmo usuário no mesmo post.

Implementar Like/Unlike.

---

# 23. LFG

Criar tabela:

`lfg_posts`

Campos:

* id;
* user_id;
* game_id;
* platform;
* region;
* language;
* mode;
* description;
* mic_required;
* slots_total;
* slots_open;
* status;
* expires_at;
* created_at;
* updated_at.

Status:

* open;
* closed;
* expired.

Implementar criação e visualização de LFG.

Página global:

`/lfg`

Filtros básicos:

* jogo;
* plataforma;
* idioma;
* status.

Dentro do Game Hub, mostrar LFG daquele jogo.

Usuário pode:

* criar;
* editar próprio LFG;
* encerrar próprio LFG.

Não implementar chat interno ainda.

A ação principal pode direcionar para o perfil do criador.

---

# 24. REPORTS

Criar tabela:

`reports`

Campos:

* id;
* reporter_id;
* target_type;
* target_id;
* reason;
* details;
* status;
* created_at;
* reviewed_at;
* reviewed_by nullable.

Tipos iniciais:

* profile;
* post;
* comment;
* lfg.

Reasons podem incluir:

* spam;
* harassment;
* hate;
* sexual_content;
* extreme_violence;
* scam;
* other.

Status:

* pending;
* reviewing;
* resolved;
* rejected.

Usuário comum pode criar report.

Usuário comum NÃO pode visualizar denúncias feitas por outros.

Administrador pode visualizar a fila.

---

# 25. ADMIN

Utilizar `profiles.role`.

Rota:

`/admin/reports`

Somente admin.

A proteção deve existir no backend/RLS, não apenas escondendo o menu.

Administrador poderá:

* visualizar reports;
* alterar status;
* registrar `reviewed_by`;
* registrar `reviewed_at`.

Não criar painel administrativo gigantesco.

Apenas reports nesta versão.

Não disponibilizar na interface pública nenhuma forma do usuário transformar a si próprio em admin.

---

# 26. RLS — OBRIGATÓRIO

Ativar Row Level Security em todas as tabelas relevantes.

Princípio:

**default deny**

Depois criar explicitamente as policies necessárias.

### profiles

Leitura pública quando perfil público.

Usuário pode editar somente próprio perfil.

Role não pode ser alterado pelo próprio usuário através de update comum.

### game_profiles

Leitura pública quando permitido.

Insert/update/delete somente pelo dono.

### games

Leitura pública.

Escrita apenas administrativa/service-side.

### game_modules

Leitura pública.

Escrita apenas administrativa.

### follows

Leitura permitida conforme necessário para o produto.

Insert/delete somente quando `follower_id = auth.uid()`.

### posts

Posts ativos públicos podem ser lidos.

Autor pode inserir.

Autor pode editar/excluir apenas o próprio.

### comments

Mesmo princípio.

### reactions

Usuário só cria/remove reação própria.

### lfg_posts

Leitura pública para posts válidos.

Criador controla apenas os próprios.

### reports

Usuário autenticado pode criar.

Reporter pode visualizar somente o próprio report se necessário.

Admins podem visualizar e atualizar todos.

---

# 27. PROTEÇÃO CONTRA IDOR

Nunca confiar em:

`user_id`

enviado pelo browser para autorizar operação.

Utilizar:

`auth.uid()`

e RLS.

Alterar URL ou payload não pode permitir que User A:

* edite perfil B;
* edite post B;
* exclua comentário B;
* altere LFG B;
* acesse informações administrativas.

---

# 28. STORAGE

Criar buckets/estrutura apropriada para:

* avatars;
* banners;
* post-images.

Validar:

* usuário;
* tipo;
* MIME;
* tamanho.

Limites sugeridos:

Avatar:

5 MB.

Banner:

8 MB.

Post image:

10 MB.

Formatos permitidos inicialmente:

* JPEG;
* PNG;
* WebP;
* GIF somente se a implementação for segura e apropriada.

Não permitir executáveis.

Não confiar apenas na extensão.

Nome/caminho do arquivo deve evitar colisões.

Usuário só pode alterar arquivos associados ao próprio conteúdo.

---

# 29. HOME

A Home deve parecer uma plataforma real, não uma landing page corporativa enorme.

Hero simples:

**Sua identidade nos jogos.**

Em inglês:

**Your identity across games.**

CTA para não autenticado:

* Criar perfil;
* Entrar;
* Explorar jogos.

Para autenticado:

* Ver meu perfil;
* Explorar jogos;
* Criar post.

Criar seções:

### Jogos em destaque

* Dark Souls Remastered;
* Valorant.

### Atividade da comunidade

Mostrar posts reais recentes quando existirem.

Se estiver vazio, utilizar Empty State elegante.

Não inserir falsos usuários reais no banco apenas para preencher a tela.

### Descubra o MGP

Explicação curta sobre:

* Game Profiles;
* comunidades;
* LFG.

A Home deve fazer o usuário entender rapidamente que MGP é uma identidade gamer e não somente um tracker.

---

# 30. CATÁLOGO

Página:

`/games`

Mostrar cards para os jogos ativos.

Inicialmente:

* Dark Souls Remastered;
* Valorant.

Adicionar:

* busca por nome;
* filtros básicos se fizer sentido.

Não permitir usuários criarem jogos.

---

# 31. GAME HUB

Rota:

`/games/:slug`

Componente reutilizável.

Não criar arquitetura totalmente separada por jogo.

Estrutura:

* GameHubHeader;
* navegação por módulos;
* Overview;
* Community;
* LFG;
* módulos específicos.

Os módulos devem vir da configuração/database.

---

# 32. IDENTIDADE MGP X IDENTIDADE DOS JOGOS

Regra importante:

**MGP = dourado.**

A identidade institucional da plataforma permanece dourada independentemente do jogo.

Game Hubs podem possuir ambientações próprias, mas não podem apagar a marca MGP.

Modelo conceitual:

**MGP + personalidade do jogo.**

Exemplo:

Dark Souls:

`MGP + atmosfera sombria/quente/medieval`

Valorant:

`MGP + atmosfera competitiva/moderna`

O header institucional, marca, UX principal e componentes globais devem continuar reconhecíveis como MGP.

---

# 33. DARK SOULS REMASTERED HUB

Visual global compartilhado com MGP, mas com personalidade mais:

* sombria;
* atmosférica;
* quente;
* medieval;
* brasas;
* metal;
* cinza;
* tons terrosos.

O dourado institucional do MGP continua presente.

Não utilizar artwork protegido sem autorização.

Utilizar:

* gradientes;
* texturas abstratas;
* elementos originais;
* placeholders seguros.

Overview:

* descrição;
* comunidade;
* Game Profiles relacionados;
* LFG recente.

Community:

posts ligados ao jogo.

Mostrar tabs adicionais:

* Builds;
* Bosses;
* Guides;
* LFG.

Se Builds/Bosses/Guides ainda não possuírem sistema próprio, mostrar Empty State/Coming Soon elegante.

---

# 34. VALORANT HUB

Mesmo sistema base.

Personalidade mais:

* competitiva;
* energética;
* tecnológica;
* angular;
* moderna.

Não copiar o design oficial do Valorant.

Não transformar o MGP inteiro em vermelho.

O dourado institucional permanece presente.

Não utilizar assets Riot protegidos sem necessidade.

Tabs:

* Overview;
* Community;
* Agents;
* Competitive;
* Guides;
* Clips;
* LFG.

Overview e Community funcionais.

LFG funcional usando sistema global.

Outros módulos podem possuir Empty State.

---

# 35. PERFIL PÚBLICO

Rota:

`/u/:username`

Esta página deve ser uma das experiências visualmente mais importantes da aplicação.

Mostrar:

* avatar;
* banner;
* display name;
* @username;
* bio;
* botão Follow;
* followers;
* following;
* Game Profiles;
* posts;
* jogos favoritos se houver;
* botão Report;
* plataformas futuras.

Utilizar detalhes dourados com moderação para transmitir prestígio.

Se for o próprio perfil:

mostrar botão:

**Editar perfil**

Não mostrar botão Follow para si mesmo.

---

# 36. EDIÇÃO DE PERFIL

`/settings/profile`

Permitir:

* display name;
* username;
* bio;
* avatar;
* banner;
* language.

Username:

* validar formato;
* validar unicidade;
* mostrar erro legível.

Alterar username não pode quebrar relações internas.

---

# 37. GAME PROFILE

Página:

`/u/:username/games/:slug`

Mostrar:

* usuário;
* jogo;
* dados declarados;
* indicadores de procedência;
* notas pessoais;
* link para Game Hub.

Se dono:

botão:

**Editar Game Profile**

Criar/editar usando schema correspondente ao jogo.

Não construir formulários totalmente hardcoded independentes se o sistema de schema/config resolver.

---

# 38. SEARCH

Implementar busca simples na interface.

Pesquisar:

* usuários;
* jogos.

Não implementar busca full-text complexa.

Resultados em dropdown ou página simples.

Tratar loading e nenhum resultado.

---

# 39. HEADER

Desktop:

* placeholder/logo MGP;
* Home;
* Jogos;
* Comunidades;
* LFG;
* busca;
* idioma;
* seletor de tema;
* perfil/login.

Mobile:

navegação adaptada.

O logo deverá poder ser substituído posteriormente por arquivo real sem reconstruir o header.

Não depender exclusivamente de hover.

---

# 40. COMUNIDADES

Nesta versão, "Comunidades" pode representar os Game Hubs existentes.

Página/atalho pode listar comunidades dos jogos ativos.

Não criar sistema separado de grupos genéricos nesta versão.

---

# 41. SETTINGS

Criar estrutura básica:

### Perfil

Dados públicos.

### Conta

* e-mail;
* logout;
* redefinição/alteração de senha quando apropriado.

### Aparência

* Light;
* Dark;
* System.

### Idioma

* Português do Brasil;
* English.

Não construir dezenas de configurações vazias.

---

# 42. COMPONENTES REUTILIZÁVEIS

Criar componentes reutilizáveis sempre que fizer sentido.

Exemplos:

* AppHeader;
* MobileNavigation;
* AppFooter;
* BrandLogoPlaceholder;
* ThemeSelector;
* UserAvatar;
* ProfileHeader;
* FollowButton;
* StatCard;
* GameCard;
* GameHubHeader;
* GameModuleTabs;
* GameProfileCard;
* DataSourceIndicator;
* PostCard;
* PostComposer;
* CommentList;
* ReactionButton;
* LFGCard;
* EmptyState;
* LoadingState;
* ErrorState;
* LanguageSelector;
* ReportDialog;
* SearchBox.

Não criar abstrações exageradas.

---

# 43. MOCK DATA

Utilizar mock somente onde estritamente necessário para demonstrar recurso ainda não conectado.

Todo mock precisa estar claramente separado do dado real.

Não espalhar objetos mock dentro de componentes.

Não inserir usuários falsos permanentes no banco.

Depois que auth/database estiver funcionando, componentes sociais devem usar dados reais.

---

# 44. STEAM

NÃO integrar Steam nesta versão.

Criar apenas estrutura visual opcional:

**Conectar Steam — em breve**

ou equivalente.

Não solicitar Steam API key.

Não simular dados Steam como verificados.

---

# 45. RIOT / VALORANT API

NÃO integrar Riot nesta versão.

Mostrar quando necessário:

**Integração Riot planejada**

Não:

* pedir senha Riot;
* fazer scraping;
* inventar endpoint;
* usar API não autorizada;
* mostrar rank manual como verificado.

---

# 46. SEGURANÇA DE CONTEÚDO

Conteúdo textual de usuário deve ser tratado como texto.

Não renderizar HTML bruto.

Links, se permitidos, devem ser tratados com segurança.

Evitar XSS.

Utilizar queries parametrizadas/SDK Supabase corretamente.

Não concatenar SQL usando input de usuário.

---

# 47. RATE LIMITING / ABUSO

Prepare a arquitetura para rate limiting.

Para v0.1, implemente proteção razoável onde a stack permitir sem criar complexidade exagerada.

Ações sensíveis:

* login;
* cadastro;
* criação de posts;
* comentários;
* reports;
* LFG;
* uploads.

Não inventar um sistema gigantesco se a infraestrutura não suportar nativamente.

---

# 48. LGPD / PRIVACIDADE

Não precisamos de um departamento jurídico dentro da aplicação.

Porém a arquitetura deve permitir:

* exclusão de conta futura;
* perfil público/privado;
* controle sobre dados;
* remoção de uploads;
* transparência sobre contas conectadas.

Não coletar dados desnecessários.

---

# 49. ACESSIBILIDADE

Obrigatório:

* HTML semântico;
* foco visível;
* labels;
* navegação por teclado;
* contraste adequado;
* alt text quando necessário;
* botões reais;
* links reais;
* dialogs acessíveis.

Verificar acessibilidade tanto no Light quanto no Dark Mode.

Dourado claro sobre fundo branco NÃO deve ser utilizado quando não possuir contraste suficiente.

---

# 50. RESPONSIVIDADE

Verificar:

### Desktop

Layout amplo.

### Tablet

Grids adaptativos.

### Mobile

Sem overflow horizontal.

Navegação adequada.

Cards reorganizados.

Tabs roláveis horizontalmente quando necessário.

Forms utilizáveis.

Theme e language selectors utilizáveis.

---

# 51. LOADING / ERROR / EMPTY STATES

Nenhuma página importante deve parecer quebrada quando não houver conteúdo.

Criar:

* loading skeleton/spinner adequado;
* empty states;
* mensagens de erro;
* retry quando apropriado.

---

# 52. UX

A aplicação deve comunicar claramente:

* ação bem-sucedida;
* erro;
* loading;
* conteúdo vazio;
* conteúdo indisponível.

Utilizar toasts/modais com moderação.

Não usar `alert()` do navegador como UX principal.

---

# 53. DADOS INICIAIS

Seed apenas do catálogo/configuração necessários.

Criar:

Dark Souls Remastered.

Valorant.

Criar seus módulos.

Não criar automaticamente contas falsas.

Não criar posts falsos permanentes.

---

# 54. PERFORMANCE

Evitar:

* dependências enormes;
* queries N+1 óbvias;
* carregamento desnecessário;
* imagens gigantes;
* renderização excessiva;
* efeitos visuais pesados.

Utilizar:

* paginação;
* limites;
* lazy loading quando necessário.

Não fazer overengineering.

---

# 55. ARQUITETURA

Separar adequadamente:

* UI;
* hooks;
* services/data access;
* schemas;
* types;
* i18n;
* themes;
* game configuration;
* backend logic.

Não concentrar toda a aplicação em um único arquivo.

Não criar arquivos gigantes desnecessários.

---

# 56. TYPESCRIPT

TypeScript estrito e organizado.

Evitar `any`.

Criar tipos/interfaces adequados.

Não ignorar erros TypeScript para finalizar o build.

---

# 57. O QUE NÃO DEVE ACONTECER

NÃO:

* inventar APIs;
* expor secrets;
* desativar RLS para fazer algo funcionar;
* utilizar service_role no browser;
* confiar em user_id enviado pelo frontend;
* criar conta admin automaticamente com senha hardcoded;
* inserir senhas no banco;
* construir marketplace;
* adicionar anúncios;
* implementar pagamentos;
* adicionar criptomoeda/NFT;
* criar chat;
* implementar upload de vídeo;
* integrar Steam;
* integrar Riot;
* adicionar 100 jogos;
* criar arquitetura diferente para cada jogo;
* usar vermelho como identidade global principal;
* copiar UI de Steam/Discord/Valorant;
* gerar uma logo definitiva sem arquivo oficial;
* usar assets protegidos de jogos sem autorização.

---

# 58. ORDEM INTERNA DE IMPLEMENTAÇÃO

Execute nesta mesma tarefa, sem pedir novos prompts entre as etapas:

1. Fundação visual.
2. Sistema Light/Dark/System.
3. Design system dourado.
4. Placeholder de marca/logo.
5. i18n.
6. Supabase.
7. migrations/schema.
8. RLS.
9. auth.
10. profile onboarding.
11. catálogo.
12. Game Hubs.
13. Game Profiles.
14. follows.
15. posts.
16. comments.
17. reactions.
18. LFG.
19. reports.
20. admin reports.
21. uploads.
22. busca.
23. settings.
24. responsividade.
25. accessibility pass.
26. security review.
27. build/test/fixes.

Esta lista é ordem de execução, não uma solicitação para parar entre cada etapa.

---

# 59. ONBOARDING

Após cadastro bem-sucedido, caso o usuário ainda não possua perfil completo:

abrir onboarding simples.

Solicitar:

* username;
* display name;
* idioma.

Bio/avatar podem ser opcionais.

Username precisa ser validado.

Depois levar para:

`/u/:username`

---

# 60. HOME LOGADA X DESLOGADA

A Home deve se adaptar.

### Deslogado

Explica rapidamente o MGP e incentiva cadastro.

### Logado

Prioriza:

* perfil;
* comunidade;
* posts recentes;
* jogos;
* LFG.

Não precisa existir feed algorítmico.

Ordenação cronológica é suficiente.

---

# 61. DESIGN DOS DOIS JOGOS

Game Hub precisa aceitar tema/configuração por jogo sem alterar toda a estrutura.

Exemplo:

`theme_key`

O tema do jogo pode influenciar:

* detalhes decorativos;
* background;
* accent secundário;
* textura;
* atmosfera.

Porém o **Gold MGP permanece como identidade institucional**.

Dark Souls pode influenciar:

* brasas;
* bronze;
* tons terrosos;
* cinza escuro.

Valorant pode influenciar:

* linhas mais fortes;
* superfícies mais técnicas;
* contraste mais energético.

Mas componentes, acessibilidade e estrutura continuam compartilhados.

---

# 62. CLASSIFICAÇÃO ETÁRIA

Guardar `age_rating` nos jogos.

Exibir essa informação quando apropriado.

Não implementar verificação etária complexa na v0.1.

A arquitetura deve permitir isso futuramente.

---

# 63. CONTEÚDO PROTEGIDO / ASSETS

Não baixar ou copiar automaticamente assets protegidos de jogos.

Para v0.1 utilizar:

* placeholders elegantes;
* abstrações;
* gradientes;
* formas;
* elementos gráficos originais.

O usuário poderá fornecer assets autorizados posteriormente.

---

# 64. ADMIN ROLE SECURITY

Muito importante:

`role = admin`

não pode ser alterado pelo usuário através das configurações comuns.

Não utilizar campo controlável pelo frontend sem proteção.

Se for necessário definir o primeiro administrador, documente a forma segura para o proprietário fazer isso manualmente no Supabase.

Não hardcode e-mail específico como administrador.

---

# 65. TESTES DE SEGURANÇA A REALIZAR

Antes de considerar a v0.1 pronta, valide conceitualmente/tecnicamente:

User A não consegue editar profile de User B.

User A não consegue editar/deletar post de User B.

User A não consegue editar/deletar comment de User B.

User A não consegue modificar LFG de User B.

User comum não consegue abrir dados administrativos.

User comum não consegue mudar role para admin.

Usuário deslogado não consegue criar posts/comments/LFG.

Game catalog não pode ser alterado por usuários comuns.

Reports de outros usuários não ficam publicamente visíveis.

---

# 66. TESTES VISUAIS

Verifique:

* Home Light Mode;
* Home Dark Mode;
* perfil Light Mode;
* perfil Dark Mode;
* Dark Souls Hub Light/Dark;
* Valorant Hub Light/Dark;
* formulários;
* inputs;
* dropdowns;
* modais;
* menus mobile;
* estados de hover;
* estados de focus;
* estados disabled;
* contrastes dourados.

O tema não pode quebrar legibilidade.

---

# 67. VERIFICAÇÃO FINAL

Antes de encerrar:

* execute build;
* execute verificações disponíveis;
* corrija erros;
* corrija imports;
* corrija erros TypeScript;
* verifique rotas;
* verifique autenticação;
* verifique i18n;
* verifique Light/Dark/System;
* verifique persistência do tema;
* verifique RLS;
* verifique mobile;
* verifique desktop;
* verifique console;
* remova logs de debug desnecessários.

Não finalize deixando erros conhecidos simples de corrigir.

---

# 68. CRITÉRIOS DE ACEITAÇÃO DA V0.1

A v0.1 só deve ser considerada concluída quando for possível:

1. abrir o MGP;
2. visualizar identidade dourada consistente;
3. alternar Light/Dark/System;
4. persistir preferência visual;
5. alternar pt-BR/en;
6. cadastrar conta;
7. fazer login/logout;
8. recuperar senha;
9. escolher username único;
10. editar perfil;
11. fazer upload de avatar/banner;
12. abrir perfil público;
13. seguir/deixar de seguir usuário;
14. visualizar catálogo;
15. abrir Dark Souls Hub;
16. abrir Valorant Hub;
17. criar Game Profile manual;
18. editar Game Profile;
19. ver procedência "Informado pelo jogador";
20. criar post;
21. comentar;
22. dar/remover like;
23. criar LFG;
24. filtrar LFG;
25. encerrar LFG próprio;
26. denunciar conteúdo;
27. impedir acesso administrativo por usuário comum;
28. utilizar a aplicação adequadamente no mobile;
29. utilizar a aplicação adequadamente no desktop;
30. garantir contraste adequado nos dois temas;
31. build finalizar sem erro crítico.

---

# 69. FINALIZAÇÃO

Ao terminar o Build:

apresente um resumo curto contendo:

* o que foi implementado;
* migrations criadas;
* policies RLS criadas;
* buckets/storage criados;
* rotas criadas;
* principais componentes;
* estrutura de Light/Dark Mode;
* estrutura de identidade visual;
* recursos que ficaram propositalmente para versões futuras;
* eventuais limitações reais encontradas.

Não avance automaticamente para Steam, Riot ou MGP v0.2.

Não substitua funcionalidades reais por mocks silenciosamente.

Se alguma parte específica desta especificação não puder ser concluída por limitação real da plataforma, implemente todo o restante possível e explique objetivamente a limitação no final.

Construa agora o **MGP v0.1**.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mygamerprofile.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/95c5a73d-d8d1-4747-85d3-6194f336fae8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
