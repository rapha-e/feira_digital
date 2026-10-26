const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Ler credenciais do .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Configurações do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definição das Categorias e Slugs
const CATEGORY_MAP = {
  'alimentacao-bebidas': 'b9171329-29fe-4a92-ba58-da443a14bbd4',
  'beleza-estetica': 'c58ff9e7-4a63-4c47-b2d4-3a0b3ee706ff',
  'artesanato-presentes': '491d5e1a-1ed7-4ce2-9ba3-96a55745221b',
  'servicos-gerais': 'fdecb506-2dc5-441f-96bc-3a5a091bd099',
  'moda-acessorios': '5fba57d6-8c0f-4440-90d8-423a4f380e02',
  'pet-cuidados': '1b64f173-a637-4314-8d81-05e200076b9d',
};

const SEED_DATA = [
  // ==========================================
  // MODALIDADE 1: ALIMENTAÇÃO & BEBIDAS
  // ==========================================
  {
    name: "Pastel Gourmet & Cia",
    slug: "pastel-gourmet-aguas-claras",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Águas Claras",
    city: "Brasília",
    state: "DF",
    cep: "71900100",
    street_address: "Avenida Castanheiras, Lote 1060",
    address_number: "Loja 02",
    latitude: -15.8398,
    longitude: -48.0245,
    whatsapp: "5561991231001",
    avatar_url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80",
    bio: "Mais de 30 sabores de pastéis crocantes fritos na hora com massa artesanal sequinha e caldo de cana gelado.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 85,
    whatsapp_clicks_count: 22,
    products: [
      {
        title: "Pastel Especial de Carne Seca com Catupiry",
        description: "Recheio farto de carne de sol desfiada e catupiry original (25cm).",
        price: 18.00,
        image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=500&q=80",
        custom_whatsapp_message: "Olá! Gostaria de pedir o pastel de carne seca com catupiry."
      },
      {
        title: "Combo Pastel Família + Caldo de Cana 1L",
        description: "4 pastéis tradicionais à escolha + 1 garrafa de caldo de cana com limão.",
        price: 52.00,
        image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80",
        custom_whatsapp_message: "Olá! Quero pedir o combo família com caldo de cana!"
      }
    ]
  },
  {
    name: "Churrasquinho & Espetos Ceilândia",
    slug: "churrasquinho-ceilandia",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Ceilândia",
    city: "Brasília",
    state: "DF",
    cep: "72220140",
    street_address: "QNN 14 Conjunto B",
    address_number: "22",
    latitude: -15.8190,
    longitude: -48.1110,
    whatsapp: "5561984552002",
    avatar_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80",
    bio: "O tradicional espetinho na brasa de Ceilândia. Acompanha arroz branco, feijão tropeiro e mandioca cozida com manteiga de garrafa.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 140,
    whatsapp_clicks_count: 45,
    products: [
      {
        title: "Jantinha Completa com Picanha",
        description: "Espeto de picanha suculenta, arroz, tropeiro, mandioca e vinagrete.",
        price: 28.00,
        image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Espeto de Queijo Coalho com Melaço",
        description: "Queijo coalho assado na brasa com fio de melaço de cana.",
        price: 12.00,
        image_url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Café & Delícias do Cerrado",
    slug: "cafe-delicias-cerrado-asa-norte",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Asa Norte",
    city: "Brasília",
    state: "DF",
    cep: "70854520",
    street_address: "CLN 208 Bloco D",
    address_number: "Subsolo",
    latitude: -15.7650,
    longitude: -47.8830,
    whatsapp: "5561993213003",
    avatar_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    bio: "Cafés especiais do Planalto Central, pães de queijo recheados e bolos artesanais sem conservantes no coração da Asa Norte.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 210,
    whatsapp_clicks_count: 67,
    products: [
      {
        title: "Pão de Queijo Recheado com Carne de Panela",
        description: "Pão de queijo da canastra artesanal recheado com carne desfiada e queijo meia cura.",
        price: 16.50,
        image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Cappuccino Artesanal com Canela (300ml)",
        description: "Expresso duplo, leite vaporizado cremoso, raspas de chocolate e canela.",
        price: 14.00,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Pizzaria Forno a Lenha Taguá",
    slug: "pizzaria-artesanal-taguatinga",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Taguatinga",
    city: "Brasília",
    state: "DF",
    cep: "72110030",
    street_address: "QNA 03 Lote 12",
    address_number: "Loja 1",
    latitude: -15.8290,
    longitude: -48.0580,
    whatsapp: "5561986444004",
    avatar_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    bio: "Massa de fermentação natural de 48h com molho de tomate pelado italiano e queijo de primeira qualidade em Taguatinga Norte.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 98,
    whatsapp_clicks_count: 31,
    products: [
      {
        title: "Pizza Calabresa Especial (Grande 8 fatias)",
        description: "Molho rústico, queijo mozzarella, calabresa artesanal, cebola roxa e orégano.",
        price: 49.90,
        image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Pizza Marguerita com Manjericão Fresco",
        description: "Mozzarella de búfala, rodelas de tomate italiano e folhas frescas de manjericão.",
        price: 54.00,
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Marmitaria Caseira & Fitness Gama",
    slug: "marmitaria-caseira-gama",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Gama",
    city: "Brasília",
    state: "DF",
    cep: "72405010",
    street_address: "Setor Central Quadra 01",
    address_number: "14",
    latitude: -16.0150,
    longitude: -48.0650,
    whatsapp: "5561999885005",
    avatar_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    bio: "Alimentação saudável, balanceada e saborosa. Pacotes semanais de marmitas congeladas ou entrega diária quente no Gama.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 55,
    whatsapp_clicks_count: 14,
    products: [
      {
        title: "Kit 5 Marmitas Fitness Congeladas",
        description: "Frango grelhado, patinho moído, arroz integral, batata doce e legumes salteados.",
        price: 95.00,
        image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Açaí & Tapioca Raiz Guará",
    slug: "acai-tapioca-guara",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Guará",
    city: "Brasília",
    state: "DF",
    cep: "71050150",
    street_address: "QE 15 Conjunto C",
    address_number: "Quiosque 01",
    latitude: -15.8230,
    longitude: -47.9820,
    whatsapp: "5561995546006",
    avatar_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80",
    bio: "Açaí puro do Pará batido na hora sem xarope artificial, além de tapiocas salgadas e doces recheadas no Guará II.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 73,
    whatsapp_clicks_count: 19,
    products: [
      {
        title: "Copo Açaí Tradicional 500ml Turbinado",
        description: "Com leite condensado, leite em pó, morangos frescos e banana fatiada.",
        price: 22.00,
        image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Tapioca de Frango com Queijo Coalho",
        description: "Massa fininha e crocante recheada com frango desfiado temperado e queijo derretido.",
        price: 16.00,
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Quitutes Mineiros da Serra",
    slug: "quitutes-mineiros-sobradinho",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Sobradinho",
    city: "Brasília",
    state: "DF",
    cep: "73020080",
    street_address: "Quadra 08 Bloco A",
    address_number: "Loja 05",
    latitude: -15.6520,
    longitude: -47.7910,
    whatsapp: "5561981127007",
    avatar_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    bio: "Biscoito de polvilho frito, broa de milho de aeroporto, queijos artesanais da Serra da Canastra e doces caseiros.",
    is_open: false,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: false,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 42,
    whatsapp_clicks_count: 8,
    products: [
      {
        title: "Queijo Minas Padrão Meia Cura (Peça 500g)",
        description: "Produzido artesanalmente com leite cru selecionado.",
        price: 38.00,
        image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Hamburgueria Rústica Samambaia",
    slug: "hamburgueria-rustica-samambaia",
    category_slug: "alimentacao-bebidas",
    neighborhood: "Samambaia",
    city: "Brasília",
    state: "DF",
    cep: "72312060",
    street_address: "QN 406 Conjunto E",
    address_number: "Lote 01",
    latitude: -15.8710,
    longitude: -48.0930,
    whatsapp: "5561996778008",
    avatar_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    bio: "Smash burgers suculentos feitos com blend 100% bovino fresco, queijo cheddar fundido e pão brioche amanteigado.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 165,
    whatsapp_clicks_count: 52,
    products: [
      {
        title: "Duplo Bacon Cheddar Smash",
        description: "Dois hambúrgueres de 100g, fatias crocantes de bacon, cebola caramelizada e maionese defumada.",
        price: 32.00,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Batata Frita Rústica com Páprica",
        description: "Porção individual de batatas rústicas com casca, alecrim e maionese da casa.",
        price: 15.00,
        image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },

  // ==========================================
  // MODALIDADE 2: BELEZA & ESTÉTICA
  // ==========================================
  {
    name: "Studio Glow Nails & Cílios",
    slug: "studio-glow-asa-sul",
    category_slug: "beleza-estetica",
    neighborhood: "Asa Sul",
    city: "Brasília",
    state: "DF",
    cep: "70344510",
    street_address: "CLS 305 Bloco B",
    address_number: "Sala 204",
    latitude: -15.8080,
    longitude: -47.8990,
    whatsapp: "5561992349009",
    avatar_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
    bio: "Extensão de cílios fio a fio e volume russo, alongamento de unhas em gel e fibra de vidro, e design de sobrancelhas personalizado.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 180,
    whatsapp_clicks_count: 59,
    products: [
      {
        title: "Extensão de Cílios Volume Brasileiro",
        description: "Aplicação fio a fio em formato de Y com durabilidade de até 30 dias.",
        price: 130.00,
        image_url: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Alongamento em Fibra de Vidro + Esmaltação",
        description: "Unhas naturais, resistentes e esmaltação em gel de alta durabilidade.",
        price: 140.00,
        image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Barbearia Tradicional Taguá",
    slug: "barbearia-tradicional-tagua",
    category_slug: "beleza-estetica",
    neighborhood: "Taguatinga",
    city: "Brasília",
    state: "DF",
    cep: "72015520",
    street_address: "CSB 02 Lote 04",
    address_number: "Sobreloja",
    latitude: -15.8360,
    longitude: -48.0540,
    whatsapp: "5561985661010",
    avatar_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80",
    bio: "Cortes masculinos clássicos e modernos, barba desenhada na toalha quente e ambiente climatizado com cerveja gelada.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 110,
    whatsapp_clicks_count: 36,
    products: [
      {
        title: "Combo Corte Degradê + Barboterapia",
        description: "Acabamento no navalhete, toalha quente, óleo para barba e pomada finalizadora.",
        price: 65.00,
        image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Corte Masculino Social ou Fade",
        description: "Lavagem refrescante com mentol e corte com tesoura e máquina.",
        price: 40.00,
        image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Espaço VIP Cabelo & Make Ceilândia",
    slug: "espaco-vip-ceilandia",
    category_slug: "beleza-estetica",
    neighborhood: "Ceilândia",
    city: "Brasília",
    state: "DF",
    cep: "72215180",
    street_address: "QNM 18 Conjunto A",
    address_number: "Lote 15",
    latitude: -15.8120,
    longitude: -48.1150,
    whatsapp: "5561993442011",
    avatar_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
    bio: "Especialista em loiros saudáveis, morena iluminada, cronograma capilar e maquiagem profissional para formaturas e casamentos.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 95,
    whatsapp_clicks_count: 28,
    products: [
      {
        title: "Pacote Morena Iluminada + Tratamento",
        description: "Mechas personalizadas sem agredir o fio, matização e hidratação profunda.",
        price: 250.00,
        image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Maquiagem Social Completa com Cílios Postiços",
        description: "Make à prova d'água com preparação de pele blindada para eventos.",
        price: 120.00,
        image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Estética Corporal Bella Vida",
    slug: "estetica-bella-vida-aguas-claras",
    category_slug: "beleza-estetica",
    neighborhood: "Águas Claras",
    city: "Brasília",
    state: "DF",
    cep: "71918180",
    street_address: "Rua das Pitangueiras Lote 06",
    address_number: "Sala 301",
    latitude: -15.8370,
    longitude: -48.0280,
    whatsapp: "5561981113012",
    avatar_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
    bio: "Drenagem linfática pós-operatório, massagem modeladora, limpeza de pele profunda com extração por sucção e radiofrequência.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 135,
    whatsapp_clicks_count: 41,
    products: [
      {
        title: "Limpeza de Pele Profunda com Peeling de Diamante",
        description: "Higienização, emoliência, extração de cravos, máscara calmante e hidratação.",
        price: 110.00,
        image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Sessão Massagem Relaxante com Óleos Essenciais",
        description: "50 minutos de alívio de tensões musculares e bem-estar corporal.",
        price: 90.00,
        image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Barbearia Imperial Sudoeste",
    slug: "barbearia-imperial-sudoeste",
    category_slug: "beleza-estetica",
    neighborhood: "Sudoeste",
    city: "Brasília",
    state: "DF",
    cep: "70670200",
    street_address: "CLSW 102 Bloco B",
    address_number: "Loja 18",
    latitude: -15.7940,
    longitude: -47.9260,
    whatsapp: "5561998874013",
    avatar_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80",
    bio: "Atendimento premium com hora marcada no Sudoeste. Cortes impecáveis, alinhamento capilar e produtos de alta performance.",
    is_open: false,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 77,
    whatsapp_clicks_count: 21,
    products: [
      {
        title: "Corte Executivo com Tesoura",
        description: "Corte detalhado para quem busca visual elegante e sob medida.",
        price: 55.00,
        image_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Salão & Tranças Afro Raízes",
    slug: "trancas-afro-planaltina",
    category_slug: "beleza-estetica",
    neighborhood: "Planaltina",
    city: "Brasília",
    state: "DF",
    cep: "73310010",
    street_address: "Setor Tradicional Quadra 12",
    address_number: "04",
    latitude: -15.6180,
    longitude: -47.6520,
    whatsapp: "5561986555014",
    avatar_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
    bio: "Especialista em tranças nagô, box braids, dreadlocks e transição capilar. Cuidado e valorização da beleza afro em Planaltina.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 64,
    whatsapp_clicks_count: 17,
    products: [
      {
        title: "Box Braids Tradicional (Cabelo incluso)",
        description: "Tranças compridas até a cintura com fibra jumbo de alta qualidade.",
        price: 220.00,
        image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Espaço Bronze & Estética Santa Maria",
    slug: "bronze-estetica-santa-maria",
    category_slug: "beleza-estetica",
    neighborhood: "Santa Maria",
    city: "Brasília",
    state: "DF",
    cep: "72510210",
    street_address: "QR 210 Conjunto F",
    address_number: "08",
    latitude: -16.0090,
    longitude: -47.9880,
    whatsapp: "5561992226015",
    avatar_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80",
    bio: "Bronzeamento natural com fita e ativação rápida, banho de lua com hidratação e esfoliação corporal em Santa Maria Sul.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 51,
    whatsapp_clicks_count: 11,
    products: [
      {
        title: "Sessão Bronzeamento Natural com Biquíni de Fita",
        description: "Montagem perfeita de marquinha com produtos dermatologicamente testados.",
        price: 80.00,
        image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },

  // ==========================================
  // MODALIDADE 3: ARTESANATO & PRESENTES
  // ==========================================
  {
    name: "Ateliê Cerâmica & Barro DF",
    slug: "atelie-ceramica-asa-sul",
    category_slug: "artesanato-presentes",
    neighborhood: "Asa Sul",
    city: "Brasília",
    state: "DF",
    cep: "70273510",
    street_address: "CLS 410 Bloco C",
    address_number: "Loja 12",
    latitude: -15.8190,
    longitude: -47.9040,
    whatsapp: "5561993457016",
    avatar_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    bio: "Peças exclusivas de cerâmica de alta temperatura esmaltadas à mão. Canecas, pratos rústicos, vasos e kits de presente corporativo.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 122,
    whatsapp_clicks_count: 37,
    products: [
      {
        title: "Caneca Rústica Artesanal Esmaltada (350ml)",
        description: "Peça modelada no torno com esmalte atóxico verde floresta.",
        price: 48.00,
        image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Vaso de Mesa Terracota Texturizado",
        description: "Perfeito para arranjos florais secos ou plantas ornamentais.",
        price: 65.00,
        image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Velas & Aromas Artesanais do Lago",
    slug: "velas-aromas-lago-norte",
    category_slug: "artesanato-presentes",
    neighborhood: "Lago Norte",
    city: "Brasília",
    state: "DF",
    cep: "71503505",
    street_address: "CA 05 Lote H",
    address_number: "Bloco 2",
    latitude: -15.7280,
    longitude: -47.8730,
    whatsapp: "5561981228017",
    avatar_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80",
    bio: "Velas aromáticas ecológicas feitas com cera vegetal de coco, pavio de algodão e essências nobres inspiradas na flora do Cerrado.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 88,
    whatsapp_clicks_count: 27,
    products: [
      {
        title: "Vela Aromática Capim Limão & Alecrim (200g)",
        description: "Em pote de vidro reutilizável com tampa de madeira e queima de 40 horas.",
        price: 52.00,
        image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Difusor de Ambiente com Varetas de Fibra",
        description: "Frasco de 250ml com aroma duradouro para salas e escritórios.",
        price: 45.00,
        image_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Mosaicos & Arte em Madeira Taguá",
    slug: "mosaicos-arte-taguatinga",
    category_slug: "artesanato-presentes",
    neighborhood: "Taguatinga",
    city: "Brasília",
    state: "DF",
    cep: "72125250",
    street_address: "QNE 25 Lote 08",
    address_number: "Casa",
    latitude: -15.8240,
    longitude: -48.0620,
    whatsapp: "5561994339018",
    avatar_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80",
    bio: "Mesas de mosaico em ladrilho hidráulico, tábuas de corte em madeira nobre de demolição e mandalas decorativas em Taguatinga.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 61,
    whatsapp_clicks_count: 15,
    products: [
      {
        title: "Tábua de Frios em Madeira Teca Resinada",
        description: "Tábua artesanal para churrasco e queijos com detalhe em resina epóxi azul.",
        price: 85.00,
        image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Cestas de Café da Manhã & Mimos",
    slug: "cestas-mimos-vicente-pires",
    category_slug: "artesanato-presentes",
    neighborhood: "Vicente Pires",
    city: "Brasília",
    state: "DF",
    cep: "72007080",
    street_address: "Rua 08 Chácara 210",
    address_number: "12",
    latitude: -15.8030,
    longitude: -48.0320,
    whatsapp: "5561995441019",
    avatar_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
    bio: "Cestas personalizadas para aniversários e datas especiais com flores naturais, caneca gravada e delícias artesanais.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 145,
    whatsapp_clicks_count: 48,
    products: [
      {
        title: "Cesta de Café Especial Luxo",
        description: "Pães artesanais, croissants, geleia caseira, café gourmet, caneca e cartão personalizado.",
        price: 150.00,
        image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Bordados & Enxovais com Amor",
    slug: "bordados-enxovais-sao-sebastiao",
    category_slug: "artesanato-presentes",
    neighborhood: "São Sebastião",
    city: "Brasília",
    state: "DF",
    cep: "71691010",
    street_address: "Rua da Gameleira Quadra 04",
    address_number: "02",
    latitude: -15.8980,
    longitude: -47.7680,
    whatsapp: "5561986112020",
    avatar_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80",
    bio: "Enxovais para bebês personalizados em ponto cruz e bordado eletrônico: fraldas, mantas e toalhas personalizadas com o nome da criança.",
    is_open: false,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: false,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 49,
    whatsapp_clicks_count: 10,
    products: [
      {
        title: "Kit 3 Fraldas de Boca Bordadas",
        description: "Tecido 100% algodão super macio com barra bordada e acabamento em renda.",
        price: 45.00,
        image_url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Arte Flora & Suculentas da Terra",
    slug: "arte-flora-brazlandia",
    category_slug: "artesanato-presentes",
    neighborhood: "Brazlândia",
    city: "Brasília",
    state: "DF",
    cep: "72705010",
    street_address: "Setor Tradicional Quadra 03",
    address_number: "20",
    latitude: -15.6690,
    longitude: -48.1980,
    whatsapp: "5561993333021",
    avatar_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80",
    bio: "Kits de suculentas e cactos raros montados em vasos de concreto e cerâmica produzidos em Brazlândia. Lembrancinhas para casamentos e eventos.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 58,
    whatsapp_clicks_count: 16,
    products: [
      {
        title: "Mini Vaso de Concreto com Suculenta (Unidade)",
        description: "Lembrancinha charmosa personalizada com tag comemorativa.",
        price: 12.00,
        image_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },

  // ==========================================
  // MODALIDADE 4: SERVIÇOS GERAIS
  // ==========================================
  {
    name: "Eletrotécnica & Manutenção Rápida",
    slug: "eletrotecnica-manutencao-guara",
    category_slug: "servicos-gerais",
    neighborhood: "Guará",
    city: "Brasília",
    state: "DF",
    cep: "71010020",
    street_address: "QE 02 Bloco C",
    address_number: "Sala 102",
    latitude: -15.8150,
    longitude: -47.9780,
    whatsapp: "5561992114022",
    avatar_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    bio: "Serviços de eletricista residencial e comercial no Guará, Lúcio Costa e Candangolândia. Troca de fiação, instalação de disjuntores e chuveiros.",
    is_open: true,
    free_delivery: true,
    store_pickup: false,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 175,
    whatsapp_clicks_count: 53,
    products: [
      {
        title: "Instalação e Troca de Chuveiro Elétrico",
        description: "Serviço com teste de voltagem e fiação com disjuntor apropriado.",
        price: 60.00,
        image_url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Revisão de Quadro de Distribuição de Energia",
        description: "Aperto de barramentos, balanceamento de fases e eliminação de aquecimentos.",
        price: 120.00,
        image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Oficina & Moto Peças Ceilândia",
    slug: "oficina-moto-pecas-ceilandia",
    category_slug: "servicos-gerais",
    neighborhood: "Ceilândia",
    city: "Brasília",
    state: "DF",
    cep: "72225110",
    street_address: "QNN 11 Conjunto E",
    address_number: "Lote 35",
    latitude: -15.8280,
    longitude: -48.1050,
    whatsapp: "5561985445023",
    avatar_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80",
    bio: "Revisão completa de motocicletas, troca de óleo, pneus, relação, freios e socorro mecânico em Ceilândia e Taguatinga.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 130,
    whatsapp_clicks_count: 44,
    products: [
      {
        title: "Troca de Óleo + Lubrificação de Corrente",
        description: "Óleo 10w30 / 20w50 original com checagem gratuita de pressão dos pneus.",
        price: 45.00,
        image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Kit Relação Completo Instalado (Coroa, Pinhão e Corrente)",
        description: "Aço 1045 reforçado para Titan, Fan, Bros e Ybr com mão de obra inclusa.",
        price: 130.00,
        image_url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Marido de Aluguel & Reparos Express",
    slug: "marido-aluguel-aguas-claras",
    category_slug: "servicos-gerais",
    neighborhood: "Águas Claras",
    city: "Brasília",
    state: "DF",
    cep: "71936250",
    street_address: "Avenida das Araucárias Quadra 102",
    address_number: "Ed. Studio",
    latitude: -15.8320,
    longitude: -48.0290,
    whatsapp: "5561996556024",
    avatar_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    bio: "Pequenos reparos residenciais rápidos: instalação de suporte de TV, cortinas, prateleiras, conserto de torneiras e fechaduras.",
    is_open: true,
    free_delivery: true,
    store_pickup: false,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 205,
    whatsapp_clicks_count: 72,
    products: [
      {
        title: "Instalação de Suporte de TV Articulado",
        description: "Fixação segura com nível a laser e parafusos reforçados para alvenaria ou drywall.",
        price: 80.00,
        image_url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Troca e Vedação de Torneira / Sifão de Pia",
        description: "Solução imediata para vazamentos em pias de banheiro e cozinha.",
        price: 50.00,
        image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Chaveiro & Aberturas 24h Asa Norte",
    slug: "chaveiro-24h-asa-norte",
    category_slug: "servicos-gerais",
    neighborhood: "Asa Norte",
    city: "Brasília",
    state: "DF",
    cep: "70762510",
    street_address: "CLN 312 Bloco A",
    address_number: "Loja 03",
    latitude: -15.7530,
    longitude: -47.8860,
    whatsapp: "5561991227025",
    avatar_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80",
    bio: "Abertura residencial e automotiva sem danificar fechaduras, cópias de chaves codificadas, tags de condomínio e carimbos.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 144,
    whatsapp_clicks_count: 58,
    products: [
      {
        title: "Cópia de Chave Tetra / Yalie Comum",
        description: "Feita com máquina de precisão em menos de 3 minutos.",
        price: 15.00,
        image_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Abertura de Porta Residencial Travada",
        description: "Atendimento expresso na Asa Norte com técnica profissional.",
        price: 90.00,
        image_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "SOS Climatização & Ar Samambaia",
    slug: "sos-refrigeracao-samambaia",
    category_slug: "servicos-gerais",
    neighborhood: "Samambaia",
    city: "Brasília",
    state: "DF",
    cep: "72302110",
    street_address: "QS 112 Conjunto 05",
    address_number: "Lote 02",
    latitude: -15.8810,
    longitude: -48.0870,
    whatsapp: "5561984338026",
    avatar_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
    bio: "Instalação, higienização química antibacteriana e recarga de gás para ar-condicionado split em todo o DF.",
    is_open: true,
    free_delivery: true,
    store_pickup: false,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 82,
    whatsapp_clicks_count: 26,
    products: [
      {
        title: "Higienização Completa de Ar-Condicionado Split (até 12k BTUs)",
        description: "Limpeza das turbinas, serpentina, filtros e aplicação de bactericida.",
        price: 120.00,
        image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Costura & Ajustes Finos Cruzeiro",
    slug: "costura-ajustes-cruzeiro",
    category_slug: "servicos-gerais",
    neighborhood: "Cruzeiro",
    city: "Brasília",
    state: "DF",
    cep: "70658805",
    street_address: "SHCES Quadra 805 Bloco A",
    address_number: "Loja 07",
    latitude: -15.7890,
    longitude: -47.9370,
    whatsapp: "5561996229027",
    avatar_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
    bio: "Ajuste de barras de calças jeans e alfaiataria, troca de zíperes, ajustes de vestidos de festa e ternos com rapidez e acabamento de alfaiate.",
    is_open: false,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 67,
    whatsapp_clicks_count: 18,
    products: [
      {
        title: "Bainha Original de Calça Jeans",
        description: "Mantém o acabamento desfiado de fábrica com linha reforçada.",
        price: 25.00,
        image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Pinturas & Reformas Prediais",
    slug: "pinturas-reformas-recanto",
    category_slug: "servicos-gerais",
    neighborhood: "Recanto das Emas",
    city: "Brasília",
    state: "DF",
    cep: "72610200",
    street_address: "Quadra 203 Conjunto 04",
    address_number: "Lote 11",
    latitude: -15.9120,
    longitude: -48.0680,
    whatsapp: "5561991440028",
    avatar_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80",
    bio: "Pintura residencial interna e externa, aplicação de textura, grafiato, cimento queimado e reparos em drywall.",
    is_open: true,
    free_delivery: true,
    store_pickup: false,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 53,
    whatsapp_clicks_count: 12,
    products: [
      {
        title: "Diária de Pintor Profissional (Mão de Obra)",
        description: "Preparação de paredes, lixamento e pintura com capricho e limpeza.",
        price: 180.00,
        image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },

  // ==========================================
  // MODALIDADE 5: MODA & ACESSÓRIOS
  // ==========================================
  {
    name: "Boutique Elegance Feminina",
    slug: "boutique-elegance-taguatinga",
    category_slug: "moda-acessorios",
    neighborhood: "Taguatinga",
    city: "Brasília",
    state: "DF",
    cep: "72120140",
    street_address: "QND 14 Lote 02",
    address_number: "Loja 01",
    latitude: -15.8270,
    longitude: -48.0600,
    whatsapp: "5561993221029",
    avatar_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
    bio: "Looks modernos para trabalho e lazer, vestidos fluidos, conjuntos de linho e acessórios exclusivos com entrega rápida em Taguatinga.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 190,
    whatsapp_clicks_count: 63,
    products: [
      {
        title: "Vestido Midi em Linho Puro com Cinto",
        description: "Caimento fluido, botões frontais em madeira e forro interno 100% algodão.",
        price: 149.90,
        image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Conjunto Alfaiataria Colete + Calça Pantalona",
        description: "Tecido estruturado que não amarrota fácil. Cores off-white, terracota e preto.",
        price: 199.00,
        image_url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Streetwear & Bonés Ceilândia",
    slug: "streetwear-ceilandia",
    category_slug: "moda-acessorios",
    neighborhood: "Ceilândia",
    city: "Brasília",
    state: "DF",
    cep: "72220180",
    street_address: "Shopping Popular de Ceilândia",
    address_number: "Box 140",
    latitude: -15.8160,
    longitude: -48.1130,
    whatsapp: "5561985112030",
    avatar_url: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=400&q=80",
    bio: "Camisetas oversized 100% algodão penteado 26.1, bermudas cargo, bonés de aba curva e meias estilizadas da cultura urbana do DF.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 155,
    whatsapp_clicks_count: 49,
    products: [
      {
        title: "Camiseta Oversized Minimalist Estampada",
        description: "Gola canelada de 3cm, estampa em silk screen de alta durabilidade.",
        price: 69.90,
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Boné Snapback Aba Curva Premium",
        description: "Bordado frontal em alto relevo com fecho ajustável de metal.",
        price: 55.00,
        image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Ótica & Relojoaria Conceito",
    slug: "otica-joalheria-asa-sul",
    category_slug: "moda-acessorios",
    neighborhood: "Asa Sul",
    city: "Brasília",
    state: "DF",
    cep: "70338510",
    street_address: "CLS 104 Bloco A",
    address_number: "Loja 28",
    latitude: -15.8020,
    longitude: -47.8930,
    whatsapp: "5561996113031",
    avatar_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80",
    bio: "Armações leves e modernas de acetato e titânio, óculos de sol com proteção UV400 e ajuste gratuito de armações.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 115,
    whatsapp_clicks_count: 34,
    products: [
      {
        title: "Óculos de Sol Polarizado Clássico Unissex",
        description: "Lentes escuras com proteção 100% UVA/UVB e armação resistente em policarbonato.",
        price: 119.00,
        image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Moda Praia & Fitness Gama",
    slug: "moda-praia-fitness-gama",
    category_slug: "moda-acessorios",
    neighborhood: "Gama",
    city: "Brasília",
    state: "DF",
    cep: "72430050",
    street_address: "Setor Leste Quadra 05",
    address_number: "18",
    latitude: -16.0210,
    longitude: -48.0610,
    whatsapp: "5561993444032",
    avatar_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
    bio: "Conjuntos fitness com zero transparência, tops de alta sustentação, maiôs e biquínis com proteção solar FPU 50+.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 70,
    whatsapp_clicks_count: 20,
    products: [
      {
        title: "Legging Fitness Cintura Alta Sem Transparência",
        description: "Tecido suplex poliamida com compressão na medida certa para treinos intensos.",
        price: 79.90,
        image_url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Kids & Bebê Moda Infantil",
    slug: "kids-bebe-aguas-claras",
    category_slug: "moda-acessorios",
    neighborhood: "Águas Claras",
    city: "Brasília",
    state: "DF",
    cep: "71900100",
    street_address: "Shopping Felicittà, Av. Castanheiras",
    address_number: "Piso 1",
    latitude: -15.8360,
    longitude: -48.0210,
    whatsapp: "5561981225033",
    avatar_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80",
    bio: "Roupas confortáveis de algodão egípcio para bebês e crianças de 0 a 6 anos. Bodies, macacões práticos e sapatinhos macios.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 92,
    whatsapp_clicks_count: 29,
    products: [
      {
        title: "Kit 3 Bodies Manga Curta em Algodão Pima",
        description: "Toque acetinado que não irrita a pele sensível do recém-nascido.",
        price: 89.00,
        image_url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Brechó Chic & Sustentável Riacho",
    slug: "brecho-chic-riacho-fundo",
    category_slug: "moda-acessorios",
    neighborhood: "Riacho Fundo",
    city: "Brasília",
    state: "DF",
    cep: "71810070",
    street_address: "QN 07 Conjunto 02",
    address_number: "Casa 15",
    latitude: -15.8790,
    longitude: -48.0120,
    whatsapp: "5561994336034",
    avatar_url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80",
    bio: "Peças vintage garimpadas, marcas consagradas em perfeito estado e calçados selecionados com foco em consumo consciente e sustentável.",
    is_open: false,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 48,
    whatsapp_clicks_count: 13,
    products: [
      {
        title: "Jaqueta Jeans Vintage Oversized",
        description: "Peça única dos anos 90 com lavagem estonada impecável.",
        price: 85.00,
        image_url: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },

  // ==========================================
  // MODALIDADE 6: PET & CUIDADOS
  // ==========================================
  {
    name: "Pet & Banho Carinho Animal",
    slug: "pet-banho-aguas-claras",
    category_slug: "pet-cuidados",
    neighborhood: "Águas Claras",
    city: "Brasília",
    state: "DF",
    cep: "71927180",
    street_address: "Rua 25 Sul Lote 02",
    address_number: "Loja 04",
    latitude: -15.8380,
    longitude: -48.0260,
    whatsapp: "5561991557035",
    avatar_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
    bio: "Banho quentinho com água ozonizada, tosa bebê na tesoura, hidratação de pelagem e táxi dog com busca e entrega em Águas Claras.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 220,
    whatsapp_clicks_count: 78,
    products: [
      {
        title: "Combo Banho Completo + Corte de Unhas (Porte Pequeno)",
        description: "Shampoo hipoalergênico, secagem com sopro morno, limpeza de ouvidos e perfume suave.",
        price: 55.00,
        image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Tosa Higiênica + Hidratação de Óleo de Argan",
        description: "Remoção de nós e proteção das patinhas contra ressecamento.",
        price: 45.00,
        image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Clínica & Pet Shop Amigo Fiel",
    slug: "pet-shop-amigo-fiel-asa-norte",
    category_slug: "pet-cuidados",
    neighborhood: "Asa Norte",
    city: "Brasília",
    state: "DF",
    cep: "70844510",
    street_address: "CLN 405 Bloco C",
    address_number: "Loja 22",
    latitude: -15.7680,
    longitude: -47.8790,
    whatsapp: "5561986338036",
    avatar_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
    bio: "Consultas veterinárias preventivas, vacinação importada V10 e antirrábica, além de farmácia veterinária completa na Asa Norte.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 140,
    whatsapp_clicks_count: 42,
    products: [
      {
        title: "Aplicação de Vacina Importada V10 (Canina)",
        description: "Proteção contra as 10 principais doenças infectocontagiosas caninas.",
        price: 95.00,
        image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80"
      },
      {
        title: "Ração Super Premium Cães Adultos Frango & Arroz (15kg)",
        description: "Sem corantes, rica em ômega 3 e 6 para pelagem brilhante.",
        price: 219.00,
        image_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Hotelzinho & Creche Canina Guará",
    slug: "creche-canina-guara",
    category_slug: "pet-cuidados",
    neighborhood: "Guará",
    city: "Brasília",
    state: "DF",
    cep: "71060300",
    street_address: "QE 30 Conjunto K",
    address_number: "Casa 09",
    latitude: -15.8260,
    longitude: -47.9850,
    whatsapp: "5561992449037",
    avatar_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
    bio: "Hospedagem 100% livre de baias ou jaulas. Muito espaço verde, socialização monitorada, brincadeiras e câmeras ao vivo para tutores.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: true,
    plan_tier: "free",
    views_count: 110,
    whatsapp_clicks_count: 35,
    products: [
      {
        title: "Diária de Creche / Daycare (Período Integral)",
        description: "Das 7h30 às 19h com atividades lúdicas, descanso assistido e fotos no WhatsApp.",
        price: 60.00,
        image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Rações & Acessórios Pet Taguá",
    slug: "racoes-acessorios-taguatinga",
    category_slug: "pet-cuidados",
    neighborhood: "Taguatinga",
    city: "Brasília",
    state: "DF",
    cep: "72020110",
    street_address: "QSD 11 Lote 15",
    address_number: "Loja 02",
    latitude: -15.8410,
    longitude: -48.0520,
    whatsapp: "5561995110038",
    avatar_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80",
    bio: "Rações a granel e pacotes fechados de todas as marcas com os melhores preços de Taguatinga. Brinquedos mordedores, guias e petiscos naturais.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 75,
    whatsapp_clicks_count: 23,
    products: [
      {
        title: "Guia Retrátil 5 metros com Fita Refletiva",
        description: "Para passeios com segurança e liberdade para cães de até 25kg.",
        price: 49.90,
        image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Estética Animal & SPA Lago Sul",
    slug: "spa-pet-lago-sul",
    category_slug: "pet-cuidados",
    neighborhood: "Lago Sul",
    city: "Brasília",
    state: "DF",
    cep: "71630110",
    street_address: "SHIS QI 11 Bloco F",
    address_number: "Loja 10",
    latitude: -15.8430,
    longitude: -47.8650,
    whatsapp: "5561981551039",
    avatar_url: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=400&q=80",
    bio: "Tratamento de ofurô com sais relaxantes, cauterização de pelos e escovação dental para cães e gatos em ambiente zen e silencioso.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: true,
    is_verified: true,
    plan_tier: "pro",
    views_count: 160,
    whatsapp_clicks_count: 51,
    products: [
      {
        title: "Banho Terapêutico de Ofurô com Camomila",
        description: "Relaxamento profundo para cães idosos ou estressados.",
        price: 110.00,
        image_url: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    name: "Pet & Grooming Jardim Botânico",
    slug: "pet-grooming-jardim-botanico",
    category_slug: "pet-cuidados",
    neighborhood: "Jardim Botânico",
    city: "Brasília",
    state: "DF",
    cep: "71680362",
    street_address: "Condomínio Solar de Brasília Quadra 02",
    address_number: "Comércio Local 04",
    latitude: -15.8720,
    longitude: -47.8180,
    whatsapp: "5561993222040",
    avatar_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80",
    bio: "Especialista em tosa asiática, desembolo sem dor e carinho especial com filhotes e pets idosos no Jardim Botânico e Mangueiral.",
    is_open: false,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    is_featured: false,
    is_verified: false,
    plan_tier: "free",
    views_count: 59,
    whatsapp_clicks_count: 15,
    products: [
      {
        title: "Tosa Estilizada Teddy Bear (Spitz e Poodle)",
        description: "Corte arredondado que deixa o rostinho com formato de ursinho de pelúcia.",
        price: 85.00,
        image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80"
      }
    ]
  }
];

async function runSeed() {
  console.log('--- Iniciando Povoamento da Feira Digital no Distrito Federal ---');

  // 1. Garantir um usuário autenticado no Supabase
  const email = 'seed_df_tester@feiradigital.test';
  const password = 'SenhaForte123!@#SeedDF';
  let authRes = await supabase.auth.signInWithPassword({ email, password });
  if (!authRes.data.user) {
    authRes = await supabase.auth.signUp({ email, password });
  }

  const user = authRes.data.user;
  if (!user) {
    console.error('Falha ao autenticar usuário para o seed:', authRes.error);
    process.exit(1);
  }

  console.log(`Usuário autenticado com sucesso: ${user.id} (${user.email})`);

  let createdBusinesses = 0;
  let createdProducts = 0;

  for (const item of SEED_DATA) {
    const categoryId = CATEGORY_MAP[item.category_slug];

    // Verificar se já existe pelo slug
    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', item.slug)
      .maybeSingle();

    let businessId = existingBiz ? existingBiz.id : null;

    if (!existingBiz) {
      const { data: insertedBiz, error: errBiz } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: item.name,
          slug: item.slug,
          category_id: categoryId,
          neighborhood: item.neighborhood,
          city: item.city,
          state: item.state,
          cep: item.cep,
          street_address: item.street_address,
          address_number: item.address_number,
          latitude: item.latitude,
          longitude: item.longitude,
          whatsapp: item.whatsapp,
          avatar_url: item.avatar_url,
          bio: item.bio,
          is_open: item.is_open,
          free_delivery: item.free_delivery,
          store_pickup: item.store_pickup,
          accepts_pix: item.accepts_pix,
          accepts_card: item.accepts_card,
          is_featured: item.is_featured,
          is_verified: item.is_verified,
          plan_tier: item.plan_tier,
          views_count: item.views_count,
          whatsapp_clicks_count: item.whatsapp_clicks_count,
          product_limit: 10,
        })
        .select()
        .single();

      if (errBiz) {
        console.error(`Erro ao inserir loja ${item.name}:`, errBiz.message);
        continue;
      }
      businessId = insertedBiz.id;
      createdBusinesses++;
      console.log(`✓ Loja criada: [${item.neighborhood}] ${item.name} (${item.category_slug})`);
    } else {
      console.log(`- Loja já existente: ${item.name}`);
    }

    // Inserir produtos da loja
    if (businessId && item.products && item.products.length > 0) {
      for (const prod of item.products) {
        // Checar se produto já existe
        const { data: existingProd } = await supabase
          .from('products')
          .select('id')
          .eq('business_id', businessId)
          .eq('title', prod.title)
          .maybeSingle();

        if (!existingProd) {
          const { error: errProd } = await supabase
            .from('products')
            .insert({
              business_id: businessId,
              title: prod.title,
              description: prod.description || null,
              price: prod.price,
              image_url: prod.image_url || null,
              custom_whatsapp_message: prod.custom_whatsapp_message || null,
            });

          if (errProd) {
            console.error(`  Erro ao inserir produto "${prod.title}":`, errProd.message);
          } else {
            createdProducts++;
          }
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log(`Povoamento concluído com sucesso!`);
  console.log(`Total de novas lojas criadas: ${createdBusinesses}`);
  console.log(`Total de novos produtos inseridos: ${createdProducts}`);
  console.log('======================================================');
}

runSeed();
