"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  Check,
  CreditCard,
  Lock,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import {
  applyCheckoutDiscount,
  createCheckoutSession,
  fetchShippingQuotes,
  updateAddress,
} from "@/app/(storefront)/checkout/actions";
import { registerUser } from "@/app/(storefront)/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import type { ResolvedCheckoutDiscount } from "@/lib/checkout-discount";

type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  estimatedDays: string | null;
};

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

type AccountMode = "create" | "guest";

function splitUserName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (name ?? "").trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function StepCard({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="checkout-step rounded-3xl border border-navy/8 bg-white p-6 shadow-[0_8px_30px_rgba(30,42,74,0.06)] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-display text-lg font-extrabold leading-tight text-navy">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-navy/50">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CheckoutForm({
  addresses,
  userEmail,
  userName,
  isLoggedIn,
  defaultCountry = "CA",
  shippingCountries,
}: {
  addresses: Address[];
  userEmail?: string | null;
  userName?: string | null;
  isLoggedIn: boolean;
  defaultCountry?: string;
  shippingCountries: Array<{ code: string; label: string }>;
}) {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const router = useRouter();
  const { update } = useSession();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountMode, setAccountMode] = useState<AccountMode>("create");

  const [addressList, setAddressList] = useState<Address[]>(addresses);
  const defaultAddressId =
    addressList.find((a) => a.isDefault)?.id ?? addressList[0]?.id ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddressId,
  );
  const [useNewAddress, setUseNewAddress] = useState(addressList.length === 0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Address | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [newAddressCountry, setNewAddressCountry] = useState(() => {
    const codes = shippingCountries.map((country) => country.code);
    if (codes.includes(defaultCountry)) {
      return defaultCountry;
    }
    return codes[0] ?? defaultCountry;
  });
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [selectedShippingRateId, setSelectedShippingRateId] = useState<
    string | null
  >(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<ResolvedCheckoutDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  useEffect(() => setMounted(true), []);

  const usingNewAddress = useNewAddress || !selectedAddressId;
  const subtotal = getTotal();
  const selectedAddress = addressList.find(
    (address) => address.id === selectedAddressId,
  );
  const shippingCountry = usingNewAddress
    ? newAddressCountry
    : (selectedAddress?.country ?? defaultCountry);
  const selectedShippingQuote = shippingQuotes.find(
    (quote) => quote.id === selectedShippingRateId,
  );
  const shippingCost = selectedShippingQuote?.price ?? 0;
  const effectiveShippingCost = appliedDiscount?.freeShipping ? 0 : shippingCost;
  const discountAmount = appliedDiscount?.amount ?? 0;
  const total = subtotal - discountAmount + effectiveShippingCost;
  const profileName = splitUserName(userName);

  useEffect(() => {
    setAppliedDiscount(null);
    setDiscountError(null);
    setDiscountInput("");
  }, [subtotal]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function loadQuotes() {
      setLoadingQuotes(true);
      setQuotesError(null);

      try {
        const quotes = await fetchShippingQuotes(shippingCountry, subtotal);
        if (cancelled) return;

        setShippingQuotes(quotes);
        setSelectedShippingRateId((current) => {
          if (current && quotes.some((quote) => quote.id === current)) {
            return current;
          }
          return quotes[0]?.id ?? null;
        });

        if (quotes.length === 0) {
          setQuotesError(
            "No shipping options are available for this country yet.",
          );
        }
      } catch {
        if (!cancelled) {
          setQuotesError("Could not load shipping options. Please try again.");
          setShippingQuotes([]);
          setSelectedShippingRateId(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingQuotes(false);
        }
      }
    }

    void loadQuotes();

    return () => {
      cancelled = true;
    };
  }, [mounted, shippingCountry, subtotal]);

  async function handleApplyDiscount() {
    const code = discountInput.trim();
    if (!code) {
      setDiscountError("Enter a discount code.");
      setAppliedDiscount(null);
      return;
    }

    setApplyingDiscount(true);
    setDiscountError(null);

    const result = await applyCheckoutDiscount(code, subtotal);

    setApplyingDiscount(false);

    if ("error" in result) {
      setDiscountError(result.error);
      setAppliedDiscount(null);
      return;
    }

    setAppliedDiscount(result.discount);
    setDiscountInput(result.discount.code);
  }

  function clearDiscount() {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError(null);
  }

  async function handleGoogle() {
    setLoading(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("mw-auth-welcome", "1");
    }
    await signIn("google", { callbackUrl: "/checkout" });
  }

  function startEdit(addr: Address) {
    setEditError(null);
    setEditingId(addr.id);
    setEditDraft({ ...addr });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editDraft) return;
    setEditSaving(true);
    setEditError(null);
    const res = await updateAddress({
      id: editDraft.id,
      fullName: editDraft.fullName,
      line1: editDraft.line1,
      line2: editDraft.line2 ?? undefined,
      city: editDraft.city,
      state: editDraft.state,
      postalCode: editDraft.postalCode,
      country: editDraft.country,
      phone: editDraft.phone ?? undefined,
    });
    setEditSaving(false);
    if ("error" in res && res.error) {
      setEditError(res.error);
      return;
    }
    if ("success" in res && res.success) {
      setAddressList((list) =>
        list.map((a) => (a.id === res.address.id ? { ...a, ...res.address } : a)),
      );
      cancelEdit();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    let shippingAddress:
      | {
          fullName: string;
          line1: string;
          line2?: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
          phone?: string;
        }
      | undefined;

    if (usingNewAddress) {
      let fullName: string;

      if (isLoggedIn) {
        fullName =
          `${profileName.firstName} ${profileName.lastName}`.trim() ||
          (userName ?? "").trim();
      } else {
        const firstName = ((formData.get("firstName") as string) || "").trim();
        const lastName = ((formData.get("lastName") as string) || "").trim();
        fullName = `${firstName} ${lastName}`.trim();
      }

      shippingAddress = {
        fullName,
        line1: (formData.get("line1") as string) || "",
        line2: (formData.get("line2") as string) || undefined,
        city: (formData.get("city") as string) || "",
        state: (formData.get("state") as string) || "",
        postalCode: (formData.get("postalCode") as string) || "",
        country: newAddressCountry,
        phone: (formData.get("phone") as string) || undefined,
      };
    }

    let guestEmail: string | undefined;

    try {
      if (!isLoggedIn) {
        if (accountMode === "create") {
          const email = ((formData.get("accEmail") as string) || "").trim();
          const password = (formData.get("accPassword") as string) || "";
          const derivedName =
            shippingAddress?.fullName && shippingAddress.fullName.length > 0
              ? shippingAddress.fullName
              : email.split("@")[0];

          const regData = new FormData();
          regData.set("name", derivedName);
          regData.set("email", email);
          regData.set("password", password);

          const reg = await registerUser(regData);
          if (reg.error) {
            setError(
              `${reg.error} If it's yours, sign in first or switch to guest checkout.`,
            );
            setLoading(false);
            return;
          }

          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (signInResult?.error) {
            setError(
              "Your account was created, but we couldn't sign you in automatically. Please sign in and try again.",
            );
            setLoading(false);
            return;
          }
          await update();
        } else {
          guestEmail = ((formData.get("guestEmail") as string) || "").trim();
        }
      }

      if (!selectedShippingRateId) {
        setError("Please select a shipping method.");
        setLoading(false);
        return;
      }

      const result = await createCheckoutSession({
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          custom: i.custom
            ? { measurements: i.custom.measurements }
            : undefined,
        })),
        addressId: usingNewAddress ? undefined : selectedAddressId ?? undefined,
        guestEmail,
        shippingRateId: selectedShippingRateId,
        discountCode: appliedDiscount?.code ?? undefined,
        shippingAddress,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if ("sessionId" in result && result.sessionId) {
        router.push(`/checkout/payment?session_id=${result.sessionId}`);
        return;
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-3xl bg-navy/[0.04]" />
          <div className="h-72 animate-pulse rounded-3xl bg-navy/[0.04]" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-navy/[0.04]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy/15 bg-gradient-to-b from-white to-blush/20 py-20 text-center">
        <p className="font-display text-xl font-bold text-navy">
          Your bag is empty
        </p>
        <p className="mt-2 text-sm text-navy/55">
          Add something adorable before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-coral px-6 font-semibold text-white transition-colors hover:bg-coral/90"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      <div className="space-y-6">
        {/* 1 — Account */}
        <StepCard
          step={1}
          title="Your details"
          subtitle={
            isLoggedIn
              ? "You're signed in"
              : "Sign in, create an account, or check out as a guest"
          }
        >
          {isLoggedIn ? (
            <div className="flex items-center gap-3 rounded-2xl border border-mint/60 bg-mint/15 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-display text-lg font-extrabold text-navy shadow-sm">
                {(userName ?? userEmail ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
                  <Check className="h-4 w-4 text-green-600" />
                  Signed in{userName ? ` as ${userName}` : ""}
                </p>
                {userEmail && (
                  <p className="truncate text-xs text-navy/60">{userEmail}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-navy/15 bg-white py-3 text-sm font-bold text-navy shadow-sm transition-all hover:bg-blush/20 hover:shadow-md disabled:opacity-60"
              >
                <GoogleGlyph className="h-5 w-5" />
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy/10" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 uppercase tracking-wider text-navy/40">
                    or with email
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 rounded-full bg-navy/[0.05] p-1">
                {(
                  [
                    { key: "create" as const, label: "Create account" },
                    { key: "guest" as const, label: "Guest checkout" },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAccountMode(tab.key)}
                    className={cn(
                      "rounded-full py-2 text-sm font-bold transition-all",
                      accountMode === tab.key
                        ? "bg-white text-navy shadow-sm"
                        : "text-navy/55 hover:text-navy",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {accountMode === "create" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accEmail">Email</Label>
                    <input
                      id="accEmail"
                      name="accEmail"
                      type="email"
                      required
                      defaultValue={userEmail ?? ""}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accPassword">Password</Label>
                    <input
                      id="accPassword"
                      name="accPassword"
                      type="password"
                      required
                      minLength={8}
                      className={inputCls}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="guestEmail">Email</Label>
                  <input
                    id="guestEmail"
                    name="guestEmail"
                    type="email"
                    required
                    className={inputCls}
                  />
                  <p className="mt-1.5 text-xs text-navy/50">
                    We&apos;ll send order updates and your receipt here.
                  </p>
                </div>
              )}
            </div>
          )}
        </StepCard>

        {/* 2 — Shipping address */}
        <StepCard
          step={2}
          title="Shipping address"
          subtitle="Where should we send your order?"
        >
          {isLoggedIn && addressList.length > 0 && !useNewAddress && (
            <div className="space-y-3">
              {addressList.map((addr) => {
                const selected = selectedAddressId === addr.id;
                const editing = editingId === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      selected
                        ? "border-coral bg-blush/15"
                        : "border-navy/10 hover:border-navy/20",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="addressChoice"
                        checked={selected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-coral"
                        aria-label={`Ship to ${addr.fullName}`}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-navy">
                          {addr.fullName}
                          {addr.isDefault && (
                            <span className="rounded-full bg-mint/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy/70">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-navy/60">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                          {addr.state} {addr.postalCode}, {addr.country}
                          {addr.phone ? ` · ${addr.phone}` : ""}
                        </p>
                      </button>
                      {!editing && (
                        <button
                          type="button"
                          onClick={() => startEdit(addr)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editing && editDraft && (
                      <div className="mt-4 grid gap-3 border-t border-navy/10 pt-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label>Full name</Label>
                          <input
                            className={inputCls}
                            value={editDraft.fullName}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                fullName: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Address line 1</Label>
                          <input
                            className={inputCls}
                            value={editDraft.line1}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                line1: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Address line 2</Label>
                          <input
                            className={inputCls}
                            value={editDraft.line2 ?? ""}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                line2: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <input
                            className={inputCls}
                            value={editDraft.city}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                city: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Province / State</Label>
                          <input
                            className={inputCls}
                            value={editDraft.state}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                state: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Postal / Zip Code</Label>
                          <input
                            className={inputCls}
                            value={editDraft.postalCode}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                postalCode: ev.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <select
                            className={inputCls}
                            value={editDraft.country}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                country: ev.target.value,
                              })
                            }
                          >
                            {shippingCountries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Phone</Label>
                          <input
                            className={inputCls}
                            value={editDraft.phone ?? ""}
                            onChange={(ev) =>
                              setEditDraft({
                                ...editDraft,
                                phone: ev.target.value,
                              })
                            }
                          />
                        </div>
                        {editError && (
                          <p className="text-sm text-red-600 sm:col-span-2">
                            {editError}
                          </p>
                        )}
                        <div className="flex gap-2 sm:col-span-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveEdit}
                            disabled={editSaving}
                          >
                            {editSaving ? "Saving..." : "Save changes"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={editSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setUseNewAddress(true);
                  setSelectedAddressId(null);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral transition-colors hover:text-coral/80"
              >
                <Plus className="h-4 w-4" />
                Use a new address
              </button>
            </div>
          )}

          {usingNewAddress && (
            <div className="space-y-4">
              {isLoggedIn && addressList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setUseNewAddress(false);
                    setSelectedAddressId(defaultAddressId);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy/50 transition-colors hover:text-navy"
                >
                  <X className="h-3.5 w-3.5" />
                  Use a saved address instead
                </button>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {isLoggedIn ? (
                  <>
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <input
                        id="firstName"
                        name="firstName"
                        value={profileName.firstName}
                        readOnly
                        disabled
                        autoComplete="given-name"
                        className={cn(inputCls, "cursor-not-allowed bg-navy/[0.03]")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <input
                        id="lastName"
                        name="lastName"
                        value={profileName.lastName}
                        readOnly
                        disabled
                        autoComplete="family-name"
                        className={cn(inputCls, "cursor-not-allowed bg-navy/[0.03]")}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <input
                        id="firstName"
                        name="firstName"
                        required
                        autoComplete="given-name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <input
                        id="lastName"
                        name="lastName"
                        required
                        autoComplete="family-name"
                        className={inputCls}
                      />
                    </div>
                  </>
                )}
                <div className="sm:col-span-2">
                  <Label htmlFor="line1">Address line 1</Label>
                  <input
                    id="line1"
                    name="line1"
                    required
                    autoComplete="address-line1"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="line2">Address line 2</Label>
                  <input
                    id="line2"
                    name="line2"
                    autoComplete="address-line2"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Province / State</Label>
                  <input
                    id="state"
                    name="state"
                    required
                    autoComplete="address-level1"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal / Zip Code</Label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    required
                    autoComplete="postal-code"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    name="country"
                    value={newAddressCountry}
                    onChange={(event) =>
                      setNewAddressCountry(event.target.value)
                    }
                    required
                    autoComplete="country-name"
                    className={inputCls}
                  >
                    {shippingCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputCls}
                  />
                </div>
              </div>
              {isLoggedIn && (
                <p className="flex items-start gap-1.5 text-xs text-navy/50">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                  This address will be saved to your profile for next time.
                </p>
              )}
            </div>
          )}
        </StepCard>

        {/* 3 — Delivery */}
        <StepCard step={3} title="Delivery method">
          <div className="space-y-3">
            {loadingQuotes ? (
              <p className="text-sm text-navy/55">Loading shipping options…</p>
            ) : quotesError ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {quotesError}
              </p>
            ) : (
              shippingQuotes.map((quote) => (
                <label
                  key={quote.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-navy/10 p-4 transition-colors has-[:checked]:border-coral has-[:checked]:bg-blush/15"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShippingRateId === quote.id}
                      onChange={() => setSelectedShippingRateId(quote.id)}
                      className="accent-coral"
                    />
                    <div>
                      <p className="text-sm font-bold text-navy">{quote.name}</p>
                      {quote.estimatedDays && (
                        <p className="text-xs text-navy/55">
                          {quote.estimatedDays}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-display font-bold text-navy">
                    {quote.price === 0 ? "Free" : formatPrice(quote.price)}
                  </span>
                </label>
              ))
            )}
          </div>
        </StepCard>

        {/* 4 — Discount */}
        <StepCard step={4} title="Discount code" subtitle="Have a promo code?">
          <div className="flex gap-2">
            <input
              id="discountCode"
              name="discountCode"
              value={discountInput}
              onChange={(event) => {
                setDiscountInput(event.target.value);
                if (appliedDiscount) {
                  setAppliedDiscount(null);
                }
                setDiscountError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleApplyDiscount();
                }
              }}
              placeholder="Enter code"
              className={cn(inputCls, "mt-0 uppercase placeholder:normal-case")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleApplyDiscount()}
              disabled={applyingDiscount || !discountInput.trim()}
              className="shrink-0"
            >
              {applyingDiscount ? "Applying..." : "Apply"}
            </Button>
          </div>

          {appliedDiscount && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              <span>
                <span className="font-semibold">{appliedDiscount.label}</span>{" "}
                applied
              </span>
              <button
                type="button"
                onClick={clearDiscount}
                className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
                aria-label="Remove discount"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {discountError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {discountError}
            </p>
          )}
        </StepCard>
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="rounded-3xl border border-navy/8 bg-white p-6 shadow-[0_8px_30px_rgba(30,42,74,0.07)]">
          <h2 className="font-display text-lg font-extrabold text-navy">
            Order summary
          </h2>

          <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.lineId} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-navy/[0.06] px-1.5 text-[11px] font-bold text-navy/70">
                  {item.quantity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-navy/50">
                    {item.size} / {item.color}
                    {item.custom ? " · Custom fit" : ""}
                  </p>
                </div>
                <span className="font-semibold text-navy">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-navy/10 pt-5 text-sm">
            <div className="flex justify-between text-navy/65">
              <span>Subtotal</span>
              <span className="font-semibold text-navy">
                {formatPrice(subtotal)}
              </span>
            </div>
            {appliedDiscount && (discountAmount > 0 || appliedDiscount.freeShipping) && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({appliedDiscount.code})</span>
                <span className="font-semibold">
                  {discountAmount > 0
                    ? `-${formatPrice(discountAmount)}`
                    : "Free shipping"}
                </span>
              </div>
            )}
            <div className="flex justify-between text-navy/65">
              <span>Shipping</span>
              <span className="font-semibold text-navy">
                {appliedDiscount?.freeShipping ? (
                  <span className="inline-flex items-center gap-2">
                    {shippingCost > 0 && (
                      <span className="font-normal text-navy/40 line-through">
                        {formatPrice(shippingCost)}
                      </span>
                    )}
                    <span className="text-emerald-700">Free</span>
                  </span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-navy/10 pt-4">
            <span className="font-display text-base font-bold text-navy">
              Total
            </span>
            <span className="font-display text-2xl font-extrabold text-coral">
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading || loadingQuotes || !selectedShippingRateId}
            className="mt-6 flex w-full items-center justify-center gap-2 text-base shadow-[0_10px_28px_rgba(255,127,110,0.35)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay {formatPrice(total)}
              </>
            )}
          </Button>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-navy/50">
            <span className="flex flex-col items-center gap-1">
              <Lock className="h-4 w-4" />
              Secure
            </span>
            <span className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Encrypted
            </span>
            <span className="flex flex-col items-center gap-1">
              <Truck className="h-4 w-4" />
              Tracked
            </span>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-navy/45">
            <Mail className="h-3 w-3" />
            You&apos;ll be redirected to Stripe to complete payment.
          </p>
        </div>
      </div>
    </form>
  );
}
