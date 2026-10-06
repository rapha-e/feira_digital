# Product Requirements Document (PRD): Feira Digital (Versão Completa & Evoluída)

## 1. Visão Geral do Projeto
A **Feira Digital** é uma plataforma web (MVP) desenvolvida para conectar consumidores locais a microempreendedores individuais (MEIs) e pequenos negócios de bairro, com conversão 100% direta para o WhatsApp.
A proposta central é eliminar atritos operacionais e burocráticos: não há carrinho de compras, taxas de intermediação nem pagamentos internos. O cliente encontra o produto/serviço e fecha o negócio diretamente com o empreendedor via mensagem.

---

## 2. Objetivos e Indicadores de Sucesso (KPIs)
- **Redução drástica do tempo de cadastro:** Permitir que o microempreendedor cadastre um novo produto pelo celular em menos de 20 segundos (fluxo estilo "maquininha de cartão").
- **Ativação Rápida (Time-to-Value):** Fazer com que o lojista complete seu perfil e publique seu primeiro item em até 2 minutos após o primeiro acesso.
- **Retenção e Engajamento:** Maximizar o CTR para o WhatsApp e o tráfego orgânico via compartilhamento social.

---

## 3. Personas Alvo
- **O Consumidor Local:** Buscador de praticidade e valorização do comércio local. Quer encontrar produtos e serviços na sua região, verificar status operacional e fechar compras rapidamente pelo WhatsApp.
- **O Microempreendedor (MEI / Pequeno Negócio):** Sem tempo, operando prioritariamente pelo smartphone. Precisa de uma vitrine simples, rápida e que funcione como extensão do seu atendimento móvel.

---

## 4. Plano de Evolução Estratégica e Tecnológica (Pilares Completos)

### Pilar 1: Aquisição e Onboarding de Empreendedores (Combate ao Cold Start)
- **Onboarding "Zero-Friction" em 1 Minuto:** Cadastro inicial facilitado via autenticação rápida e navegação intuitiva.
- **Auto-Preenchimento via WhatsApp:** Etapa inteligente onde o lojista insere o número do WhatsApp e o sistema formata e valida os dados de contato.
- **Painel de Onboarding Guiado (Checklist de Ativação):** Barra de progresso gamificada no `/painel`:
  - 1. Criar perfil da loja (25%)
  - 2. Definir bairro e categoria (50%)
  - 3. Cadastrar o primeiro produto com foto (75%)
  - 4. Testar o botão do WhatsApp (100% - Pronto para a Feira!)
- **Modo "Convidar Lojista" (Link Mágico):** Geração de links personalizados (`/convite/[slug]`) para pré-cadastrar o nome e a categoria do lojista instantaneamente.

### Pilar 2: Enriquecimento da Experiência do Cliente (Dinamismo na Vitrine)
- **Selo de Status Operacional ("Aberto / Fechado no WhatsApp"):** Interruptor rápido no painel para o lojista indicar se está atendendo no momento, exibindo selo visual correspondente na vitrine.
- **Filtros Avançados de Proximidade e Entrega:** Tags rápidas nos cards informando modalidades como:
  - Entrega Grátis na Cidade
  - Retirada no Local
  - Aceita Pix / Cartão
- **Compartilhamento Nativo de Produtos (Social Proof):** Botão de compartilhamento direto no WhatsApp em cada card de produto para estimular o loop viral orgânico.

### Pilar 3: Evolução do Produto para o Empreendedor (Retenção e Valor)
- **Contador de Cliques no WhatsApp (Métrica de Sucesso):** Exibição no painel de quantas vezes a vitrine foi vista e quantas vezes o botão de contato foi acionado.
- **Mensagens Personalizadas por Produto:** Edição opcional do template do WhatsApp para cada item cadastrado, garantindo contexto direto na negociação.
- **Flexibilização Inteligente do Teto de Produtos:** Modelo base gratuito com limite de 5 itens e indicador visual claro da cota disponível.

### Pilar 4: Otimizações Técnicas e Arquiteturais (Next.js & Supabase)
- **Cache Otimizado / ISR na Home:** Configuração de revalidação baseada em tempo (`revalidate = 60`) no Next.js para assegurar carregamento instantâneo em momentos de pico.
- **Otimização Automática de Imagens:** Redimensionamento e compressão inteligente via Supabase Storage / Next.js Image para fotos tiradas por smartphones.
- **Busca Híbrida Inteligente:** Aprimoramento de consultas no banco de dados para tolerar pequenas variações e buscas por categoria, bairro e termos livres.

---

## 5. Fluxo de Cadastro "Estilo Maquininha" (Mobile-First)
- **Câmera Instantânea:** Botão flutuante principal que aciona a câmera traseira do celular (`capture="environment"`).
- **Teclado Numérico Fluido:** Foco automático no preço com máscara numérica em Reais (`inputMode="decimal"`).
- **Publicação em 1 Toque:** Inserção do título e publicação imediata na vitrine em menos de 20 segundos.
