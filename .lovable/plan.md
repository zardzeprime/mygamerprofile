# Primeira etapa do rebranding para ÍMPAR

## Objetivo
Atualizar toda marca antiga ainda visível ao usuário para ÍMPAR, sem alterar domínio, autenticação, integrações, banco ou identificadores técnicos legados.

## Implementação
- Revisar páginas públicas, perfis, autenticação, configurações, estados vazios/erro, acessibilidade e textos traduzidos em PT-BR, EN e ES.
- Trocar títulos, descrições e metadata por rota para a identidade ÍMPAR, mantendo `https://mgprofile.online` em canonical, compartilhamento e callbacks.
- Padronizar Noctis como `Noctis · Guardião do ÍMPAR` nas superfícies públicas; NEXUS continuará somente em contratos e nomes técnicos internos.
- Reutilizar `BrandLogoPlaceholder` e `public/brand/impar-logo-official.webp`; não criar nem substituir a identidade visual oficial.
- Atualizar templates e assuntos públicos de e-mail sem mudar o domínio remetente configurado.
- Preservar chaves `mgp-*`, nomes de funções, tabelas, eventos, códigos de erro, rotas legadas e demais compatibilidades.
- Corrigir apenas erros de compilação já presentes que bloqueiem a validação, sem ampliar o escopo funcional.

## Validação
- Procurar novamente nomes antigos nas superfícies públicas e classificar os casos restantes como técnicos ou históricos.
- Validar tipagem, lint e compilação.
- Conferir Home, navegação, autenticação, perfil e estados de erro em desktop e mobile.
- Registrar a revisão compacta dos especialistas no estado do Conselho.

## Premissas de segurança
- O domínio `mgprofile.online`, URLs publicadas, callbacks OAuth e domínio de envio permanecem inalterados.
- Textos legais terão apenas a marca pública atualizada; identidade do operador e compromissos jurídicos não serão inventados.
- Nenhuma alteração de banco, credencial, chave privada ou configuração de autenticação será feita.
