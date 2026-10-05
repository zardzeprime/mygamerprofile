# ÍMPAR

**ÍMPAR** é uma plataforma social para quem joga: um lugar para descobrir jogos, encontrar pessoas para jogar, participar de conversas e compartilhar ou guardar builds e conhecimento.

O projeto começou como **MGP — My Gamer Profile**. A ideia evoluiu: a plataforma continua tendo identidade visual própria e espaços dedicados aos jogos, mas a conta deixa de ser o centro do produto. Ela existe para viabilizar as ações sociais e salvar o que importa para cada pessoa, sem exigir um perfil extenso ou muita personalização.

> **Jogue junto. Compartilhe o que sabe. Guarde o que funciona.**

## O que você encontra no ÍMPAR

- **Hubs de jogos** com espaços e ferramentas organizados por jogo.
- **Descoberta de grupo (LFG)** para encontrar pessoas com quem jogar.
- **Comunidade** para publicar e conversar sobre jogos.
- **Builds e conhecimento** para compartilhar com a comunidade ou salvar na própria conta.
- **Identidade leve** para atribuir autoria às publicações e conectar as atividades de uma pessoa.

Essa mudança também responde ao momento do projeto: uma rede centrada em perfis só entrega valor quando já existe uma base grande e ativa — difícil de sustentar no começo — enquanto perfis muito customizados aumentam o atrito de criação e o custo de manter dados e recursos. O ÍMPAR prioriza ações úteis desde a primeira visita: ler, explorar jogos e procurar grupos sem conta; criar uma conta leve quando a pessoa quiser publicar, responder, encontrar grupo ou salvar builds e conhecimento. Perfis detalhados e personalização extensa ficam fora do foco atual.

## Estado do projeto

O ÍMPAR está em desenvolvimento contínuo. A plataforma já reúne uma identidade visual própria e hubs de jogos; o hub de **Warframe**, por exemplo, organiza Warframes, armas e itens, com informações de obtenção e fabricação quando disponíveis.

As áreas, integrações e dados variam conforme o jogo. Informações dependentes de fontes externas são exibidas de acordo com a disponibilidade dessas fontes. O README descreve a direção do produto e não garante que todo módulo planejado esteja concluído.

## Tecnologia

- React 19 e TypeScript
- TanStack Start e TanStack Router
- Vite
- Tailwind CSS
- Supabase para serviços de backend utilizados pelo projeto

## Desenvolvimento local

Requisitos: Node.js e npm.

```sh
git clone https://github.com/zardzeprime/mygamerprofile.git
cd mygamerprofile
npm install
npm run dev
```

Outros comandos disponíveis:

```sh
npm run build
npm run lint
npm run preview
```

O nome histórico do repositório ainda pode aparecer como `mygamerprofile`, e alguns endereços de desenvolvimento ainda podem usar a marca antiga.

## Links

- [Aplicação ÍMPAR](https://projeto-impar.vercel.app)
- [Projeto no Lovable](https://lovable.dev/projects/95c5a73d-d8d1-4747-85d3-6194f336fae8)
