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
  ShieldCheck,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { EventPlan, VendorItem, VendorStatus } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";
import { checkVendorBudgetFit, VENDOR_REQUIREMENTS_GUIDE } from "@/services/vendorEngine";
import { StorageService } from "@/services/storageService";

interface VendorsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function VendorsTab({ event, onUpdateEvent }: VendorsTabProps) {
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<VendorItem | null>(null);

  // Comparison State (ids of vendors selected for comparison)
  const [comparisonIds, setComparisonIds] = React.useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);

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
    if (selectedCategory === "all") return true;
    return v.category.toLowerCase().includes(selectedCategory.toLowerCase());
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
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner and Filter Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#22092C]">Vendor Directory &amp; Intelligence</h3>
            <p className="text-xs text-[#5E4B66]">
              Track quotes, evaluate budget compatibility, and compare potential partners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {comparisonIds.length > 0 && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
                className="gap-1.5 shadow-xs"
              >
                <Columns className="h-4 w-4" />
                <span>Compare Selected ({comparisonIds.length})</span>
              </Button>
            )}

            <Button
              onClick={() => {
                setEditingVendor(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Vendor</span>
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 pt-3 border-t border-[#FAF0F3] flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#3B1242] text-white"
                : "bg-[#FAF8F5] text-[#5E4B66] border border-[#E5D5B5] hover:bg-white"
            }`}
          >
            All Vendors ({event.vendors.length})
          </button>
          {event.budget.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === c.name
                  ? "bg-[#3B1242] text-white"
                  : "bg-[#FAF8F5] text-[#5E4B66] border border-[#E5D5B5] hover:bg-white"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </Card>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          const budgetFit = checkVendorBudgetFit(vendor, event.budget.categories);
          const isSelectedForCompare = comparisonIds.includes(vendor.id);

          return (
            <Card
              key={vendor.id}
              className={`p-5 flex flex-col justify-between transition-all ${
                isSelectedForCompare ? "ring-2 ring-[#C5A059] border-[#C5A059]" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="plum" className="text-[10px]">
                    {vendor.category}
                  </Badge>
                  {vendor.isSample && (
                    <Badge variant="outline" className="text-[9px] py-0">
                      Illustrative Sample
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-[#22092C] leading-snug">{vendor.name}</h4>
                  <p className="text-xs text-[#7A6B80] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#C5A059]" /> {vendor.location}
                  </p>
                </div>

                {/* Quoted Price & Budget Compatibility */}
                <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#E5D5B5]/60 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#5E4B66]">Quoted Price:</span>
                    <span className="font-serif font-bold text-base text-[#3B1242]">
                      {formatINR(vendor.quotedPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#EADBDF]">
                    <span className="text-[10px] text-[#7A6B80]">Budget Fit:</span>
                    <Badge
                      variant={
                        budgetFit.badgeVariant === "success"
                          ? "success"
                          : budgetFit.badgeVariant === "warning"
                          ? "warning"
                          : budgetFit.badgeVariant === "danger"
                          ? "danger"
                          : "default"
                      }
                      className="text-[9px] py-0"
                    >
                      {budgetFit.badgeText}
                    </Badge>
                  </div>
                </div>

                {/* Status & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-[#8C6D23]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">{vendor.rating || 4.5}</span>
                    <span className="text-[#7A6B80]">/ 5</span>
                  </div>

                  <Badge
                    variant={
                      vendor.status === "booked"
                        ? "success"
                        : vendor.status === "shortlisted"
                        ? "gold"
                        : vendor.status === "quoted"
                        ? "rose"
                        : "default"
                    }
                    className="capitalize text-[10px]"
                  >
                    {vendor.status}
                  </Badge>
                </div>

                {/* Pros and Cons */}
                {vendor.pros && vendor.pros.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase">Advantages:</span>
                    <p className="text-[#5E4B66] text-[11px] leading-relaxed">{vendor.pros.join(" • ")}</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#FAF0F3] flex items-center justify-between">
                <button
                  onClick={() => handleToggleCompare(vendor.id)}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    isSelectedForCompare ? "text-[#C5A059]" : "text-[#5E4B66] hover:text-[#22092C]"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>{isSelectedForCompare ? "Comparing" : "Compare"}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(vendor)}
                    className="p-1 rounded text-[#5E4B66] hover:bg-[#FAF0F3] hover:text-[#22092C] cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1 rounded text-[#5E4B66] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side Vendor Comparison"
        description="Evaluate criteria, quoted prices, ratings, and strategic advantages."
        maxWidth="2xl"
      >
        <div className="overflow-x-auto space-y-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EADBDF] text-[#5E4B66]">
                <th className="py-2.5 px-3">Criteria</th>
                {comparedVendors.map((v) => (
                  <th key={v.id} className="py-2.5 px-3 font-serif font-bold text-sm text-[#22092C]">
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF0F3]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Category</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3">
                    <Badge variant="plum" className="text-[10px]">
                      {v.category}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Quoted Price</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3 font-bold text-sm text-[#3B1242]">
                    {formatINR(v.quotedPrice)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Rating</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3 font-semibold text-[#8C6D23]">
                    ⭐ {v.rating || 4.5} / 5
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Status</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3 capitalize font-medium text-[#22092C]">
                    {v.status}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Advantages</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3 text-[#5E4B66] text-[11px]">
                    {(v.pros || []).join(", ") || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5E4B66]">Considerations</td>
                {comparedVendors.map((v) => (
                  <td key={v.id} className="py-2.5 px-3 text-[#B33951] text-[11px]">
                    {(v.cons || []).join(", ") || "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsCompareModalOpen(false)}>
              Close Comparison
            </Button>
          </div>
        </div>
      </Modal>

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
            placeholder="e.g. Royal Bengal Heritage Banquet"
            value={vendorForm.name}
            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Category
              </label>
              <select
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Status
              </label>
              <select
                value={vendorForm.status}
                onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as VendorStatus })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
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
            placeholder="e.g. Complimentary bridal suite, 100kVA generator, Drone included"
            value={vendorForm.pros}
            onChange={(e) => setVendorForm({ ...vendorForm, pros: e.target.value })}
          />

          <Input
            label="Cons / Constraints (comma separated)"
            placeholder="e.g. 10 PM sound curfew, strict cancellation terms"
            value={vendorForm.cons}
            onChange={(e) => setVendorForm({ ...vendorForm, cons: e.target.value })}
          />

          <Textarea
            label="Private Notes"
            placeholder="Notes on negotiations, discount promises, or coordinator names..."
            value={vendorForm.notes}
            onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#FAF0F3]">
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
