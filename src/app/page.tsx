"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name_bn: string;
  name_en: string;
  category_id: string;
  price: number;
  description: string;
  care_instructions: string;
  images: string[];
  stock_status: "available" | "sold_out";
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [showSplash, setShowSplash] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  const [banners, setBanners] = useState<string[]>([
    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80"
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [descExpanded, setDescExpanded] = useState(false);
  const [careExpanded, setCareExpanded] = useState(false);

  useEffect(() => {
    setDescExpanded(false);
    setCareExpanded(false);
  }, [selectedProduct]);

  // Auto-slide hero banner images
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    // Start exit animation after 1800ms
    const animTimer = setTimeout(() => {
      setAnimateOut(true);
    }, 1800);

    // Completely unmount after animation completes (e.g. 2500ms)
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(removeTimer);
    };
  }, []);
  
  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const getWhatsAppNumber = () => {
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801896270282";
    let cleanNumber = rawNumber.replace(/\D/g, "");
    if (cleanNumber.startsWith("0") && cleanNumber.length === 11) {
      cleanNumber = "88" + cleanNumber;
    }
    if (cleanNumber.length < 10) {
      return "8801896270282";
    }
    return cleanNumber;
  };

  const getProductWhatsAppLink = (product: Product) => {
    const message = `আসসালামু আলাইকুম, আমি গ্রিন হেভেন থেকে আপনার "${product.name_bn}" (${product.name_en || ""}) পণ্যটি সম্পর্কে জানতে এবং অর্ডার করতে আগ্রহী। মূল্য: ৳${product.price}`;
    return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTimeout(() => {
      const section = document.getElementById("products-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*");
        if (catError) throw catError;
        setCategories(catData || []);

        // Fetch Products
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select("*");
        if (prodError) throw prodError;
        setProducts(prodData || []);
        setFilteredProducts(prodData || []);

        // Fetch Banners from Settings
        const { data: settingsData } = await supabase
          .from("settings")
          .select("*")
          .eq("key", "hero_banners")
          .single();
        if (settingsData?.value && Array.isArray(settingsData.value)) {
          setBanners(settingsData.value);
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter products when category or search query changes
  useEffect(() => {
    let result = products;

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name_bn.toLowerCase().includes(query) ||
          (p.name_en && p.name_en.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) {
      alert("দয়া করে আপনার নাম এবং মোবাইল নম্বরটি দিন।");
      return;
    }

    try {
      setSubmittingInquiry(true);
      const { error } = await supabase.from("inquiries").insert([
        {
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail || null,
          message: inquiryMessage || null,
          product_id: inquiryProduct?.id || null,
        },
      ]);

      if (error) throw error;

      setInquirySuccess(true);
      setTimeout(() => {
        // Reset state
        setShowInquiryForm(false);
        setInquiryProduct(null);
        setInquiryName("");
        setInquiryPhone("");
        setInquiryEmail("");
        setInquiryMessage("");
        setInquirySuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      alert("দুঃখিত, অনুরোধটি পাঠানো যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const renderProductCard = (product: Product) => (
    <div
      key={product.id}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
        <Image
          src={product.images[0] || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80"}
          alt={product.name_bn}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock_status === "sold_out" && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-stone-900/90 text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
            স্টক শেষ
          </div>
        )}
      </div>

      {/* Product Body */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wider uppercase">
              {categories.find((c) => c.id === product.category_id)?.name.split(" ")[0] || "গাছ"}
            </span>
            {product.name_en && (
              <span className="text-[9px] sm:text-xs font-mono text-stone-400 truncate max-w-[55%] hidden xs:inline">{product.name_en}</span>
            )}
          </div>
          <h3
            className="text-sm sm:text-lg font-bold text-stone-900 mb-1 sm:mb-2 cursor-pointer hover:text-emerald-700 transition-colors truncate"
            onClick={() => setSelectedProduct(product)}
          >
            {product.name_bn}
          </h3>
          <p className="text-stone-600 text-sm line-clamp-2 mb-4 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        </div>

        <div>
          <div className="flex flex-col xs:flex-row xs:items-center justify-between pt-2 sm:pt-4 border-t border-stone-100 gap-2">
            <div className="text-sm sm:text-xl font-extrabold text-stone-900">
              ৳ {product.price.toLocaleString("bn-BD")}
            </div>
            
            <div className="flex gap-1 w-full xs:w-auto">
              <button
                onClick={() => setSelectedProduct(product)}
                className="flex-1 xs:flex-none px-2 sm:px-4 py-1.5 sm:py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors duration-200 text-center"
              >
                বিস্তারিত
              </button>
              <button
                disabled={product.stock_status === "sold_out"}
                onClick={() => {
                  setInquiryProduct(product);
                  setShowInquiryForm(true);
                }}
                className={`flex-1 xs:flex-none px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-200 text-center ${
                  product.stock_status === "sold_out"
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                }`}
              >
                অর্ডার
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans pb-24 sm:pb-0">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md border border-stone-100 bg-stone-50 shrink-0">
                <Image
                  src="/logo.png"
                  alt="গ্রিন হেভেন লোগো"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight leading-none">গ্রিন হেভেন</h1>
                <span className="text-[10px] sm:text-xs text-stone-500 font-medium tracking-wide uppercase">Premium Online Nursery</span>
              </div>
            </div>
            
            {/* WhatsApp link on mobile right side */}
            <a
              href={`https://wa.me/${getWhatsAppNumber()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              title="WhatsApp"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>

          {/* Search bar centered/right */}
          <div className="w-full sm:max-w-md">
            <div className="relative rounded-full bg-stone-100 p-0.5 flex border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all duration-200">
              <input
                type="text"
                placeholder="আপনার পছন্দের গাছ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-3 py-2 rounded-full text-stone-850 placeholder-stone-400 focus:outline-none text-sm bg-transparent"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-full font-semibold transition-colors duration-200 text-xs shrink-0">
                খুঁজুন
              </button>
            </div>
          </div>

          {/* WhatsApp on Desktop */}
          <a
            href={`https://wa.me/${getWhatsAppNumber()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-emerald-500/10 text-sm shrink-0"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp যোগাযোগ
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 to-emerald-50 py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider">
                🍃 সরাসরি নার্সারি থেকে হোম ডেলিভারি
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
                আপনার ঘরে নিয়ে আসুন <br />
                <span className="text-emerald-700 underline decoration-wavy decoration-emerald-300 underline-offset-8">প্রকৃতির সতেজতা</span>
              </h2>
              <p className="text-lg text-stone-700 max-w-xl leading-relaxed">
                ইনডোর প্ল্যান্ট, আউটডোর প্ল্যান্ট এবং প্রিমিয়াম গার্ডেনিং এক্সেসরিজ নিয়ে গ্রিন হেভেন সর্বদা প্রস্তুত। আমাদের প্রতিটি গাছ সতেজ এবং সুস্থভাবে আপনার ঠিকানায় পৌঁছে দেওয়া হয়।
              </p>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[350px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100">
                {banners.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`গ্রিন হেভেন ব্যানার ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-100 z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                  🚚
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 leading-none">সারাদেশে ডেলিভারি</h4>
                  <span className="text-xs text-stone-500">নিরাপদ প্যাকেজিং গ্যারান্টি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 scroll-mt-20">
        {/* Category Filter */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-6 mb-12 border-b border-stone-200 pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              সব পণ্য ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-sm font-medium text-stone-500">
            {filteredProducts.length} টি পণ্য পাওয়া গেছে
          </div>
        </div>

        {/* Loading / Error states */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-stone-600 font-semibold">পণ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-stone-800">কোনো পণ্য পাওয়া যায়নি!</h3>
            <p className="text-stone-500 mt-2">অন্য কোনো নামে সার্চ করুন অথবা ফিল্টার পরিবর্তন করুন।</p>
          </div>
        ) : selectedCategory !== "all" ? (
          /* Single Selected Category */
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 border-l-4 border-emerald-700 pl-3 mb-6">
              {categories.find((c) => c.id === selectedCategory)?.name || "পণ্যসমূহ"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {filteredProducts.map((product) => renderProductCard(product))}
            </div>
          </div>
        ) : (
          /* All Categories - Grouped by Category */
          <div className="space-y-16">
            {categories.map((cat) => {
              const catProducts = filteredProducts.filter((p) => p.category_id === cat.id);
              if (catProducts.length === 0) return null;
              
              return (
                <div key={cat.id} className="space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 border-l-4 border-emerald-700 pl-3">
                    {cat.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                    {catProducts.map((product) => renderProductCard(product))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
            <div className="relative p-6 flex justify-between items-center border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900">{selectedProduct.name_bn}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden bg-stone-100/50">
                <Image
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name_bn}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Action Bar: Price, Order, WhatsApp */}
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">মূল্য</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-stone-950">৳ {selectedProduct.price.toLocaleString("bn-BD")}</span>
                  </div>
                  <button
                    onClick={() => {
                      setInquiryProduct(selectedProduct);
                      setSelectedProduct(null);
                      setShowInquiryForm(true);
                    }}
                    disabled={selectedProduct.stock_status === "sold_out"}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 ${
                      selectedProduct.stock_status === "sold_out"
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed pointer-events-none"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    অর্ডার করুন
                  </button>
                </div>
                
                {/* WhatsApp Chat Button */}
                <a
                  href={getProductWhatsAppLink(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 w-full"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>জানতে বা আরও ছবি দেখতে WhatsApp চ্যাট করুন</span>
                </a>
              </div>

              <div>
                <h4 className="font-bold text-stone-850 mb-1.5 text-sm sm:text-base">পণ্যের বিবরণ</h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {descExpanded || selectedProduct.description.length <= 150
                    ? selectedProduct.description
                    : `${selectedProduct.description.slice(0, 150)}...`}
                  {selectedProduct.description.length > 150 && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-emerald-700 hover:text-emerald-950 font-bold ml-1.5 focus:outline-none text-xs sm:text-sm"
                    >
                      {descExpanded ? "সংক্ষিপ্ত করুন" : "আরও দেখুন"}
                    </button>
                  )}
                </p>
              </div>

              {selectedProduct.care_instructions && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-1.5 text-sm sm:text-base">
                    💡 যত্ন নেওয়ার নির্দেশনাবলী
                  </h4>
                  <p className="text-stone-850 text-xs sm:text-sm leading-relaxed">
                    {careExpanded || selectedProduct.care_instructions.length <= 120
                      ? selectedProduct.care_instructions
                      : `${selectedProduct.care_instructions.slice(0, 120)}...`}
                    {selectedProduct.care_instructions.length > 120 && (
                      <button
                        onClick={() => setCareExpanded(!careExpanded)}
                        className="text-emerald-700 hover:text-emerald-950 font-bold ml-1.5 focus:outline-none text-xs sm:text-sm"
                      >
                        {careExpanded ? "সংক্ষিপ্ত করুন" : "আরও দেখুন"}
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inquiry/Order Modal Form */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-stone-950">অর্ডার / ইনকোয়ারি ফর্ম</h3>
                {inquiryProduct && (
                  <span className="text-xs text-stone-500">পণ্য: {inquiryProduct.name_bn}</span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowInquiryForm(false);
                  setInquiryProduct(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {inquirySuccess ? (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-4">🎉</span>
                  <h4 className="text-xl font-bold text-emerald-700">অনুরোধটি সফলভাবে পাঠানো হয়েছে!</h4>
                  <p className="text-stone-600 mt-2">আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquiryProduct && (
                    <div className="mb-2">
                      <a
                        href={getProductWhatsAppLink(inquiryProduct)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 w-full"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>পণ্যটি সম্পর্কে জানতে বা আরও ছবি দেখতে WhatsApp চ্যাট করুন</span>
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="মোবাইল নম্বর লিখুন"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-650 uppercase tracking-wider mb-1.5">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="ইমেইল এড্রেস লিখুন"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-650 uppercase tracking-wider mb-1.5">
                      অতিরিক্ত বার্তা (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="ডেলিভারি ঠিকানা বা অন্য কোনো নির্দেশাবলী লিখুন..."
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md"
                  >
                    {submittingInquiry ? "পাঠানো হচ্ছে..." : "অর্ডার সম্পন্ন করুন"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12 border-t border-stone-850 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-bold text-white mb-4">🌿 গ্রিন হেভেন</h4>
            <p className="text-stone-400 text-sm leading-relaxed">
              আপনার চারপাশের পরিবেশকে সবুজে সাজাতে আমরা নিয়ে এসেছি সেরা মানের ইনডোর ও আউটডোর প্ল্যান্ট।
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>📞 ফোন: {process.env.NEXT_PUBLIC_CONTACT_PHONE || "01896270282"}</li>
              <li>✉️ ইমেইল: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@greenheaven.com"}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">অ্যাডমিন</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a href="/admin" className="hover:text-emerald-400 transition-colors">
                  🔐 অ্যাডমিন লগইন
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">কপিরাইট</h4>
            <p className="text-stone-400 text-sm">
              &copy; {new Date().getFullYear()} গ্রিন হেভেন। সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3 px-4 flex justify-around items-center shadow-lg safe-bottom">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
            selectedCategory === "all" ? "text-emerald-700 font-bold scale-105" : "text-stone-500 font-medium"
          }`}
        >
          <span className="text-xl">🌱</span>
          <span className="text-[10px]">সব পণ্য</span>
        </button>
        {categories.map((cat) => {
          let icon = "🌿";
          if (cat.slug === "indoor") icon = "🏠";
          if (cat.slug === "outdoor") icon = "🌳";
          if (cat.slug === "tools") icon = "🛠️";
          
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                selectedCategory === cat.id ? "text-emerald-700 font-bold scale-105" : "text-stone-500 font-medium"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[10px]">{cat.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Splash Screen Intro */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center text-white px-6 transition-transform duration-700 ease-in-out ${
            animateOut ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="absolute inset-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop&q=80"
              alt="Welcome background"
              fill
              className="object-cover animate-pulse duration-[3000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/90 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.25)] border border-white/25 animate-bounce bg-white/10 backdrop-blur-md">
              <Image
                src="/logo.png"
                alt="গ্রিন হেভেন লোগো"
                fill
                className="object-cover p-3.5"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-400">গ্রিন হেভেন</h2>
              <p className="text-stone-300 font-medium text-base">আপনাকে স্বাগতম</p>
            </div>
            <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}
