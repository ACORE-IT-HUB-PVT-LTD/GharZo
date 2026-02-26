import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://api.gharzoreality.com/api";
const PROPERTY_ID = "698479ab9d54124e1b190237";

const CATEGORIES = [
  "Maintenance","Repair","Utility Bills","Property Tax","Insurance",
  "Legal Fees","Management Fees","Marketing","Renovation",
  "Furniture & Fixtures","Cleaning","Security","Other",
];
const PAYMENT_METHODS = ["Cash","Bank Transfer","UPI","Cheque","Card","Online","Other"];
const PAYMENT_STATUSES = ["Paid","Pending","Partial"];
const RECURRING_FREQUENCIES = ["Monthly","Quarterly","Half-Yearly","Yearly"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("usertoken") || "";

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, cls = "" }) => {
  const icons = {
    plus: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
    edit: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
    trash: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
    eye: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
    close: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
    refresh: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
    upload: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>,
    chart: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    filter: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
    receipt: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    tag: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>,
  };
  return icons[name] || null;
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    Partial: "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const emptyForm = () => ({
  propertyId: PROPERTY_ID, title: "", description: "", category: "",
  subcategory: "", amount: "", expenseDate: new Date().toISOString().split("T")[0],
  paymentMethod: "Cash", paymentStatus: "Paid", paidAmount: "",
  vendorName: "", vendorPhone: "", vendorEmail: "",
  invoiceNumber: "", invoiceDate: "", isRecurring: false,
  recurringFrequency: "", nextDueDate: "", notes: "", tags: "",
  images: [],
});

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, children, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white placeholder:text-slate-400";
const selectCls = inputCls + " cursor-pointer";

// ─── EXPENSE FORM MODAL ────────────────────────────────────────────────────────
const ExpenseFormModal = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        propertyId: initial.propertyId?._id || initial.propertyId || PROPERTY_ID,
        title: initial.title || "", description: initial.description || "",
        category: initial.category || "", subcategory: initial.subcategory || "",
        amount: initial.amount || "", expenseDate: initial.expenseDate?.split("T")[0] || "",
        paymentMethod: initial.paymentMethod || "Cash",
        paymentStatus: initial.paymentStatus || "Paid",
        paidAmount: initial.paidAmount || "",
        vendorName: initial.vendor?.name || "", vendorPhone: initial.vendor?.phone || "",
        vendorEmail: initial.vendor?.email || "",
        invoiceNumber: initial.invoiceNumber || "",
        invoiceDate: initial.invoiceDate?.split("T")[0] || "",
        isRecurring: initial.isRecurring || false,
        recurringFrequency: initial.recurringFrequency || "",
        nextDueDate: initial.nextDueDate?.split("T")[0] || "",
        notes: initial.notes || "", tags: (initial.tags || []).join(", "), images: [],
      };
    }
    return emptyForm();
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.amount || !form.expenseDate) {
      setError("Title, Category, Amount, and Expense Date are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      if (isEdit) {
        // JSON PUT
        const body = {
          title: form.title, description: form.description, category: form.category,
          subcategory: form.subcategory, amount: Number(form.amount),
          expenseDate: form.expenseDate, paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus, paidAmount: Number(form.paidAmount || 0),
          vendor: { name: form.vendorName, phone: form.vendorPhone, email: form.vendorEmail },
          invoiceNumber: form.invoiceNumber, invoiceDate: form.invoiceDate || undefined,
          isRecurring: form.isRecurring, recurringFrequency: form.recurringFrequency || undefined,
          nextDueDate: form.nextDueDate || undefined, notes: form.notes,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        };
        await apiFetch(`/expenses/${initial._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // FormData POST (supports file upload)
        const fd = new FormData();
        fd.append("propertyId", form.propertyId);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("category", form.category);
        if (form.subcategory) fd.append("subcategory", form.subcategory);
        fd.append("amount", form.amount);
        fd.append("expenseDate", form.expenseDate);
        fd.append("paymentMethod", form.paymentMethod);
        fd.append("paymentStatus", form.paymentStatus);
        fd.append("paidAmount", form.paidAmount || form.amount);
        if (form.vendorName) fd.append("vendor[name]", form.vendorName);
        if (form.vendorPhone) fd.append("vendor[phone]", form.vendorPhone);
        if (form.vendorEmail) fd.append("vendor[email]", form.vendorEmail);
        if (form.invoiceNumber) fd.append("invoiceNumber", form.invoiceNumber);
        if (form.invoiceDate) fd.append("invoiceDate", form.invoiceDate);
        fd.append("isRecurring", form.isRecurring);
        if (form.isRecurring && form.recurringFrequency) fd.append("recurringFrequency", form.recurringFrequency);
        if (form.isRecurring && form.nextDueDate) fd.append("nextDueDate", form.nextDueDate);
        if (form.notes) fd.append("notes", form.notes);
        if (form.tags) fd.append("tags", form.tags);
        form.images.forEach(f => fd.append("images", f));
        await apiFetch("/expenses", { method: "POST", body: fd });
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #0f2044 0%, #1e3a6e 100%)" }}>
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Expense" : "Add New Expense"}</h2>
            <p className="text-blue-200 text-xs mt-0.5">{isEdit ? "Update expense details" : "Record a new property expense"}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10">
            <Icon name="close" cls="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Basic Details</p>
            <Field label="Title" required>
              <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Monthly Maintenance" />
            </Field>
            <Field label="Description">
              <textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" required>
                <select className={selectCls} value={form.category} onChange={e => set("category", e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <input className={inputCls} value={form.subcategory} onChange={e => set("subcategory", e.target.value)} placeholder="e.g. General Upkeep" />
              </Field>
            </div>
          </div>

          {/* Amount & Payment */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Amount & Payment</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Amount (₹)" required>
                <input type="number" className={inputCls} value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" />
              </Field>
              <Field label="Paid Amount (₹)">
                <input type="number" className={inputCls} value={form.paidAmount} onChange={e => set("paidAmount", e.target.value)} placeholder="0" />
              </Field>
              <Field label="Expense Date" required>
                <input type="date" className={inputCls} value={form.expenseDate} onChange={e => set("expenseDate", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Method">
                <select className={selectCls} value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Payment Status">
                <select className={selectCls} value={form.paymentStatus} onChange={e => set("paymentStatus", e.target.value)}>
                  {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Vendor */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Vendor / Service Provider</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Name">
                <input className={inputCls} value={form.vendorName} onChange={e => set("vendorName", e.target.value)} placeholder="Vendor name" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.vendorPhone} onChange={e => set("vendorPhone", e.target.value)} placeholder="Phone" />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={form.vendorEmail} onChange={e => set("vendorEmail", e.target.value)} placeholder="Email" />
              </Field>
            </div>
          </div>

          {/* Invoice */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Invoice Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice Number">
                <input className={inputCls} value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} placeholder="INV-2026-001" />
              </Field>
              <Field label="Invoice Date">
                <input type="date" className={inputCls} value={form.invoiceDate} onChange={e => set("invoiceDate", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Recurring */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Recurring Expense</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isRecurring ? "bg-orange-500" : "bg-slate-300"}`}
                  onClick={() => set("isRecurring", !form.isRecurring)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isRecurring ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="text-xs font-medium text-slate-600">{form.isRecurring ? "Yes" : "No"}</span>
              </label>
            </div>
            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Frequency">
                  <select className={selectCls} value={form.recurringFrequency} onChange={e => set("recurringFrequency", e.target.value)}>
                    <option value="">Select frequency</option>
                    {RECURRING_FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Next Due Date">
                  <input type="date" className={inputCls} value={form.nextDueDate} onChange={e => set("nextDueDate", e.target.value)} />
                </Field>
              </div>
            )}
          </div>

          {/* Receipt Upload (only on create) */}
          {!isEdit && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Receipts / Documents</p>
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-6 cursor-pointer hover:border-orange-400 transition-colors">
                <Icon name="upload" cls="w-7 h-7 text-slate-400" />
                <span className="text-sm text-slate-500">Click to upload receipt images</span>
                <span className="text-xs text-slate-400">PNG, JPG up to 10MB each</span>
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => set("images", Array.from(e.target.files))} />
              </label>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                      <Icon name="receipt" cls="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs text-orange-700 truncate max-w-28">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes & Tags */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Additional Info</p>
            <Field label="Notes">
              <textarea className={inputCls} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes..." />
            </Field>
            <Field label="Tags (comma separated)">
              <input className={inputCls} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="monthly, routine, urgent" />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition flex items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-60"
            style={{ background: loading ? "#f97316" : "linear-gradient(135deg, #ea580c, #f97316)" }}>
            {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />{isEdit ? "Updating..." : "Adding..."}</> : (isEdit ? "Update Expense" : "Add Expense")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EXPENSE DETAIL MODAL ──────────────────────────────────────────────────────
const DetailModal = ({ expense, onClose, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [deletingReceiptId, setDeletingReceiptId] = useState(null);
  const [receipts, setReceipts] = useState(expense.receipts || []);

  const handleDelete = async () => {
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/expenses/${expense._id}`, { method: "DELETE" });
      onDelete();
    } catch (e) { alert(e.message); setDeleting(false); }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!window.confirm("Remove this receipt?")) return;
    setDeletingReceiptId(receiptId);
    try {
      await apiFetch(`/expenses/${expense._id}/receipts/${receiptId}`, { method: "DELETE" });
      setReceipts(r => r.filter(x => x._id !== receiptId));
    } catch (e) { alert(e.message); }
    setDeletingReceiptId(null);
  };

  const Row = ({ label, value }) => (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 font-medium flex-1">{value || "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between" style={{ background: "linear-gradient(135deg, #0f2044 0%, #1e3a6e 100%)" }}>
          <div>
            <h2 className="text-lg font-bold text-white">{expense.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">{expense.category}</span>
              <Badge status={expense.paymentStatus} />
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <Icon name="close" cls="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Amount Hero */}
          <div className="rounded-xl p-5 text-center" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
            <p className="text-sm text-orange-400 font-medium mb-1">Total Amount</p>
            <p className="text-4xl font-black text-orange-600">{fmt(expense.amount)}</p>
            {expense.paidAmount !== expense.amount && (
              <p className="text-sm text-orange-400 mt-1">Paid: {fmt(expense.paidAmount)}</p>
            )}
          </div>

          <div className="space-y-0 bg-slate-50 rounded-xl px-4 py-2">
            <Row label="Description" value={expense.description} />
            <Row label="Date" value={fmtDate(expense.expenseDate)} />
            <Row label="Subcategory" value={expense.subcategory} />
            <Row label="Payment Method" value={expense.paymentMethod} />
            <Row label="Invoice No." value={expense.invoiceNumber} />
            <Row label="Invoice Date" value={fmtDate(expense.invoiceDate)} />
          </div>

          {expense.vendor?.name && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-0">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Vendor</p>
              <Row label="Name" value={expense.vendor.name} />
              <Row label="Phone" value={expense.vendor.phone} />
              <Row label="Email" value={expense.vendor.email} />
            </div>
          )}

          {expense.isRecurring && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Recurring</p>
              <Row label="Frequency" value={expense.recurringFrequency} />
              <Row label="Next Due" value={fmtDate(expense.nextDueDate)} />
            </div>
          )}

          {expense.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-sm text-amber-800">{expense.notes}</p>
            </div>
          )}

          {expense.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {expense.tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Icon name="tag" cls="w-3 h-3" />{t}
                </span>
              ))}
            </div>
          )}

          {receipts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Receipts ({receipts.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {receipts.map(r => (
                  <div key={r._id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                    <img src={r.url} alt={r.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                        <Icon name="eye" cls="w-4 h-4 text-white" />
                      </a>
                      <button onClick={() => handleDeleteReceipt(r._id)} disabled={deletingReceiptId === r._id}
                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition">
                        {deletingReceiptId === r._id ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> : <Icon name="trash" cls="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-black/40 px-2 py-1 truncate">{r.filename}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
            {deleting ? <span className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" /> : <Icon name="trash" cls="w-4 h-4" />}
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Close</button>
            <button onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-200"
              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
              <Icon name="edit" cls="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, sub, accent }) => (
  <div className={`rounded-2xl p-5 ${accent ? "text-white" : "bg-white border border-slate-100"}`}
    style={accent ? { background: "linear-gradient(135deg, #0f2044 0%, #1e3a6e 100%)" } : {}}>
    <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${accent ? "text-blue-200" : "text-slate-400"}`}>{label}</p>
    <p className={`text-2xl font-black ${accent ? "text-white" : "text-slate-900"}`}>{value}</p>
    {sub && <p className={`text-xs mt-1 ${accent ? "text-blue-300" : "text-slate-400"}`}>{sub}</p>}
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [viewExpense, setViewExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // list | analytics

  // Filters
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
  const [filters, setFilters] = useState({ category: "", paymentStatus: "", startDate: firstDay, endDate: lastDay, page: 1, limit: 20 });
  const [total, setTotal] = useState(0);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ propertyId: PROPERTY_ID, page: filters.page, limit: filters.limit });
      if (filters.category) params.append("category", filters.category);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const [expRes, sumRes, plRes] = await Promise.all([
        apiFetch(`/expenses?${params}`),
        apiFetch(`/expenses/summary?propertyId=${PROPERTY_ID}&startDate=${filters.startDate}&endDate=${filters.endDate}`),
        apiFetch(`/expenses/profit-loss?propertyId=${PROPERTY_ID}&startDate=${filters.startDate}&endDate=${filters.endDate}`),
      ]);
      setExpenses(expRes.data || []);
      setTotal(expRes.total || 0);
      setSummary(sumRes.data || null);
      setProfitLoss(plRes.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = () => { setShowForm(false); setEditExpense(null); fetchAll(); };
  const handleDeleted = () => { setViewExpense(null); fetchAll(); };

  const totalPages = Math.ceil(total / filters.limit);

  const plAmount = profitLoss?.profitLoss?.amount ?? 0;
  const plStatus = profitLoss?.profitLoss?.status;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── HEADER ── */}
      <header style={{ background: "linear-gradient(135deg, #0f2044 0%, #1e3a6e 100%)" }} className="sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
              <Icon name="receipt" cls="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">Expense Manager</h1>
              <p className="text-blue-300 text-xs">Property Expense Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition">
              <Icon name="refresh" cls="w-5 h-5" />
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition hover:shadow-orange-400/40"
              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
              <Icon name="plus" cls="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── SUMMARY CARDS ── */}
        {profitLoss && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Expenses" value={fmt(profitLoss.expenses?.total)} sub={`${expenses.length} records`} accent />
            <SummaryCard label="Rent Collected" value={fmt(profitLoss.income?.rentCollected)} sub={`${profitLoss.income?.paymentsCount} payments`} />
            <SummaryCard label="Profit / Loss"
              value={fmt(Math.abs(plAmount))}
              sub={plStatus}
              accent={false}
            />
            <div className={`rounded-2xl p-5 border ${plStatus === "Loss" ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${plStatus === "Loss" ? "text-red-400" : "text-emerald-400"}`}>Status</p>
              <p className={`text-2xl font-black ${plStatus === "Loss" ? "text-red-600" : "text-emerald-600"}`}>{plStatus || "—"}</p>
              {profitLoss?.expenses?.byCategory?.length > 0 && (
                <p className="text-xs mt-1 text-slate-400">{profitLoss.expenses.byCategory.length} categories</p>
              )}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {["list", "analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition capitalize ${activeTab === tab ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #0f2044, #1e3a6e)" } : {}}>
              {tab === "list" ? "Expenses" : "Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "list" && (
          <>
            {/* ── FILTERS ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="filter" cls="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-slate-700">Filters</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select className={selectCls} value={filters.category} onChange={e => setFilter("category", e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className={selectCls} value={filters.paymentStatus} onChange={e => setFilter("paymentStatus", e.target.value)}>
                  <option value="">All Statuses</option>
                  {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="date" className={inputCls} value={filters.startDate} onChange={e => setFilter("startDate", e.target.value)} />
                <input type="date" className={inputCls} value={filters.endDate} onChange={e => setFilter("endDate", e.target.value)} />
              </div>
            </div>

            {/* ── EXPENSE LIST ── */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <span className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" style={{ borderWidth: 3 }} />
                    <span className="text-sm text-slate-400">Loading expenses...</span>
                  </div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <Icon name="receipt" cls="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No expenses found</p>
                  <p className="text-slate-300 text-sm mt-1">Try changing your filters or add a new expense</p>
                </div>
              ) : (
                expenses.map(exp => (
                  <div key={exp._id} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-orange-200 transition-all group">
                    {/* Category dot */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: "linear-gradient(135deg, #fff7ed, #fed7aa)" }}>
                      <Icon name="receipt" cls="w-5 h-5 text-orange-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{exp.title}</h3>
                        <Badge status={exp.paymentStatus} />
                        {exp.isRecurring && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">
                            🔄 {exp.recurringFrequency}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">{fmtDate(exp.expenseDate)}</span>
                        <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full font-medium">{exp.category}</span>
                        {exp.vendor?.name && <span className="text-xs text-slate-400">📍 {exp.vendor.name}</span>}
                        {exp.receipts?.length > 0 && <span className="text-xs text-slate-400">📎 {exp.receipts.length} receipt(s)</span>}
                      </div>
                      {exp.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {exp.tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-slate-800">{fmt(exp.amount)}</p>
                      {exp.paymentMethod && <p className="text-xs text-slate-400">{exp.paymentMethod}</p>}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setViewExpense(exp)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <Icon name="eye" cls="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditExpense(exp); setShowForm(true); }}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">
                        <Icon name="edit" cls="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3">
                <p className="text-sm text-slate-500">Page {filters.page} of {totalPages} · {total} total</p>
                <div className="flex gap-2">
                  <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page <= 1}
                    className="px-4 py-1.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    ← Prev
                  </button>
                  <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page >= totalPages}
                    className="px-4 py-1.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            {profitLoss?.expenses?.byCategory?.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Icon name="chart" cls="w-5 h-5 text-orange-500" />
                  <h2 className="font-bold text-slate-800">Expense Breakdown by Category</h2>
                </div>
                <div className="space-y-3">
                  {profitLoss.expenses.byCategory.map((item, i) => {
                    const pct = Math.round((item.amount / profitLoss.expenses.total) * 100);
                    const colors = ["#ea580c","#1e3a6e","#f97316","#0f2044","#fb923c","#1d4ed8"];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-700">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">{pct}%</span>
                            <span className="text-sm font-bold text-slate-800">{fmt(item.amount)}</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Total</span>
                  <span className="text-xl font-black text-slate-800">{fmt(profitLoss.expenses.total)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Icon name="chart" cls="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">No analytics data for selected period</p>
              </div>
            )}

            {/* Recent from Summary */}
            {summary?.recentExpenses?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 mb-4">Recent Transactions</h2>
                <div className="space-y-2">
                  {summary.recentExpenses.map(exp => (
                    <div key={exp._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{exp.title}</p>
                        <p className="text-xs text-slate-400">{exp.category} · {fmtDate(exp.expenseDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={exp.paymentStatus} />
                        <span className="text-sm font-bold text-slate-800">{fmt(exp.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {(showForm || editExpense) && (
        <ExpenseFormModal
          initial={editExpense}
          onClose={() => { setShowForm(false); setEditExpense(null); }}
          onSaved={handleSaved}
        />
      )}

      {viewExpense && (
        <DetailModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onEdit={() => { setEditExpense(viewExpense); setViewExpense(null); setShowForm(true); }}
          onDelete={handleDeleted}
        />
      )}
    </div>
  );
}