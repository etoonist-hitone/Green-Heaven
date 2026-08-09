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

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  product_id: string | null;
  created_at: string;
  product?: Product;
}

type TabType = "products" | "inquiries" | "categories";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Edit / Add Product Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form Fields
  const [prodNameBn, setProdNameBn] = useState("");
  const [prodNameEn, setProdNameEn] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodDesc, setProdDesc] = useState("");
  const [prodCare, setProdCare] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodStock, setProdStock] = useState<"available" | "sold_out">("available");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Category Form
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // Banner manager states
  const [heroBanners, setHeroBanners] = useState<string[]>([]);
  const [savingBanners, setSavingBanners] = useState(false);
  const [uploadingBannerIdx, setUploadingBannerIdx] = useState<number | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          fetchDashboardData();
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkUser();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      // Fetch Categories
      const { data: catData } = await supabase.from("categories").select("*");
      setCategories(catData || []);

      // Fetch Products
      const { data: prodData } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      setProducts(prodData || []);

      // Fetch Inquiries
      const { data: inqData } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      
      // Map products to inquiries for easier viewing
      const mappedInquiries = (inqData || []).map((inq) => ({
        ...inq,
        product: (prodData || []).find((p) => p.id === inq.product_id),
      }));

      setInquiries(mappedInquiries);

      // Fetch Banners from Settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "hero_banners")
        .single();
      if (settingsData?.value && Array.isArray(settingsData.value)) {
        setHeroBanners(settingsData.value);
      } else {
        setHeroBanners([
          "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80"
        ]);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSubmittingLogin(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setUser(data.user);
      fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message || "লগইন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার ইমেইল ও পাসওয়ার্ড চেক করুন।");
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Image compressor helper (scales down if > 1000px, 75% quality JPEG)
  const compressImage = (file: File, maxWidth = 1000, quality = 0.75): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Auto compress image
      const compressedBlob = await compressImage(file);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`;
      const filePath = `product-images/${fileName}`;

      // Upload compressed blob to bucket 'products'
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      if (data?.publicUrl) {
        setProdImages([...prodImages, data.publicUrl]);
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(`ইমেজ আপলোড করতে সমস্যা হয়েছে! \n\nভুলের বিবরণ (Error Detail): ${err.message || JSON.stringify(err)} \n\nদয়া করে নিশ্চিত করুন আপনার Supabase-এ 'products' নামে একটি public storage bucket তৈরি করা আছে এবং সেটির RLS Policy ঠিকভাবে কনফিগার করা আছে।`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProdImages(prodImages.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload hero banner image handler (compression at 1600px width)
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBannerIdx(index);
      const compressedBlob = await compressImage(file, 1600, 0.8);
      const fileName = `banner-${index}-${Date.now()}.jpg`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      if (data?.publicUrl) {
        const updated = [...heroBanners];
        updated[index] = data.publicUrl;
        setHeroBanners(updated);
      }
    } catch (err: any) {
      console.error("Error uploading banner:", err);
      alert(`ব্যানার আপলোড ব্যর্থ হয়েছে! \n\nভুলের বিবরণ: ${err.message}`);
    } finally {
      setUploadingBannerIdx(null);
    }
  };

  const handleSaveBanners = async () => {
    try {
      setSavingBanners(true);
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "hero_banners",
          value: heroBanners,
        }, { onConflict: "key" });

      if (error) throw error;
      alert("হিরো ব্যানার সফলভাবে সংরক্ষণ করা হয়েছে!");
    } catch (err: any) {
      console.error("Error saving banners:", err);
      alert(`ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে! \n\nভুলের বিবরণ: ${err.message}`);
    } finally {
      setSavingBanners(false);
    }
  };

  // Add or Edit Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameBn || !prodPrice || !prodCategoryId) {
      alert("দয়া করে নাম, মূল্য এবং ক্যাটাগরি পূরণ করুন।");
      return;
    }

    const productPayload = {
      name_bn: prodNameBn,
      name_en: prodNameEn || null,
      category_id: prodCategoryId,
      price: Number(prodPrice),
      description: prodDesc || null,
      care_instructions: prodCare || null,
      images: prodImages,
      stock_status: prodStock,
    };

    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("products")
          .insert([productPayload]);
        if (error) throw error;
      }

      setShowProductModal(false);
      resetProductForm();
      fetchDashboardData();
    } catch (err: any) {
      console.error("Error saving product:", err);
      alert("পণ্যটি সেভ করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProdNameBn(product.name_bn);
    setProdNameEn(product.name_en || "");
    setProdCategoryId(product.category_id);
    setProdPrice(product.price);
    setProdDesc(product.description || "");
    setProdCare(product.care_instructions || "");
    setProdImages(product.images || []);
    setProdStock(product.stock_status);
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdNameBn("");
    setProdNameEn("");
    setProdCategoryId("");
    setProdPrice(0);
    setProdDesc("");
    setProdCare("");
    setProdImages([]);
    setProdStock("available");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      fetchDashboardData();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert("পণ্যটি ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  // Add Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;

    try {
      setSubmittingCategory(true);
      const { error } = await supabase.from("categories").insert([
        { name: newCatName, slug: newCatSlug.toLowerCase().trim() },
      ]);
      if (error) throw error;

      setNewCatName("");
      setNewCatSlug("");
      fetchDashboardData();
    } catch (err: any) {
      console.error("Error adding category:", err);
      alert("ক্যাটাগরি যুক্ত করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ইনকোয়ারিটি ডিলিট করতে চান?")) return;

    try {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
      fetchDashboardData();
    } catch (err: any) {
      console.error("Error deleting inquiry:", err);
      alert("ইনকোয়ারি ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show Login Screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center text-4xl mb-3">🌿</div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">
            গ্রিন হেভেন অ্যাডমিন প্যানেল
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            লগইন করতে আপনার এডমিন ক্রেডেনশিয়ালস দিন
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-3xl border border-stone-200/80 sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-bold text-stone-700">
                  ইমেইল এড্রেস
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@greenheaven.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700">
                  পাসওয়ার্ড
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-700 text-xs rounded-xl p-3 border border-red-200">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md"
              >
                {submittingLogin ? "লগইন হচ্ছে..." : "লগইন করুন"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (Authenticated Admin)
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h1 className="text-xl font-bold text-stone-850">গ্রিন হেভেন অ্যাডমিন ড্যাশবোর্ড</h1>
              <span className="text-xs text-stone-500">লগইন অ্যাকাউন্ট: {user.email}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              👁️ সাইট দেখুন
            </a>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80"
            }`}
          >
            📦 প্রোডাক্ট লিস্ট ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "inquiries"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80"
            }`}
          >
            📋 কাস্টমার ইনকোয়ারি ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "categories"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80"
            }`}
          >
            📁 ক্যাটাগরি ম্যানেজার ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "banners"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80"
            }`}
          >
            🖼️ হিরো ব্যানার ম্যানেজার
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white border border-stone-250/80 rounded-3xl shadow-sm p-6 md:p-8 min-h-[60vh] flex flex-col">
          {dataLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* --- PRODUCTS TAB --- */}
              {activeTab === "products" && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">গাছপালা ও পণ্যের তালিকা</h2>
                    <button
                      onClick={() => {
                        resetProductForm();
                        setShowProductModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm"
                    >
                      ➕ নতুন প্রোডাক্ট যোগ করুন
                    </button>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200 text-sm">
                      <thead>
                        <tr className="bg-stone-50 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">
                          <th className="px-6 py-3">ছবি</th>
                          <th className="px-6 py-3">বাংলা নাম</th>
                          <th className="px-6 py-3">ইংরেজি নাম</th>
                          <th className="px-6 py-3">ক্যাটাগরি</th>
                          <th className="px-6 py-3">মূল্য</th>
                          <th className="px-6 py-3">স্টক</th>
                          <th className="px-6 py-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-250">
                                <Image
                                  src={prod.images[0] || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&auto=format&fit=crop&q=80"}
                                  alt={prod.name_bn}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold">{prod.name_bn}</td>
                            <td className="px-6 py-4 font-mono text-stone-500">{prod.name_en || "-"}</td>
                            <td className="px-6 py-4">
                              {categories.find((c) => c.id === prod.category_id)?.name || "অজানা"}
                            </td>
                            <td className="px-6 py-4 font-bold">৳ {prod.price}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                prod.stock_status === "available"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {prod.stock_status === "available" ? "স্টক আছে" : "স্টক শেষ"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => startEditProduct(prod)}
                                className="text-emerald-700 hover:text-emerald-900 font-bold mr-3"
                              >
                                এডিট
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="text-red-650 hover:text-red-800 font-bold"
                              >
                                ডিলিট
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden space-y-4">
                    {products.map((prod) => (
                      <div key={prod.id} className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-250 shrink-0">
                          <Image
                            src={prod.images[0] || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&auto=format&fit=crop&q=80"}
                            alt={prod.name_bn}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-stone-900 truncate">{prod.name_bn}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              prod.stock_status === "available"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {prod.stock_status === "available" ? "স্টক আছে" : "শেষ"}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 font-mono truncate">{prod.name_en || "-"}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-extrabold text-stone-850">৳ {prod.price}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditProduct(prod)}
                                className="text-emerald-700 hover:text-emerald-950 font-bold text-xs px-2.5 py-1 bg-white border border-stone-200 rounded-lg"
                              >
                                এডিট
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="text-red-650 hover:text-red-800 font-bold text-xs px-2.5 py-1 bg-white border border-stone-200 rounded-lg"
                              >
                                ডিলিট
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- INQUIRIES TAB --- */}
              {activeTab === "inquiries" && (
                <div className="flex-1 flex flex-col">
                  <div className="pb-6 border-b border-stone-100 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">গ্রাহকদের অর্ডার ও ইনকোয়ারি সমূহ</h2>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200 text-sm">
                      <thead>
                        <tr className="bg-stone-50 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">
                          <th className="px-6 py-3">গ্রাহকের নাম</th>
                          <th className="px-6 py-3">মোবাইল</th>
                          <th className="px-6 py-3">ইমেইল</th>
                          <th className="px-6 py-3">পছন্দের পণ্য</th>
                          <th className="px-6 py-3">বার্তা / ঠিকানা</th>
                          <th className="px-6 py-3">তারিখ</th>
                          <th className="px-6 py-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {inquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-stone-50/50">
                            <td className="px-6 py-4 font-bold">{inq.name}</td>
                            <td className="px-6 py-4">
                              <a href={`tel:${inq.phone}`} className="text-emerald-700 hover:underline font-semibold">
                                {inq.phone}
                              </a>
                            </td>
                            <td className="px-6 py-4 font-mono text-stone-500">{inq.email || "-"}</td>
                            <td className="px-6 py-4">
                              {inq.product ? (
                                <span className="font-bold text-emerald-800">{inq.product.name_bn}</span>
                              ) : (
                                <span className="text-stone-400">সাধারণ বার্তা</span>
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate">{inq.message || "-"}</td>
                            <td className="px-6 py-4 text-stone-400">
                              {new Date(inq.created_at).toLocaleDateString("bn-BD")}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="text-red-650 hover:text-red-800 font-bold"
                              >
                                ডিলিট
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden space-y-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm">{inq.name}</h3>
                            <a href={`tel:${inq.phone}`} className="text-emerald-700 hover:underline font-bold text-xs">
                              📞 {inq.phone}
                            </a>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {new Date(inq.created_at).toLocaleDateString("bn-BD")}
                          </span>
                        </div>
                        {inq.product && (
                          <div className="bg-white border border-stone-200 p-2 rounded-xl text-xs">
                            <span className="text-stone-400 block text-[9px] uppercase font-bold">অর্ডার করা পণ্য</span>
                            <span className="font-bold text-stone-850">{inq.product.name_bn}</span>
                          </div>
                        )}
                        {inq.message && (
                          <div className="text-xs text-stone-600 bg-stone-100/50 p-2 rounded-xl">
                            <span className="text-stone-400 block text-[9px] uppercase font-bold">বার্তা / ঠিকানা</span>
                            <p className="whitespace-pre-line">{inq.message}</p>
                          </div>
                        )}
                        <div className="flex justify-end pt-2 border-t border-stone-150">
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="text-red-650 hover:text-red-800 font-bold text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                          >
                            ডিলিট করুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- CATEGORIES TAB --- */}
              {activeTab === "categories" && (
                <div className="flex-1 flex flex-col">
                  <div className="pb-6 border-b border-stone-100 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">ক্যাটাগরি ম্যানেজার</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add Category Form */}
                    <div className="lg:col-span-4 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                      <h3 className="font-bold text-stone-800 mb-4">নতুন ক্যাটাগরি তৈরি</h3>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                            নাম (যেমন: ফুল গাছ)
                          </label>
                          <input
                            type="text"
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="ক্যাটাগরির নাম"
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                            স্লাগ (যেমন: flower)
                          </label>
                          <input
                            type="text"
                            required
                            value={newCatSlug}
                            onChange={(e) => setNewCatSlug(e.target.value)}
                            placeholder="slug-name"
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500 text-sm bg-white"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingCategory}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                        >
                          {submittingCategory ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                        </button>
                      </form>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-8">
                      <table className="min-w-full divide-y divide-stone-200 text-sm">
                        <thead>
                          <tr className="bg-stone-50 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">
                            <th className="px-6 py-3">আইডি (UUID)</th>
                            <th className="px-6 py-3">নাম</th>
                            <th className="px-6 py-3">স্লাগ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                          {categories.map((cat) => (
                            <tr key={cat.id}>
                              <td className="px-6 py-4 font-mono text-stone-400 text-xs">{cat.id}</td>
                              <td className="px-6 py-4 font-bold">{cat.name}</td>
                              <td className="px-6 py-4 font-mono text-emerald-800">{cat.slug}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- BANNERS TAB --- */}
              {activeTab === "banners" && (
                <div className="flex-1 flex flex-col">
                  <div className="pb-6 border-b border-stone-100 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">হিরো ব্যানার ম্যানেজার (Hero Banner Manager)</h2>
                    <p className="text-xs text-stone-500 mt-1">হোম পেজে স্লাইড হওয়ার জন্য ৩টি ব্যানার ছবি পরিচালনা করুন।</p>
                  </div>

                  <div className="space-y-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[0, 1, 2].map((idx) => {
                        const hasImg = heroBanners[idx];
                        return (
                          <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">ব্যানার ছবি {idx + 1}</span>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-200 border border-stone-250 flex items-center justify-center text-xs text-stone-400">
                              {hasImg ? (
                                <Image
                                  src={heroBanners[idx]}
                                  alt={`Banner ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                "কোনো ছবি নেই"
                              )}
                            </div>
                            
                            <label className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold px-3 py-2 rounded-xl text-center text-xs cursor-pointer block transition-colors">
                              {uploadingBannerIdx === idx ? "আপলোড হচ্ছে..." : "নতুন ছবি আপলোড"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingBannerIdx !== null}
                                onChange={(e) => handleBannerUpload(e, idx)}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-stone-150 flex justify-end">
                      <button
                        onClick={handleSaveBanners}
                        disabled={savingBanners}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm"
                      >
                        {savingBanners ? "সংরক্ষণ হচ্ছে..." : "ব্যানারসমূহ সংরক্ষণ করুন"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">
                {editingProduct ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যোগ করুন"}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    নাম (বাংলা) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodNameBn}
                    onChange={(e) => setProdNameBn(e.target.value)}
                    placeholder="যেমন: লাল গোলাপ"
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    placeholder="যেমন: Red Rose"
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    মূল্য (টাকা) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    placeholder="যেমন: 150"
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  স্টক স্ট্যাটাস
                </label>
                <select
                  value={prodStock}
                  onChange={(e: any) => setProdStock(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="available">স্টক আছে (Available)</option>
                  <option value="sold_out">স্টক শেষ (Sold Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  পণ্যের বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="গাছটি সম্পর্কে কিছু লিখুন..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  যত্ন নেওয়ার নির্দেশনাবলী
                </label>
                <textarea
                  rows={2}
                  value={prodCare}
                  onChange={(e) => setProdCare(e.target.value)}
                  placeholder="সারাদিন কতবার পানি ও সূর্যালোক প্রয়োজন..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Product Images Manager */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  পণ্যের ছবি
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {prodImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-300">
                      <Image src={img} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0 right-0 bg-red-650 text-white rounded-bl-xl w-6 h-6 flex items-center justify-center font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center text-stone-400 hover:text-emerald-600 transition-colors">
                    <span className="text-xl">+</span>
                    <span className="text-[9px] font-bold">ইমেজ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <p className="text-xs text-stone-500 animate-pulse">📷 ছবি আপলোড হচ্ছে...</p>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="px-5 py-2.5 border border-stone-200 text-stone-700 font-semibold rounded-xl text-sm hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
