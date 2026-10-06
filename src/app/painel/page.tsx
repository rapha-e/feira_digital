"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Business, Category, Product } from "@/types";
import {
  INITIAL_CATEGORIES,
  INITIAL_BUSINESSES,
  saveMockBusiness,
} from "@/lib/mock-data";
import { formatDisplayPhone } from "@/lib/whatsapp";
import {
  Store,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Package,
  Save,
  X,
  Phone,
  MapPin,
  Eye,
  MessageCircle,
  TrendingUp,
  Zap,
  Camera,
  Share2,
  Copy,
  Check,
  Truck,
  ShoppingBag,
  QrCode,
  CreditCard,
  Sparkles,
  Layers,
  Navigation,
  Compass,
  Search,
  Loader2,
} from "lucide-react";
import { fetchAddressByCep } from "@/lib/geo";
import { fetchCnpjData, formatCnpj, mapCnaeToCategory } from "@/lib/cnpj";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { LiveStorePreview } from "@/components/LiveStorePreview";
import {
  FileText,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedSlug = searchParams.get("invitedSlug");
  const invitedName = searchParams.get("invitedName");

  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Business Form State
  const [cnpj, setCnpj] = useState("");
  const [loadingCnpjBiz, setLoadingCnpjBiz] = useState(false);
  const [profileStep, setProfileStep] = useState<1 | 2 | 3>(1);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Brasília");
  const [state, setState] = useState("DF");
  const [cep, setCep] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loadingCepBiz, setLoadingCepBiz] = useState(false);
  const [loadingGpsBiz, setLoadingGpsBiz] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [storePickup, setStorePickup] = useState(true);
  const [acceptsPix, setAcceptsPix] = useState(true);
  const [acceptsCard, setAcceptsCard] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Product Form State (Standard Modal)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState("");
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Quick POS Modal ("Estilo Maquininha - 20 segundos")
  const [isQuickPosOpen, setIsQuickPosOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriceCents, setQuickPriceCents] = useState(0); // Em centavos para máscara instantânea
  const [quickImageUrl, setQuickImageUrl] = useState("");
  const [uploadingQuickImage, setUploadingQuickImage] = useState(false);

  // Batch Products Modal (Cadastrar Vários de Uma Vez)
  interface BatchItem {
    id: string;
    title: string;
    price: string;
    imageUrl: string;
    isUploading: boolean;
  }
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchModalError, setBatchModalError] = useState<string | null>(null);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Load User & Business data
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured()) {
        const demoBiz = INITIAL_BUSINESSES[0];
        setBusiness(demoBiz);
        setName(invitedName || demoBiz.name);
        setSlug(invitedSlug || demoBiz.slug);
        setCategoryId(demoBiz.category_id || "");
        setNeighborhood(demoBiz.neighborhood);
        setCity(demoBiz.city);
        setWhatsapp(demoBiz.whatsapp);
        setBio(demoBiz.bio || "");
        setAvatarUrl(demoBiz.avatar_url || "");
        setIsOpen(demoBiz.is_open !== false);
        setFreeDelivery(Boolean(demoBiz.free_delivery));
        setStorePickup(demoBiz.store_pickup !== false);
        setAcceptsPix(demoBiz.accepts_pix !== false);
        setAcceptsCard(Boolean(demoBiz.accepts_card));
        setProducts(demoBiz.products || []);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Load Categories
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData && catData.length > 0) {
        setCategories(catData as Category[]);
        if (!categoryId) setCategoryId(catData[0].id);
      } else if (!categoryId && INITIAL_CATEGORIES.length > 0) {
        setCategoryId(INITIAL_CATEGORIES[0].id);
      }

      // Load User Business
      const { data: bizData } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (bizData) {
        const b = bizData as Business;
        setBusiness(b);
        setName(b.name);
        setSlug(b.slug);
        setCategoryId(b.category_id || "");
        setNeighborhood(b.neighborhood);
        setCity(b.city);
        setState(b.state || "DF");
        setCep(b.cep || "");
        setStreetAddress(b.street_address || "");
        setAddressNumber(b.address_number || "");
        setLatitude(b.latitude ?? null);
        setLongitude(b.longitude ?? null);
        setWhatsapp(b.whatsapp);
        setBio(b.bio || "");
        setAvatarUrl(b.avatar_url || "");
        setIsOpen(b.is_open !== false);
        setFreeDelivery(Boolean(b.free_delivery));
        setStorePickup(b.store_pickup !== false);
        setAcceptsPix(b.accepts_pix !== false);
        setAcceptsCard(Boolean(b.accepts_card));

        // Load Products
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", b.id)
          .order("created_at", { ascending: false });

        if (prodData) {
          setProducts(prodData as Product[]);
        }
      } else if (invitedSlug || invitedName) {
        // Pré-preenchimento de convite
        setName(invitedName || "");
        setSlug(invitedSlug || "");
      }

      setLoading(false);
    }

    loadData();
  }, [router, invitedSlug, invitedName]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!business) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "")
      .replace(/-+/g, "-");
    setSlug(clean);
  };

  // WhatsApp Smart Autofill / Formatter
  const handleWhatsAppChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    setWhatsapp(raw);
  };

  // Toggle rápido de Status Operacional ("Aberto / Fechado")
  const handleToggleStatus = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);

    if (!isSupabaseConfigured()) {
      if (business) {
        const updated = { ...business, is_open: newStatus };
        setBusiness(updated);
        saveMockBusiness({ ...updated, products });
      }
      setNotification({
        type: "success",
        text: newStatus
          ? "Vitrine marcada como ABERTA no WhatsApp!"
          : "Vitrine marcada como FECHADA no momento.",
      });
      return;
    }

    if (!business) return;

    try {
      const supabase = createClient();
      await supabase
        .from("businesses")
        .update({ is_open: newStatus })
        .eq("id", business.id);

      setBusiness({ ...business, is_open: newStatus });
      setNotification({
        type: "success",
        text: newStatus
          ? "Vitrine marcada como ABERTA no WhatsApp!"
          : "Vitrine marcada como FECHADA no momento.",
      });
    } catch {
      setNotification({
        type: "error",
        text: "Erro ao atualizar status operacional.",
      });
    }
  };

  // Upload Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured()) {
      const reader = new FileReader();
      reader.onload = event => {
        setAvatarUrl(event.target?.result as string);
        setNotification({ type: "success", text: "Foto atualizada (Modo Demonstração)!" });
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploadingAvatar(true);
    const supabase = createClient();
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("vitrine")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("vitrine").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setNotification({ type: "success", text: "Foto enviada com sucesso!" });
    } catch (err: unknown) {
      const error = err as Error;
      setNotification({
        type: "error",
        text: `Erro ao enviar imagem: ${error.message}`,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Busca e preenchimento inteligente de dados via CNPJ (Receita Federal / BrasilAPI)
  const handleSearchCnpjProfile = async () => {
    if (!cnpj.trim()) return;
    setLoadingCnpjBiz(true);
    try {
      const data = await fetchCnpjData(cnpj);
      if (data) {
        if (!name.trim() || name === "Meu Negócio") {
          setName(data.name);
          setSlug(data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        }
        if (data.cep) setCep(data.cep);
        if (data.streetAddress) setStreetAddress(data.streetAddress);
        if (data.addressNumber) setAddressNumber(data.addressNumber);
        if (data.neighborhood) setNeighborhood(data.neighborhood);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        if (data.phone && !whatsapp) {
          setWhatsapp(data.phone.replace(/\D/g, ""));
        }

        // Auto-selecionar categoria correspondente ao CNAE
        if (data.cnaeDescription) {
          const suggestedSlug = mapCnaeToCategory(data.cnaeDescription);
          if (suggestedSlug) {
            const foundCat = categories.find(c => c.slug === suggestedSlug);
            if (foundCat) setCategoryId(foundCat.id);
          }
        }

        // Tentar obter coordenadas a partir do CEP retornado
        if (data.cep) {
          const addr = await fetchAddressByCep(data.cep);
          if (addr?.lat && addr?.lng) {
            setLatitude(addr.lat);
            setLongitude(addr.lng);
          }
        }

        setNotification({
          type: "success",
          text: `Dados da empresa "${data.name}" preenchidos via Receita Federal!`,
        });
      } else {
        setNotification({
          type: "error",
          text: "CNPJ não encontrado ou inválido. Preencha os campos manualmente se desejar.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: "Erro ao consultar dados do CNPJ.",
      });
    } finally {
      setLoadingCnpjBiz(false);
    }
  };

  // Auto-Save de rascunho em LocalStorage para segurança contra perdas
  useEffect(() => {
    if (loading || business) return;
    const draft = {
      name,
      slug,
      cnpj,
      categoryId,
      neighborhood,
      city,
      state,
      cep,
      streetAddress,
      addressNumber,
      latitude,
      longitude,
      whatsapp,
      bio,
    };
    try {
      localStorage.setItem("feira_draft_profile", JSON.stringify(draft));
    } catch {}
  }, [
    name,
    slug,
    cnpj,
    categoryId,
    neighborhood,
    city,
    state,
    cep,
    streetAddress,
    addressNumber,
    latitude,
    longitude,
    whatsapp,
    bio,
    loading,
    business,
  ]);

  // Recuperação de Rascunho inicial
  useEffect(() => {
    if (!loading && !business && !draftRestored) {
      try {
        const saved = localStorage.getItem("feira_draft_profile");
        if (saved) {
          const p = JSON.parse(saved);
          if (p.name && !name) {
            setName(p.name || "");
            setSlug(p.slug || "");
            setCnpj(p.cnpj || "");
            if (p.categoryId) setCategoryId(p.categoryId);
            if (p.neighborhood) setNeighborhood(p.neighborhood);
            if (p.city) setCity(p.city);
            if (p.state) setState(p.state);
            if (p.cep) setCep(p.cep);
            if (p.streetAddress) setStreetAddress(p.streetAddress);
            if (p.addressNumber) setAddressNumber(p.addressNumber);
            if (p.latitude) setLatitude(p.latitude);
            if (p.longitude) setLongitude(p.longitude);
            if (p.whatsapp) setWhatsapp(p.whatsapp);
            if (p.bio) setBio(p.bio);
            setDraftRestored(true);
            setNotification({
              type: "success",
              text: "Rascunho de loja restaurado automaticamente do seu navegador!",
            });
          }
        }
      } catch {}
    }
  }, [loading, business, draftRestored]);

  // RF02: Busca de CEP com Auto-preenchimento e Geocodificação
  const handleSearchCepProfile = async () => {
    if (!cep.trim()) return;
    setLoadingCepBiz(true);
    try {
      const addr = await fetchAddressByCep(cep);
      if (addr) {
        if (addr.street) setStreetAddress(addr.street);
        if (addr.neighborhood) setNeighborhood(addr.neighborhood);
        if (addr.city) setCity(addr.city);
        if (addr.state) setState(addr.state);
        if (addr.lat && addr.lng) {
          setLatitude(addr.lat);
          setLongitude(addr.lng);
        }
        setNotification({
          type: "success",
          text: "Endereço e coordenadas identificados pelo CEP!",
        });
      } else {
        setNotification({
          type: "error",
          text: "CEP não encontrado. Preencha os campos manualmente.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: "Erro ao buscar dados do CEP.",
      });
    } finally {
      setLoadingCepBiz(false);
    }
  };

  // RF02: Captura GPS exata do MEI
  const handleGetGpsProfile = () => {
    if (!navigator.geolocation) {
      setNotification({
        type: "error",
        text: "Geolocalização não suportada no seu navegador.",
      });
      return;
    }
    setLoadingGpsBiz(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLoadingGpsBiz(false);
        setNotification({
          type: "success",
          text: `Coordenadas capturadas: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
      },
      () => {
        setLoadingGpsBiz(false);
        setNotification({
          type: "error",
          text: "Não foi possível obter sua posição via GPS.",
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Save / Update Business Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const cleanPhone = whatsapp.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 || cleanPhone.length === 11
      ? `55${cleanPhone}`
      : cleanPhone;

    const geoPayload = {
      cep: cep.trim() || null,
      street_address: streetAddress.trim() || null,
      address_number: addressNumber.trim() || null,
      state: state.trim() || "DF",
      latitude: latitude !== null ? Number(latitude) : null,
      longitude: longitude !== null ? Number(longitude) : null,
    };

    if (!isSupabaseConfigured()) {
      const newId = business?.id || `biz-${Date.now()}`;
      const newSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const updatedPayload: Business = {
        id: newId,
        user_id: business?.user_id || `user-${Date.now()}`,
        name: name.trim(),
        slug: newSlug,
        category_id: categoryId || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        ...geoPayload,
        whatsapp: formattedPhone,
        bio: bio.trim(),
        avatar_url: avatarUrl || null,
        is_open: isOpen,
        free_delivery: freeDelivery,
        store_pickup: storePickup,
        accepts_pix: acceptsPix,
        accepts_card: acceptsCard,
        views_count: business?.views_count || 142,
        whatsapp_clicks_count: business?.whatsapp_clicks_count || 38,
        product_limit: business?.product_limit || 5,
        category: categories.find(c => c.id === categoryId),
      };
      setBusiness(updatedPayload);
      setSlug(newSlug);
      saveMockBusiness({
        ...updatedPayload,
        products: products,
      });
      setNotification({
        type: "success",
        text: business
          ? "Perfil atualizado com sucesso!"
          : "Vitrine cadastrada com sucesso! Agora cadastre seus produtos.",
      });
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          user_id: user.id,
          name: name.trim(),
          slug: slug.trim(),
          category_id: categoryId || null,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          ...geoPayload,
          whatsapp: formattedPhone,
          bio: bio.trim(),
          avatar_url: avatarUrl || null,
          is_open: isOpen,
          free_delivery: freeDelivery,
          store_pickup: storePickup,
          accepts_pix: acceptsPix,
          accepts_card: acceptsCard,
        };

        if (business) {
          const { error } = await supabase
            .from("businesses")
            .update(payload)
            .eq("id", business.id);

          if (error) throw error;
          setBusiness({ ...business, ...payload });
          setNotification({ type: "success", text: "Perfil atualizado com sucesso!" });
        } else {
          const { data, error } = await supabase
            .from("businesses")
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          setBusiness(data as Business);
          setNotification({
            type: "success",
            text: "Vitrine criada! Agora você já pode cadastrar seus produtos.",
          });
        }
      } catch (err: unknown) {
        const error = err as Error;
        setNotification({
          type: "error",
          text: error.message || "Erro ao salvar informações do negócio.",
        });
      }
    });
  };

  // Upload Product Image Helper
  const uploadImageFile = async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vitrine")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("vitrine").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Standard Product Image Input
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImage(true);
    try {
      const url = await uploadImageFile(file);
      setProductImageUrl(url);
    } catch (err: unknown) {
      const error = err as Error;
      setNotification({
        type: "error",
        text: `Erro ao enviar imagem: ${error.message}`,
      });
    } finally {
      setUploadingProductImage(false);
    }
  };

  // Open Standard Product Modal
  const openAddProductModal = () => {
    const maxLimit = business?.product_limit || 5;
    if (products.length >= maxLimit) {
      setNotification({
        type: "error",
        text: `Limite de ${maxLimit} produtos atingido no catálogo deste plano inicial.`,
      });
      return;
    }
    setEditingProductId(null);
    setProductTitle("");
    setProductDescription("");
    setProductPrice("");
    setProductImageUrl("");
    setCustomWhatsAppMessage("");
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductTitle(product.title);
    setProductDescription(product.description || "");
    setProductPrice(product.price.toString());
    setProductImageUrl(product.image_url || "");
    setCustomWhatsAppMessage(product.custom_whatsapp_message || "");
    setIsProductModalOpen(true);
  };

  // Save Standard Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) {
      setNotification({
        type: "error",
        text: "Primeiro salve os dados do negócio antes de adicionar produtos.",
      });
      return;
    }

    const priceNum = parseFloat(productPrice.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      setNotification({ type: "error", text: "Insira um preço válido para o produto." });
      return;
    }

    const maxLimit = business.product_limit || 5;

    if (!isSupabaseConfigured()) {
      if (editingProductId) {
        const updatedProds = products.map(p =>
          p.id === editingProductId
            ? {
                ...p,
                title: productTitle.trim(),
                description: productDescription.trim(),
                price: priceNum,
                image_url: productImageUrl || null,
                custom_whatsapp_message: customWhatsAppMessage.trim() || null,
              }
            : p
        );
        setProducts(updatedProds);
        saveMockBusiness({ ...business, products: updatedProds });
        setNotification({ type: "success", text: "Produto atualizado com sucesso!" });
      } else {
        if (products.length >= maxLimit) {
          setNotification({
            type: "error",
            text: `Limite de ${maxLimit} produtos atingido no catálogo.`,
          });
          return;
        }

        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          business_id: business.id,
          title: productTitle.trim(),
          description: productDescription.trim(),
          price: priceNum,
          image_url: productImageUrl || null,
          custom_whatsapp_message: customWhatsAppMessage.trim() || null,
          created_at: new Date().toISOString(),
        };

        const updatedProds = [newProduct, ...products];
        setProducts(updatedProds);
        saveMockBusiness({ ...business, products: updatedProds });
        setNotification({ type: "success", text: "Produto adicionado ao catálogo!" });
      }

      setIsProductModalOpen(false);
      return;
    }

    const supabase = createClient();
    startTransition(async () => {
      try {
        if (editingProductId) {
          const { error } = await supabase
            .from("products")
            .update({
              title: productTitle.trim(),
              description: productDescription.trim(),
              price: priceNum,
              image_url: productImageUrl || null,
              custom_whatsapp_message: customWhatsAppMessage.trim() || null,
            })
            .eq("id", editingProductId);

          if (error) throw error;

          setProducts(
            products.map(p =>
              p.id === editingProductId
                ? {
                    ...p,
                    title: productTitle.trim(),
                    description: productDescription.trim(),
                    price: priceNum,
                    image_url: productImageUrl || null,
                    custom_whatsapp_message: customWhatsAppMessage.trim() || null,
                  }
                : p
            )
          );
          setNotification({ type: "success", text: "Produto atualizado!" });
        } else {
          const { data, error } = await supabase
            .from("products")
            .insert({
              business_id: business.id,
              title: productTitle.trim(),
              description: productDescription.trim(),
              price: priceNum,
              image_url: productImageUrl || null,
              custom_whatsapp_message: customWhatsAppMessage.trim() || null,
            })
            .select()
            .single();

          if (error) throw error;
          setProducts([data as Product, ...products]);
          setNotification({ type: "success", text: "Produto adicionado ao catálogo!" });
        }

        setIsProductModalOpen(false);
      } catch (err: unknown) {
        const error = err as Error;
        setNotification({
          type: "error",
          text: error.message || "Erro ao salvar produto.",
        });
      }
    });
  };

  // --- PILAR 5: CADASTRO RELÂMPAGO ESTILO MAQUININHA (20 SEGUNDOS) ---
  const openQuickPos = () => {
    const maxLimit = business?.product_limit || 5;
    if (products.length >= maxLimit) {
      setNotification({
        type: "error",
        text: `Limite de ${maxLimit} produtos atingido no catálogo.`,
      });
      return;
    }
    setQuickTitle("");
    setQuickPriceCents(0);
    setQuickImageUrl("");
    setIsQuickPosOpen(true);
  };

  const handleQuickImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQuickImage(true);
    try {
      const url = await uploadImageFile(file);
      setQuickImageUrl(url);
    } catch (err: unknown) {
      const error = err as Error;
      setNotification({
        type: "error",
        text: `Erro ao capturar foto: ${error.message}`,
      });
    } finally {
      setUploadingQuickImage(false);
    }
  };

  const handleQuickPriceKey = (digit: string) => {
    if (digit === "BACKSPACE") {
      setQuickPriceCents(prev => Math.floor(prev / 10));
      return;
    }
    if (digit === "CLEAR") {
      setQuickPriceCents(0);
      return;
    }
    const num = parseInt(digit, 10);
    if (!isNaN(num)) {
      setQuickPriceCents(prev => {
        if (prev > 999999) return prev; // teto razoável
        return prev * 10 + num;
      });
    }
  };

  const formattedQuickPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(quickPriceCents / 100);

  const handlePublishQuickProduct = async () => {
    if (!business) {
      setNotification({
        type: "error",
        text: "Primeiro salve as informações do negócio.",
      });
      return;
    }

    if (!quickTitle.trim()) {
      setNotification({
        type: "error",
        text: "Informe o nome do produto.",
      });
      return;
    }

    const priceNum = quickPriceCents / 100;
    if (priceNum <= 0) {
      setNotification({
        type: "error",
        text: "Digite um preço maior que zero.",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        business_id: business.id,
        title: quickTitle.trim(),
        description: null,
        price: priceNum,
        image_url: quickImageUrl || null,
        created_at: new Date().toISOString(),
      };
      const updatedProds = [newProduct, ...products];
      setProducts(updatedProds);
      saveMockBusiness({ ...business, products: updatedProds });
      setIsQuickPosOpen(false);
      setNotification({
        type: "success",
        text: "⚡ Produto publicado em tempo recorde!",
      });
      return;
    }

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          business_id: business.id,
          title: quickTitle.trim(),
          description: null,
          price: priceNum,
          image_url: quickImageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      setProducts([data as Product, ...products]);
      setIsQuickPosOpen(false);
      setNotification({
        type: "success",
        text: "⚡ Produto publicado com sucesso na sua vitrine!",
      });
    } catch (err: unknown) {
      const error = err as Error;
      setNotification({
        type: "error",
        text: error.message || "Erro ao publicar produto rápido.",
      });
    }
  };

  // --- CADASTRO EM LOTE (VÁRIOS PRODUTOS DE UMA VEZ) ---
  const openBatchModal = () => {
    const maxLimit = business?.product_limit || 5;
    const remainingSlots = maxLimit - products.length;

    if (remainingSlots <= 0) {
      setNotification({
        type: "error",
        text: `Limite de ${maxLimit} produtos atingido. Exclua itens ou aumente seu plano para adicionar mais.`,
      });
      return;
    }

    setBatchModalError(null);
    const initialRowsCount = Math.min(3, remainingSlots);
    const initialRows: BatchItem[] = Array.from({ length: initialRowsCount }, (_, i) => ({
      id: `batch-${Date.now()}-${i}`,
      title: "",
      price: "",
      imageUrl: "",
      isUploading: false,
    }));

    setBatchItems(initialRows);
    setIsBatchModalOpen(true);
  };

  const addBatchRow = () => {
    const maxLimit = business?.product_limit || 5;
    if (products.length + batchItems.length >= maxLimit) {
      setBatchModalError(`Você pode cadastrar no máximo ${maxLimit - products.length} novos itens agora.`);
      return;
    }

    setBatchItems(prev => [
      ...prev,
      {
        id: `batch-${Date.now()}-${prev.length}`,
        title: "",
        price: "",
        imageUrl: "",
        isUploading: false,
      },
    ]);
  };

  const removeBatchRow = (id: string) => {
    if (batchItems.length <= 1) return;
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBatchItem = (id: string, field: "title" | "price" | "imageUrl", value: string) => {
    setBatchItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleBatchImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isUploading: true } : item))
    );

    try {
      const url = await uploadImageFile(file);
      setBatchItems(prev =>
        prev.map(item => (item.id === id ? { ...item, imageUrl: url, isUploading: false } : item))
      );
    } catch {
      setBatchItems(prev =>
        prev.map(item => (item.id === id ? { ...item, isUploading: false } : item))
      );
    }
  };

  const handleSaveBatchProducts = async () => {
    setBatchModalError(null);
    setIsSavingBatch(true);

    try {
      const validItems = batchItems.filter(
        item => item.title.trim().length > 0 && item.price.trim().length > 0
      );

      if (validItems.length === 0) {
        setBatchModalError("Preencha o nome e o preço de pelo menos um produto para cadastrar.");
        setIsSavingBatch(false);
        return;
      }

      let currentBusiness = business;

      // Se o usuário ainda não salvou a loja no formulário, inicializa automaticamente agora:
      if (!currentBusiness) {
        const bizName = name.trim() || invitedName || "Meu Negócio";
        const bizSlug =
          slug.trim() ||
          invitedSlug ||
          bizName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        const cleanPhone = whatsapp.replace(/\D/g, "");
        const formattedPhone =
          cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

        if (!isSupabaseConfigured()) {
          currentBusiness = {
            id: `biz-${Date.now()}`,
            user_id: `user-${Date.now()}`,
            name: bizName,
            slug: bizSlug,
            category_id: categoryId || categories[0]?.id || null,
            neighborhood: neighborhood.trim() || "Bairro Principal",
            city: city.trim() || "Brasília",
            whatsapp: formattedPhone || "5561999999999",
            bio: bio.trim() || null,
            avatar_url: avatarUrl || null,
            is_open: isOpen,
            free_delivery: freeDelivery,
            store_pickup: storePickup,
            accepts_pix: acceptsPix,
            accepts_card: acceptsCard,
            views_count: 0,
            whatsapp_clicks_count: 0,
            product_limit: 5,
            category: categories.find(c => c.id === categoryId) || categories[0],
          };
          setBusiness(currentBusiness);
          setName(bizName);
          setSlug(bizSlug);
          saveMockBusiness({ ...currentBusiness, products: [] });
        } else {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setBatchModalError("Você precisa estar autenticado. Faça login para continuar.");
            setIsSavingBatch(false);
            return;
          }

          const { data: createdBiz, error: createBizError } = await supabase
            .from("businesses")
            .insert({
              user_id: user.id,
              name: bizName,
              slug: bizSlug,
              category_id: categoryId || categories[0]?.id || null,
              neighborhood: neighborhood.trim() || "Bairro Principal",
              city: city.trim() || "Brasília",
              whatsapp: formattedPhone || "5561999999999",
              bio: bio.trim() || null,
              avatar_url: avatarUrl || null,
              is_open: isOpen,
              free_delivery: freeDelivery,
              store_pickup: storePickup,
              accepts_pix: acceptsPix,
              accepts_card: acceptsCard,
            })
            .select()
            .single();

          if (createBizError) {
            throw new Error(`Erro ao inicializar perfil da loja: ${createBizError.message}`);
          }

          currentBusiness = createdBiz as Business;
          setBusiness(currentBusiness);
          setName(bizName);
          setSlug(bizSlug);
        }
      }

      const maxLimit = currentBusiness.product_limit || 5;
      if (products.length + validItems.length > maxLimit) {
        setBatchModalError(
          `Limite de ${maxLimit} produtos atingido. Você pode cadastrar até ${maxLimit - products.length} novos itens.`
        );
        setIsSavingBatch(false);
        return;
      }

      const newProductsToInsert = validItems.map(item => ({
        business_id: currentBusiness!.id,
        title: item.title.trim(),
        description: null,
        price: parseFloat(item.price.replace(",", ".")) || 0,
        image_url: item.imageUrl || null,
        created_at: new Date().toISOString(),
      }));

      if (!isSupabaseConfigured()) {
        const formattedMock = newProductsToInsert.map((p, idx) => ({
          ...p,
          id: `prod-${Date.now()}-${idx}`,
        }));
        const updatedList = [...formattedMock, ...products];
        setProducts(updatedList);
        saveMockBusiness({ ...currentBusiness, products: updatedList });
        setIsBatchModalOpen(false);
        setNotification({
          type: "success",
          text: `🎉 ${validItems.length} produtos cadastrados de uma vez com sucesso!`,
        });
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .insert(newProductsToInsert)
        .select();

      if (error) throw error;

      setProducts([...(data as Product[]), ...products]);
      setIsBatchModalOpen(false);
      setNotification({
        type: "success",
        text: `🎉 ${validItems.length} produtos cadastrados de uma só vez na sua vitrine!`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setBatchModalError(error.message || "Erro ao publicar produtos em lote.");
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja remover este produto da sua vitrine?")) {
      return;
    }

    if (!isSupabaseConfigured()) {
      const updatedProds = products.filter(p => p.id !== productId);
      setProducts(updatedProds);
      if (business) {
        saveMockBusiness({ ...business, products: updatedProds });
      }
      setNotification({ type: "success", text: "Produto removido com sucesso." });
      return;
    }

    const supabase = createClient();
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        setProducts(products.filter(p => p.id !== productId));
        setNotification({ type: "success", text: "Produto removido com sucesso." });
      } catch (err: unknown) {
        const error = err as Error;
        setNotification({
          type: "error",
          text: error.message || "Erro ao deletar produto.",
        });
      }
    });
  };

  // --- CHECKLIST DE ATIVAÇÃO / ONBOARDING GUIDED BAR (PILAR 1) ---
  const step1_profile = Boolean(business && name && slug);
  const step2_categoryAndLocation = Boolean(categoryId && neighborhood);
  const step3_firstProduct = Boolean(products.length > 0);
  const step4_whatsappReady = Boolean(whatsapp && whatsapp.length >= 10);

  const completedStepsCount = [
    step1_profile,
    step2_categoryAndLocation,
    step3_firstProduct,
    step4_whatsappReady,
  ].filter(Boolean).length;

  const onboardingPercentage = completedStepsCount * 25;

  const copyStoreLink = () => {
    if (!business?.slug) return;
    const url = `${window.location.origin}/${business.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyInviteLink = () => {
    const inviteSlug = business?.slug || "meu-negocio";
    const url = `${window.location.origin}/convite/${inviteSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const viewsCount = business?.views_count || (isSupabaseConfigured() ? 0 : 142);
  const clicksCount = business?.whatsapp_clicks_count || (isSupabaseConfigured() ? 0 : 38);
  const conversionRate = viewsCount > 0 ? ((clicksCount / viewsCount) * 100).toFixed(1) : "0";
  const productLimit = business?.product_limit || 5;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-stone-900 tracking-tight">
              Feira<span className="text-emerald-600">Painel</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Status Operacional Toggle Direto no Topo (Pilar 2) */}
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isOpen
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
              }`}
              title="Clique para alternar se você está atendendo no WhatsApp agora"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? "bg-green-500 animate-pulse" : "bg-stone-400"
                }`}
              />
              <span className="hidden sm:inline">
                {isOpen ? "Aberto no Whats" : "Fechado no momento"}
              </span>
              <span className="sm:hidden">{isOpen ? "Aberto" : "Fechado"}</span>
            </button>

            {/* Botão de Prévia ao Vivo em Tela de Celular */}
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
              title="Visualizar como os clientes veem sua loja no celular"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Prévia no Celular</span>
            </button>

            {business?.slug && (
              <button
                onClick={copyStoreLink}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                title="Copiar link da minha vitrine"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span className="hidden sm:inline">Copiar Link</span>
              </button>
            )}

            {business?.slug && (
              <Link
                href={`/${business.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                <span>Ver Vitrine</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Demo Mode Notice */}
        {!isSupabaseConfigured() && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Modo Demonstração Ativo (Local)</span>
              <span className="text-amber-800 leading-relaxed">
                As variáveis do Supabase ainda não foram configuradas no arquivo{" "}
                <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono text-[11px]">
                  .env.local
                </code>
                . Você pode testar todas as funcionalidades (cadastro relâmpago, métricas, edição e status) de forma 100% interativa.
              </span>
            </div>
          </div>
        )}

        {/* Alerts / Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- PILAR 1: CHECKLIST DE ATIVAÇÃO / ONBOARDING GAMIFICADO --- */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Checklist de Ativação do Empreendedor</span>
              </h2>
              <p className="text-xs text-stone-500">
                Complete as 4 etapas para deixar sua vitrine 100% pronta para receber clientes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {onboardingPercentage}% Concluído
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${onboardingPercentage}%` }}
            />
          </div>

          {/* 4 Checklist Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                step1_profile
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  step1_profile ? "bg-emerald-600 text-white" : "bg-stone-300 text-stone-600"
                }`}
              >
                {step1_profile ? <Check className="w-2.5 h-2.5" /> : "1"}
              </div>
              <span className="font-semibold truncate">1. Perfil da Loja</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                step2_categoryAndLocation
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  step2_categoryAndLocation
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-300 text-stone-600"
                }`}
              >
                {step2_categoryAndLocation ? <Check className="w-2.5 h-2.5" /> : "2"}
              </div>
              <span className="font-semibold truncate">2. Bairro & Categoria</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                step3_firstProduct
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  step3_firstProduct ? "bg-emerald-600 text-white" : "bg-stone-300 text-stone-600"
                }`}
              >
                {step3_firstProduct ? <Check className="w-2.5 h-2.5" /> : "3"}
              </div>
              <span className="font-semibold truncate">3. Primeiro Produto</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                step4_whatsappReady
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  step4_whatsappReady ? "bg-emerald-600 text-white" : "bg-stone-300 text-stone-600"
                }`}
              >
                {step4_whatsappReady ? <Check className="w-2.5 h-2.5" /> : "4"}
              </div>
              <span className="font-semibold truncate">4. WhatsApp Ativo</span>
            </div>
          </div>
        </section>

        {/* --- PILAR 3: MÉTRICAS DE SUCESSO (RETENÇÃO E VALOR) --- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 block truncate">
                Visualizações da Vitrine
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-stone-900">
                {viewsCount}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 block truncate">
                Cliques no WhatsApp
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-stone-900">
                {clicksCount}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 block truncate">
                Taxa de Conversão
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700">
                {conversionRate}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 block truncate">
                Cota do Catálogo
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-stone-900">
                {products.length}/{productLimit} itens
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Section 1: Business Profile Management (Stepper em 3 Passos) */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Dados do Negócio (Perfil MEI)</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Etapa {profileStep} de 3
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  Preenchimento dinâmico, seguro e guiado passo a passo
                </p>
              </div>

              {/* Botão de Auto-Save status */}
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-50 px-2 py-1 rounded-md border border-stone-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Rascunho salvo</span>
              </div>
            </div>

            {/* Abas / Stepper Navigation Header */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setProfileStep(1)}
                className={`py-2 px-1 rounded-lg transition-all text-center truncate cursor-pointer ${
                  profileStep === 1
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                1. Identidade
              </button>
              <button
                type="button"
                onClick={() => setProfileStep(2)}
                className={`py-2 px-1 rounded-lg transition-all text-center truncate cursor-pointer ${
                  profileStep === 2
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                2. Endereço
              </button>
              <button
                type="button"
                onClick={() => setProfileStep(3)}
                className={`py-2 px-1 rounded-lg transition-all text-center truncate cursor-pointer ${
                  profileStep === 3
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                3. Operação
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* === ETAPA 1: IDENTIDADE & CNPJ INTELIGENTE === */}
              {profileStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Caixa de Busca Inteligente por CNPJ */}
                  <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Preenchimento Automático por CNPJ (Opcional)</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Receita Federal
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Digite o CNPJ do seu MEI para preencher nome, endereço, categoria e dados em 1 segundo.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cnpj}
                        onChange={e => setCnpj(formatCnpj(e.target.value))}
                        onBlur={handleSearchCnpjProfile}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={handleSearchCnpjProfile}
                        disabled={loadingCnpjBiz || !cnpj}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        {loadingCnpjBiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Buscando...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5" />
                            <span>Consultar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Foto de Perfil / Logotipo com Otimização WebP */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Foto de Perfil / Logotipo da Loja
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 shadow-2xs">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Logo do negócio"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Store className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 py-2 px-3.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs">
                          <Upload className="w-4 h-4 text-stone-500" />
                          <span>{uploadingAvatar ? "Otimizando foto..." : "Escolher Imagem"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-stone-400">
                          ⚡ Imagens são compactadas em WebP no navegador para carregar instantaneamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nome do Negócio */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Nome da Loja / Empreendimento *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="Ex: Ateliê Doce Sabor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                    />
                  </div>

                  {/* Link Único da Loja (Slug) com Live Feedback */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>Link Exclusivo da Sua Vitrine</span>
                      {slug && (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Link disponível
                        </span>
                      )}
                    </label>
                    <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                      <span className="px-3 text-xs text-stone-500 bg-stone-100/80 py-2.5 border-r border-stone-200 select-none">
                        feiradigital.com/
                      </span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={e => handleSlugChange(e.target.value)}
                        placeholder="atelie-doce-sabor"
                        className="w-full px-3 py-2.5 bg-transparent text-stone-900 text-sm focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Categoria Principal *
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Biografia */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Biografia / Apresentação Rápida
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre seus produtos, especialidades e diferenciais..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                    />
                  </div>

                  {/* Navegação Etapa 1 */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileStep(2)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      <span>Continuar para Endereço & Localização</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* === ETAPA 2: LOCALIZAÇÃO & ENDEREÇO ESTRUTURADO === */}
              {profileStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          Localização e Endereço do Empreendimento
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Usado para priorizar sua vitrine para clientes num raio de até 10 km
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGetGpsProfile}
                        disabled={loadingGpsBiz}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {loadingGpsBiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Obtendo GPS...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5" />
                            Usar Meu GPS Atual
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          CEP (com busca automática)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cep}
                            onChange={e => setCep(e.target.value)}
                            onBlur={handleSearchCepProfile}
                            placeholder="Ex: 70000-000"
                            maxLength={9}
                            className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleSearchCepProfile}
                            disabled={loadingCepBiz}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                            title="Buscar CEP"
                          >
                            {loadingCepBiz ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Logradouro / Rua
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={e => setStreetAddress(e.target.value)}
                          placeholder="Ex: Rua das Flores, Bloco B"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={addressNumber}
                          onChange={e => setAddressNumber(e.target.value)}
                          placeholder="Ex: 120"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          required
                          value={neighborhood}
                          onChange={e => setNeighborhood(e.target.value)}
                          placeholder="Ex: Centro"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="Ex: Brasília"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Estado (UF)
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={e => setState(e.target.value.toUpperCase())}
                          maxLength={2}
                          placeholder="DF"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Coordenadas: Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={latitude !== null ? latitude : ""}
                          onChange={e => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Ex: -15.7942"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Coordenadas: Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={longitude !== null ? longitude : ""}
                          onChange={e => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Ex: -47.8822"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {latitude !== null && longitude !== null ? (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                        ✓ Coordenadas ativas (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Clientes em raio de 5 a 10 km encontrarão você com prioridade!
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                        ⚠️ Digite o CEP ou clique em "Usar Meu GPS Atual" para habilitar a busca por proximidade em tempo real.
                      </p>
                    )}
                  </div>

                  {/* Navegação Etapa 2 */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileStep(1)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileStep(3)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      <span>Continuar para Atendimento & Modalidades</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* === ETAPA 3: ATENDIMENTO & MODALIDADES OPERACIONAIS === */}
              {profileStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* WhatsApp com Auto-Preenchimento e Formatação Amigável (Pilar 1) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Número do WhatsApp para Receber Pedidos *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={e => handleWhatsAppChange(e.target.value)}
                        placeholder="DDD + Número (ex: 61999999999)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                      />
                    </div>
                    {whatsapp && (
                      <p className="text-[11px] text-stone-500 mt-1">
                        Exibição: <strong>{formatDisplayPhone(whatsapp)}</strong>
                      </p>
                    )}
                  </div>

                  {/* Modalidades de Entrega & Pagamento (Pilar 2) */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <label className="block text-xs font-bold text-stone-800">
                      Tags e Modalidades da Loja (Visíveis na Vitrine)
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={freeDelivery}
                          onChange={e => setFreeDelivery(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Entrega Grátis</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={storePickup}
                          onChange={e => setStorePickup(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>Retirada no Local</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptsPix}
                          onChange={e => setAcceptsPix(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Aceita Pix</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptsCard}
                          onChange={e => setAcceptsCard(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>Aceita Cartão</span>
                      </label>
                    </div>
                  </div>

                  {/* Navegação Etapa 3 & Botão Salvar Perfil */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileStep(2)}
                      className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isPending ? "Salvando..." : "Salvar Perfil da Vitrine"}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Modo Convidar Outro Empreendedor (Pilar 1 - Link Mágico) */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs text-stone-500">
              <span className="truncate">Convide um amigo para a Feira:</span>
              <button
                type="button"
                onClick={copyInviteLink}
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors cursor-pointer"
              >
                {copiedInvite ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Share2 className="w-3 h-3 text-stone-400" />
                )}
                <span>Copiar Link Mágico</span>
              </button>
            </div>
          </section>

          {/* Section 2: Product Catalog & Fast POS */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Catálogo de Produtos</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {products.length}/{productLimit} itens
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  Cadastre itens com foto, preço e mensagem direta para o WhatsApp.
                </p>
              </div>

              {/* Botões de Ação para Produtos */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* BOTÃO CADASTRO EM LOTE (VÁRIOS DE UMA VEZ) */}
                <button
                  type="button"
                  onClick={openBatchModal}
                  disabled={products.length >= productLimit}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  title="Cadastre múltiplos produtos de uma só vez"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Vários de Uma Vez</span>
                </button>

                {/* BOTÃO ESTILO MAQUININHA (PILAR 5 - 20 SEGUNDOS) */}
                <button
                  type="button"
                  onClick={openQuickPos}
                  disabled={products.length >= productLimit}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-bold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  title="Cadastre pelo celular em 20 segundos"
                >
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>Relâmpago 20s</span>
                </button>

                <button
                  type="button"
                  onClick={openAddProductModal}
                  disabled={products.length >= productLimit}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Item</span>
                </button>
              </div>
            </div>

            {/* Product List */}
            {products.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-800">
                    Nenhum produto cadastrado ainda
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.5">
                    Utilize o botão <strong>Relâmpago 20s</strong> para tirar uma foto e cadastrar seu primeiro item agora mesmo!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openQuickPos}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Cadastrar 1º Produto em 20s</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-stone-200/90 bg-white hover:border-emerald-200 transition-colors shadow-xs"
                  >
                    <div className="relative w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {product.title}
                      </h4>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 block">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(product.price)}
                      </span>
                      {product.custom_whatsapp_message && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium inline-block truncate max-w-full">
                          Mensagem personalizada ativa
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* --- MODAL ESTILO MAQUININHA (PILAR 5 - CADASTRO RELÂMPAGO EM 20 SEGUNDOS) --- */}
      {isQuickPosOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                  <Zap className="w-4 h-4 fill-stone-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    Cadastro Relâmpago (20s)
                  </h3>
                  <span className="text-[11px] text-stone-500">Estilo maquininha de cartão</span>
                </div>
              </div>
              <button
                onClick={() => setIsQuickPosOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display do Preço em Destaque com Máscara Fluida */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Preço de Venda
              </span>
              <div className="text-3xl font-black tracking-tight text-white font-mono">
                {formattedQuickPrice}
              </div>
            </div>

            {/* Teclado Numérico Fluido (Estilo Maquininha) */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLEAR", "0", "BACKSPACE"].map(
                key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickPriceKey(key)}
                    className={`py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95 cursor-pointer select-none ${
                      key === "CLEAR"
                        ? "bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                        : key === "BACKSPACE"
                        ? "bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-900"
                    }`}
                  >
                    {key === "CLEAR" ? "Limpar" : key === "BACKSPACE" ? "←" : key}
                  </button>
                )
              )}
            </div>

            {/* Título do Produto */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome do Produto / Serviço *
              </label>
              <input
                type="text"
                autoFocus
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                placeholder="Ex: Bolo de Chocolate"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Câmera Instantânea (Mobile Capture) */}
            <div>
              <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50 text-stone-700 text-xs font-semibold transition-colors">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>
                  {uploadingQuickImage
                    ? "Enviando foto..."
                    : quickImageUrl
                    ? "✓ Foto capturada! (Alterar)"
                    : "Tirar Foto com a Câmera"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQuickImageCapture}
                  disabled={uploadingQuickImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Botão de Publicação em 1 Toque */}
            <button
              type="button"
              onClick={handlePublishQuickProduct}
              disabled={uploadingQuickImage || quickPriceCents <= 0 || !quickTitle.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Publicar na Vitrine em 1 Toque
            </button>
          </div>
        </div>
      )}

      {/* Modal: Prévia da Vitrine ao Vivo no Celular */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLivePreview(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-xs font-semibold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span>Fechar</span>
            </button>
            <div className="text-center pb-2">
              <span className="text-xs font-bold text-white/90 bg-stone-800/80 px-3 py-1 rounded-full border border-white/20">
                Visualização ao Vivo da Vitrine
              </span>
            </div>
            <LiveStorePreview
              name={name}
              categoryName={categories.find(c => c.id === categoryId)?.name}
              avatarUrl={avatarUrl}
              bio={bio}
              neighborhood={neighborhood}
              city={city}
              whatsapp={whatsapp}
              isOpen={isOpen}
              freeDelivery={freeDelivery}
              storePickup={storePickup}
              acceptsPix={acceptsPix}
              acceptsCard={acceptsCard}
              products={products}
            />
          </div>
        </div>
      )}

      {/* --- MODAL PADRÃO DE PRODUTO (COMPLETO COM MENSAGEM CUSTOMIZADA) --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingProductId ? "Editar Produto" : "Adicionar Produto ao Catálogo"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              {/* Product Image */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Foto do Produto
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                    {productImageUrl ? (
                      <Image
                        src={productImageUrl}
                        alt="Foto do produto"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 py-2 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs">
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span>{uploadingProductImage ? "Enviando..." : "Escolher Foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingProductImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Título do Produto / Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={productTitle}
                  onChange={e => setProductTitle(e.target.value)}
                  placeholder="Ex: Torta de Limão Gourmet"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={productPrice}
                  onChange={e => setProductPrice(e.target.value)}
                  placeholder="Ex: 45.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={e => setProductDescription(e.target.value)}
                  placeholder="Ingredientes, tamanho, opções disponíveis..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Mensagem Personalizada do WhatsApp (Pilar 3) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mensagem Personalizada do WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  value={customWhatsAppMessage}
                  onChange={e => setCustomWhatsAppMessage(e.target.value)}
                  placeholder="Ex: Olá! Gostaria de encomendar o {produto} ({preco}) para hoje."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Você pode usar as tags <code>{"{produto}"}</code> e <code>{"{preco}"}</code>.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || uploadingProductImage}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isPending ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- MODAL CADASTRO EM LOTE (VÁRIOS DE UMA VEZ) --- */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-stone-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">
                    Cadastrar Vários Produtos de Uma Vez
                  </h3>
                  <span className="text-xs text-stone-500">
                    Preencha as linhas abaixo e publique todos os itens com um único clique.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alerta de Erro Dentro do Modal se houver */}
            {batchModalError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{batchModalError}</span>
              </div>
            )}

            {/* Lista de Itens do Batch */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {batchItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <span className="text-xs font-black text-stone-400 w-5 shrink-0">
                    #{index + 1}
                  </span>

                  {/* Foto da linha */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt="Foto"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:underline">
                      <span>{item.isUploading ? "Enviando..." : item.imageUrl ? "Trocar" : "+ Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleBatchImageUpload(item.id, e)}
                        disabled={item.isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Título */}
                  <div className="flex-1 w-full min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => updateBatchItem(item.id, "title", e.target.value)}
                      placeholder="Nome do produto (ex: Brigadeiro)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Preço */}
                  <div className="w-full sm:w-28 shrink-0">
                    <input
                      type="text"
                      value={item.price}
                      onChange={e => updateBatchItem(item.id, "price", e.target.value)}
                      placeholder="Preço (ex: 15.00)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Excluir linha */}
                  {batchItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBatchRow(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Remover linha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={addBatchRow}
                disabled={products.length + batchItems.length >= (business?.product_limit || 5)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border border-dashed border-stone-300 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold text-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Mais uma Linha</span>
              </button>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchProducts}
                  disabled={isSavingBatch}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isSavingBatch
                    ? "Publicando..."
                    : `Publicar Todos (${batchItems.filter(i => i.title.trim()).length} itens)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
