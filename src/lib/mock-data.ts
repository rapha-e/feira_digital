import { BusinessWithProducts, Category, Business, Product } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Alimentação & Confeitaria", slug: "alimentacao-confeitaria", icon: "Utensils" },
  { id: "cat-2", name: "Beleza & Estética", slug: "beleza-estetica", icon: "Sparkles" },
  { id: "cat-3", name: "Artesanato & Moda", slug: "artesanato-moda", icon: "Scissors" },
  { id: "cat-4", name: "Serviços & Manutenção", slug: "servicos-manutencao", icon: "Wrench" },
  { id: "cat-5", name: "Saúde & Bem-estar", slug: "saude-bem-estar", icon: "HeartPulse" },
  { id: "cat-6", name: "Pet Shop & Animais", slug: "pet-shop-animais", icon: "PawPrint" },
];

export const INITIAL_BUSINESSES: BusinessWithProducts[] = [
  {
    id: "biz-1",
    user_id: "user-1",
    name: "Doces da Vovó Elza",
    slug: "doces-da-vovo-elza",
    category_id: "cat-1",
    neighborhood: "Asa Norte",
    city: "Brasília",
    whatsapp: "5561991234567",
    avatar_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80",
    bio: "Bolos caseiros, tortas artesanais e docinhos para festas feitos com ingredientes selecionados e muito carinho.",
    is_open: true,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    views_count: 142,
    whatsapp_clicks_count: 38,
    product_limit: 5,
    category: { id: "cat-1", name: "Alimentação & Confeitaria", slug: "alimentacao-confeitaria" },
    products: [
      {
        id: "prod-1",
        business_id: "biz-1",
        title: "Bolo de Cenoura com Brigadeiro",
        description: "Massa fofinha com cobertura generosa de brigadeiro gourmet belga.",
        price: 45.0,
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
        custom_whatsapp_message: "Olá Vovó Elza! Quero pedir o *{produto}* ({preco}) fresquinho para hoje!",
      },
      {
        id: "prod-2",
        business_id: "biz-1",
        title: "Torta de Limão Siciliano",
        description: "Base crocante com recheio cremoso e merengue tostado no maçarico.",
        price: 55.0,
        image_url: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "prod-3",
        business_id: "biz-1",
        title: "Caixa com 12 Brigadeiros Gourmet",
        description: "Sabores: Tradicional, Ninho com Nutella e Pistache.",
        price: 36.0,
        image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "biz-2",
    user_id: "user-2",
    name: "Barbearia & Estilo Silva",
    slug: "barbearia-silva",
    category_id: "cat-2",
    neighborhood: "Águas Claras",
    city: "Brasília",
    whatsapp: "5561998765432",
    avatar_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80",
    bio: "Cortes modernos, barba na toalha quente e tratamentos capilares masculinos com hora marcada.",
    is_open: true,
    free_delivery: false,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: true,
    views_count: 89,
    whatsapp_clicks_count: 24,
    product_limit: 5,
    category: { id: "cat-2", name: "Beleza & Estética", slug: "beleza-estetica" },
    products: [
      {
        id: "prod-4",
        business_id: "biz-2",
        title: "Corte Masculino Degradê",
        description: "Acabamento na lâmina, lavagem e finalização com pomada modeladora.",
        price: 40.0,
        image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "prod-5",
        business_id: "biz-2",
        title: "Barboterapia Completa",
        description: "Toalha quente, hidratação com óleos essenciais e alinhamento do desenho.",
        price: 35.0,
        image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "biz-3",
    user_id: "user-3",
    name: "Studio Ateliê Crochê Criativo",
    slug: "atelie-croche-criativo",
    category_id: "cat-3",
    neighborhood: "Taguatinga",
    city: "Brasília",
    whatsapp: "5561984561234",
    avatar_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80",
    bio: "Peças decorativas em fio de malha, bolsas artesanais e amigurumis personalizados sob encomenda.",
    is_open: false,
    free_delivery: true,
    store_pickup: true,
    accepts_pix: true,
    accepts_card: false,
    views_count: 67,
    whatsapp_clicks_count: 15,
    product_limit: 5,
    category: { id: "cat-3", name: "Artesanato & Moda", slug: "artesanato-moda" },
    products: [
      {
        id: "prod-6",
        business_id: "biz-3",
        title: "Bolsa de Crochê Boho",
        description: "Feita à mão com fio ecológico premium e alça de corrente dourada.",
        price: 110.0,
        image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "prod-7",
        business_id: "biz-3",
        title: "Kit Cachepôs Decorativos (3 un)",
        description: "Perfeitos para suculentas e organização de mesa de escritório.",
        price: 50.0,
        image_url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "biz-4",
    user_id: "user-4",
    name: "SOS Manutenção Residencial",
    slug: "sos-manutencao-residencial",
    category_id: "cat-4",
    neighborhood: "Guará",
    city: "Brasília",
    whatsapp: "5561971239876",
    avatar_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80",
    bio: "Serviços rápidos de eletricista, encanador, pequenos reparos e instalação de suporte de TV e luminárias.",
    is_open: true,
    free_delivery: true,
    store_pickup: false,
    accepts_pix: true,
    accepts_card: true,
    views_count: 112,
    whatsapp_clicks_count: 41,
    product_limit: 5,
    category: { id: "cat-4", name: "Serviços & Manutenção", slug: "servicos-manutencao" },
    products: [
      {
        id: "prod-8",
        business_id: "biz-4",
        title: "Instalação de Ventilador de Teto",
        description: "Montagem, fiação elétrica e teste completo de segurança.",
        price: 90.0,
        image_url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "prod-9",
        business_id: "biz-4",
        title: "Troca de Resistência e Chuveiro",
        description: "Substituição e verificação da fiação do disjuntor.",
        price: 60.0,
        image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

export function saveMockBusiness(business: BusinessWithProducts) {
  const index = INITIAL_BUSINESSES.findIndex(
    b => b.id === business.id || b.slug === business.slug
  );
  if (index >= 0) {
    INITIAL_BUSINESSES[index] = {
      ...INITIAL_BUSINESSES[index],
      ...business,
    };
  } else {
    INITIAL_BUSINESSES.unshift(business);
  }
}

export function updateMockBusiness(businessId: string, updates: Partial<Business>) {
  const index = INITIAL_BUSINESSES.findIndex(b => b.id === businessId);
  if (index >= 0) {
    INITIAL_BUSINESSES[index] = {
      ...INITIAL_BUSINESSES[index],
      ...updates,
    };
  }
}

export function deleteMockBusiness(businessId: string) {
  const index = INITIAL_BUSINESSES.findIndex(b => b.id === businessId);
  if (index >= 0) {
    INITIAL_BUSINESSES.splice(index, 1);
  }
}

export function addMockCategory(category: Category) {
  INITIAL_CATEGORIES.push(category);
}

export function deleteMockCategory(categoryId: string) {
  const index = INITIAL_CATEGORIES.findIndex(c => c.id === categoryId);
  if (index >= 0) {
    INITIAL_CATEGORIES.splice(index, 1);
  }
}

export function updateMockCategory(categoryId: string, updates: Partial<Category>) {
  const index = INITIAL_CATEGORIES.findIndex(c => c.id === categoryId);
  if (index >= 0) {
    INITIAL_CATEGORIES[index] = {
      ...INITIAL_CATEGORIES[index],
      ...updates,
    };
  }
}

export function updateMockProduct(productId: string, updates: Partial<Product>) {
  for (const b of INITIAL_BUSINESSES) {
    const pIndex = b.products?.findIndex(p => p.id === productId);
    if (pIndex !== undefined && pIndex >= 0) {
      b.products[pIndex] = {
        ...b.products[pIndex],
        ...updates,
      };
      return;
    }
  }
}

export function deleteMockProduct(productId: string) {
  for (const b of INITIAL_BUSINESSES) {
    if (b.products) {
      const pIndex = b.products.findIndex(p => p.id === productId);
      if (pIndex >= 0) {
        b.products.splice(pIndex, 1);
        return;
      }
    }
  }
}

export function incrementMockClick(businessId: string) {
  const biz = INITIAL_BUSINESSES.find(b => b.id === businessId);
  if (biz) {
    biz.whatsapp_clicks_count = (biz.whatsapp_clicks_count || 0) + 1;
  }
}

export function incrementMockView(businessId: string) {
  const biz = INITIAL_BUSINESSES.find(b => b.id === businessId);
  if (biz) {
    biz.views_count = (biz.views_count || 0) + 1;
  }
}

