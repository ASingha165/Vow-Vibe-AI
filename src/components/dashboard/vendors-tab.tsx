"use client";

import * as React from "react";
import {
  Store,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Columns,
  Trash2,
  Edit2,
  Receipt,
  Sparkles,
} from "lucide-react";
import { EventPlan, VendorItem, VendorStatus } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";
import { checkVendorBudgetFit } from "@/services/vendorEngine";
import { StorageService } from "@/services/storageService";

interface VendorsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function VendorsTab({ event, onUpdateEvent }: VendorsTabProps) {
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<VendorItem | null>(null);

  // Comparison State
  const [comparisonIds, setComparisonIds] = React.useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);

  // Quote Breakdown Modal State
  const [quoteVendor, setQuoteVendor] = React.useState<VendorItem | null>(null);

  // Form State
  const [vendorForm, setVendorForm] = React.useState<{
    name: string;
    category: string;
    location: string;
    contactPhone: string;
    contactEmail: string;
    quotedPrice: number;
    status: VendorStatus;
    rating: number;
    notes: string;
    pros: string;
    cons: string;
  }>({
    name: "",
    category: event.budget.categories[0]?.name || "Venue & Lawns",
    location: event.location.city,
    contactPhone: "",
    contactEmail: "",
    quotedPrice: 50000,
    status: "researching",
    rating: 4.8,
    notes: "",
    pros: "",
    cons: "",
  });

  const filteredVendors = event.vendors.filter((v) => {
    const matchesCategory =
      selectedCategory === "all" ||
      v.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesQuery =
      searchQuery.trim() === "" ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleToggleCompare = (id: string) => {
    if (comparisonIds.includes(id)) {
      setComparisonIds(comparisonIds.filter((item) => item !== id));
    } else {
      if (comparisonIds.length >= 3) {
        toast({ type: "info", title: "Comparison Limit", message: "You can compare up to 3 vendors simultaneously." });
        return;
      }
      setComparisonIds([...comparisonIds, id]);
    }
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      toast({ type: "error", title: "Name Required", message: "Enter the vendor / agency business name." });
      return;
    }

    let updatedVendors = [...event.vendors];

    const parsedPros = vendorForm.pros ? vendorForm.pros.split(",").map((s) => s.trim()) : [];
    const parsedCons = vendorForm.cons ? vendorForm.cons.split(",").map((s) => s.trim()) : [];

    if (editingVendor) {
      updatedVendors = updatedVendors.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              name: vendorForm.name,
              category: vendorForm.category,
              location: vendorForm.location,
              contactPhone: vendorForm.contactPhone,
              contactEmail: vendorForm.contactEmail,
              quotedPrice: Number(vendorForm.quotedPrice),
              status: vendorForm.status,
              rating: Number(vendorForm.rating),
              notes: vendorForm.notes,
              pros: parsedPros,
              cons: parsedCons,
            }
          : v
      );
      toast({ type: "success", title: "Vendor Updated", message: vendorForm.name });
    } else {
      const newV: VendorItem = {
        id: `vendor-${Date.now().toString(36)}`,
        name: vendorForm.name,
        category: vendorForm.category,
        location: vendorForm.location,
        contactPhone: vendorForm.contactPhone,
        contactEmail: vendorForm.contactEmail,
        quotedPrice: Number(vendorForm.quotedPrice),
        status: vendorForm.status,
        rating: Number(vendorForm.rating),
        notes: vendorForm.notes,
        pros: parsedPros,
        cons: parsedCons,
        isSample: false,
      };
      updatedVendors.push(newV);
      toast({ type: "success", title: "Vendor Added", message: vendorForm.name });
    }

    const updatedEvent: EventPlan = { ...event, vendors: updatedVendors };
    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    setIsAddModalOpen(false);
    setEditingVendor(null);
    resetForm();
  };

  const handleDeleteVendor = (id: string) => {
    const updatedVendors = event.vendors.filter((v) => v.id !== id);
    const updatedEvent: EventPlan = { ...event, vendors: updatedVendors };
    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    setComparisonIds(comparisonIds.filter((item) => item !== id));
    toast({ type: "info", title: "Vendor Removed", message: "Vendor deleted from roster." });
  };

  const openEditModal = (vendor: VendorItem) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      category: vendor.category,
      location: vendor.location,
      contactPhone: vendor.contactPhone || "",
      contactEmail: vendor.contactEmail || "",
      quotedPrice: vendor.quotedPrice,
      status: vendor.status,
      rating: vendor.rating || 4.5,
      notes: vendor.notes || "",
      pros: (vendor.pros || []).join(", "),
      cons: (vendor.cons || []).join(", "),
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setVendorForm({
      name: "",
      category: event.budget.categories[0]?.name || "Venue & Lawns",
      location: event.location.city,
      contactPhone: "",
      contactEmail: "",
      quotedPrice: 50000,
      status: "researching",
      rating: 4.8,
      notes: "",
      pros: "",
      cons: "",
    });
  };

  // Vendors being compared
  const comparedVendors = event.vendors.filter((v) => comparisonIds.includes(v.id));

  return (
    <div className="space-y-6">
      {/* Stitch Vendor Directory Header & Intelligence Ribbon */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-primary-container/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">storefront</span>
              <h3 className="font-serif text-lg font-bold text-primary">Vendor Intelligence &amp; Comparisons</h3>
            </div>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Screen quotes, evaluate budget elasticity, and compare competitive bids side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {comparisonIds.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Compare Selected ({comparisonIds.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingVendor(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_business</span>
              <span>+ Record Vendor</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Chips */}
        <div className="pt-3 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search vendors, locations, specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-primary-container/15 bg-surface pl-9 pr-3 py-1.5 text-xs text-primary focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Category Chips Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-primary"
              }`}
            >
              All ({event.vendors.length})
            </button>
            {event.budget.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.name
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:text-primary"
                }`}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          const budgetFit = checkVendorBudgetFit(vendor, event.budget.categories);
          const isSelectedForCompare = comparisonIds.includes(vendor.id);
          const perGuestRate = event.guests.expectedCount > 0
            ? Math.round(vendor.quotedPrice / event.guests.expectedCount)
            : 0;

          return (
            <div
              key={vendor.id}
              className={`rounded-2xl bg-surface-container-lowest p-5 border shadow-xs transition-all flex flex-col justify-between ${
                isSelectedForCompare
                  ? "ring-2 ring-secondary border-secondary"
                  : "border-primary-container/10 hover:shadow-sm"
              }`}
            >
              <div className="space-y-3">
                {/* Header with Title and Comparison Checkbox */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                      {vendor.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-primary leading-tight truncate mt-0.5">
                      {vendor.name}
                    </h4>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-0.5">
                      <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                      <span className="truncate">{vendor.location}</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0" title="Select for side-by-side comparison">
                    <input
                      type="checkbox"
                      checked={isSelectedForCompare}
                      onChange={() => handleToggleCompare(vendor.id)}
                      className="w-4 h-4 rounded text-primary-container accent-[#35213D] cursor-pointer"
                    />
                    <span className="font-sans text-[10px] text-on-surface-variant font-medium">Compare</span>
                  </label>
                </div>

                {/* Quoted Pricing Strip */}
                <div className="flex items-baseline justify-between py-1 border-y border-surface-container/60">
                  <div>
                    <span className="font-serif text-xl font-bold text-primary">
                      {formatINR(vendor.quotedPrice)}
                    </span>
                    {perGuestRate > 0 && (
                      <span className="font-sans text-[11px] text-on-surface-variant ml-1.5">
                        (₹{perGuestRate} / guest)
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[10px] font-semibold capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{vendor.status}</span>
                  </span>
                </div>

                {/* Budget Elasticity Compatibility Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant text-[11px]">Budget Allocation Fit:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      budgetFit.badgeVariant === "success"
                        ? "bg-emerald-500/15 text-emerald-800"
                        : budgetFit.badgeVariant === "warning"
                        ? "bg-amber-500/15 text-amber-900"
                        : "bg-error/15 text-error"
                    }`}
                  >
                    {budgetFit.badgeText}
                  </span>
                </div>

                {/* Signature Highlights (Stitch pattern) */}
                {vendor.pros && vendor.pros.length > 0 && (
                  <div className="rounded-xl bg-surface-container-low p-2.5 flex flex-col gap-1 border border-primary-container/5">
                    <div className="flex items-center gap-1 text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[15px]">stars</span>
                      <span>Signature Highlights</span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      {vendor.pros.join(" • ")}
                    </p>
                  </div>
                )}

                {/* Rating & Contact coords */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1 text-secondary">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">{vendor.rating || 4.5}</span>
                    <span className="text-on-surface-variant/70 text-[11px]">/ 5</span>
                  </div>

                  {vendor.contactPhone && (
                    <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-secondary" />
                      <span>{vendor.contactPhone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Ribbon */}
              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between gap-2">
                <button
                  onClick={() => setQuoteVendor(vendor)}
                  className="h-8 px-2.5 rounded-lg bg-surface-container text-primary text-xs font-semibold flex items-center gap-1 hover:bg-surface-container-high transition-colors"
                >
                  <Receipt className="h-3.5 w-3.5 text-secondary" />
                  <span>Quote Breakdown</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(vendor)}
                    className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    title="Edit Vendor"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete Vendor"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal (Stitch table layout) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-side Quote Comparison"
        description="Comprehensive evaluation of rates, service deliverables, and budget compatibility."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-primary-container/10">
            <table className="w-full text-left text-xs bg-surface-container-lowest">
              <thead className="border-b border-surface-container bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Metric</th>
                  {comparedVendors.map((v) => (
                    <th key={v.id} className="py-3 px-3 font-serif font-bold text-sm text-primary">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Category</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 font-medium text-primary">
                      {v.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Quoted Total</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 font-serif font-bold text-sm text-primary">
                      {formatINR(v.quotedPrice)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Rating</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 font-semibold text-secondary">
                      ⭐ {v.rating || 4.5} / 5
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Pipeline Status</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 capitalize font-medium text-primary">
                      {v.status}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Signature Deliverables</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 text-xs text-on-surface-variant leading-relaxed">
                      {(v.pros || []).join(" • ") || "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-on-surface-variant">Constraints / Notes</td>
                  {comparedVendors.map((v) => (
                    <td key={v.id} className="py-2.5 px-3 text-xs text-error/90 leading-relaxed">
                      {(v.cons || []).join(" • ") || "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Stitch AI Recommendation Banner */}
          {comparedVendors.length >= 2 && (
            <div className="rounded-xl bg-surface-container p-3 flex items-center justify-between border border-primary-container/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">auto_awesome</span>
                <span className="font-serif font-bold text-xs text-primary">AI Recommendation</span>
              </div>
              <span className="font-sans text-xs font-bold text-secondary">
                {comparedVendors[0].name} provides optimal cost-to-benefit ratio
              </span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsCompareModalOpen(false)}>
              Close Comparison
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quote Breakdown Modal */}
      {quoteVendor && (
        <Modal
          isOpen={!!quoteVendor}
          onClose={() => setQuoteVendor(null)}
          title={`Quote Breakdown: ${quoteVendor.name}`}
          description={`Category: ${quoteVendor.category} • Location: ${quoteVendor.location}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-primary-container/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Quoted Total:</span>
                <span className="font-serif text-xl font-bold text-primary">
                  {formatINR(quoteVendor.quotedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Status:</span>
                <span className="capitalize font-semibold text-primary">{quoteVendor.status}</span>
              </div>
              {quoteVendor.contactPhone && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Contact:</span>
                  <span className="font-mono text-primary">{quoteVendor.contactPhone}</span>
                </div>
              )}
            </div>

            {quoteVendor.notes && (
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-primary">Negotiation &amp; Scope Notes</h5>
                <p className="font-sans text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-lowest border border-primary-container/10 leading-relaxed">
                  {quoteVendor.notes}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setQuoteVendor(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingVendor ? "Edit Vendor Details" : "Record New Vendor Partner"}
        description="Save quotations, contact coordinates, and evaluation notes."
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <Input
            label="Vendor / Agency Name *"
            placeholder="e.g. Saptapadi Heritage Caterers"
            value={vendorForm.name}
            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Category
              </label>
              <select
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location / Area"
              placeholder="e.g. Salt Lake, Kolkata"
              value={vendorForm.location}
              onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Quoted Price (₹)"
              type="number"
              value={vendorForm.quotedPrice}
              onChange={(e) => setVendorForm({ ...vendorForm, quotedPrice: Number(e.target.value) })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Status
              </label>
              <select
                value={vendorForm.status}
                onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as VendorStatus })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="booked">Booked (Deposit Paid)</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              placeholder="+91 98300 12345"
              value={vendorForm.contactPhone}
              onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
            />
            <Input
              label="Rating (1 to 5)"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={vendorForm.rating}
              onChange={(e) => setVendorForm({ ...vendorForm, rating: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Pros / Key Deliverables (comma separated)"
            placeholder="e.g. Authentic Bhetki Paturi, Chingri Malai Curry, Nolen Gur Sandesh"
            value={vendorForm.pros}
            onChange={(e) => setVendorForm({ ...vendorForm, pros: e.target.value })}
          />

          <Input
            label="Cons / Constraints (comma separated)"
            placeholder="e.g. Bone china cutlery extra rental (+₹12,000)"
            value={vendorForm.cons}
            onChange={(e) => setVendorForm({ ...vendorForm, cons: e.target.value })}
          />

          <Textarea
            label="Private Notes"
            placeholder="Notes on negotiations, discount promises, or coordinator names..."
            value={vendorForm.notes}
            onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-2 border-t border-surface-container">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingVendor ? "Save Changes" : "Save Vendor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

