import { useState, useEffect, useRef } from "react";

const API_BASE = "https://api.gharzoreality.com/api";

const getToken = () => localStorage.getItem("usertoken");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ─── HELPERS ────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const STATUS_CONFIG = {
  Pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400"  },
  Partial:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   dot: "bg-blue-400"   },
  Paid:      { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  dot: "bg-green-400"  },
  Overdue:   { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    dot: "bg-red-400"    },
  Waived:    { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200", dot: "bg-purple-400" },
  Cancelled: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",  dot: "bg-slate-400"  },
};

const fmt = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  const c = type === "error" ? "bg-red-600" : "bg-emerald-600";
  return (
    <div className={`fixed top-5 right-5 z-[100] ${c} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-slide-in`}>
      <span>{type === "error" ? "⚠" : "✓"}</span>
      <span>{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 ml-2">✕</button>
    </div>
  );
}

function LabeledInput({ label, type = "text", value, onChange, required, min, step, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}{required && <span className="text-orange-500 ml-0.5">*</span>}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} min={min} step={step} placeholder={placeholder} disabled={disabled}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-400 transition"
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options, required, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}{required && <span className="text-orange-500 ml-0.5">*</span>}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        required={required} disabled={disabled}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:bg-slate-50 disabled:text-slate-400 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function LabeledTextarea({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
      />
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  const accents = {
    orange: "from-orange-400 to-orange-500",
    blue:   "from-blue-500 to-blue-600",
    green:  "from-emerald-400 to-emerald-500",
    red:    "from-red-400 to-red-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accents[accent] || accents.orange} flex items-center justify-center text-white text-lg shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── GENERATE PAYMENT MODAL ──────────────────────────────────────────────────
function GeneratePaymentModal({ open, onClose, tenancies, onSuccess, toast }) {
  const [form, setForm] = useState({
    tenancyId: "",
    billingMonth: new Date().getMonth() + 1,
    billingYear: new Date().getFullYear(),
    maintenanceCharges: "",
    waterCharges: "",
    electricityCharges: "",
    otherCharges: "",
    otherChargesDescription: "",
    discount: "",
    previousBalance: "",
    adjustments: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.tenancyId) { toast("Please select a tenancy", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rent-payments/generate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          tenancyId: form.tenancyId,
          billingMonth: Number(form.billingMonth),
          billingYear: Number(form.billingYear),
          maintenanceCharges: Number(form.maintenanceCharges) || 0,
          waterCharges: Number(form.waterCharges) || 0,
          electricityCharges: Number(form.electricityCharges) || 0,
          otherCharges: Number(form.otherCharges) || 0,
          otherChargesDescription: form.otherChargesDescription,
          discount: Number(form.discount) || 0,
          previousBalance: Number(form.previousBalance) || 0,
          adjustments: Number(form.adjustments) || 0,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) { toast("Payment generated successfully!", "success"); onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to generate payment", "error"); }
    finally { setLoading(false); }
  };

  const activeTenancies = tenancies.filter((t) => t.status === "Active");

  return (
    <Modal open={open} onClose={onClose} title="Generate Rent Payment">
      <div className="space-y-4">
        <LabeledSelect
          label="Select Tenancy" value={form.tenancyId} onChange={f("tenancyId")} required
          options={[
            { value: "", label: "— Select Tenant —" },
            ...activeTenancies.map((t) => ({
              value: t._id,
              label: `${t.tenantId?.name || "Unknown"} · Room ${t.roomId?.roomNumber || "N/A"} (${t.roomId?.roomType || ""})`,
            })),
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <LabeledSelect label="Billing Month" value={form.billingMonth} onChange={f("billingMonth")}
            options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))} />
          <LabeledInput label="Billing Year" type="number" value={form.billingYear} onChange={f("billingYear")} min="2020" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Maintenance Charges" type="number" value={form.maintenanceCharges} onChange={f("maintenanceCharges")} placeholder="0" min="0" />
          <LabeledInput label="Water Charges" type="number" value={form.waterCharges} onChange={f("waterCharges")} placeholder="0" min="0" />
          <LabeledInput label="Electricity Charges" type="number" value={form.electricityCharges} onChange={f("electricityCharges")} placeholder="0" min="0" />
          <LabeledInput label="Other Charges" type="number" value={form.otherCharges} onChange={f("otherCharges")} placeholder="0" min="0" />
        </div>
        <LabeledInput label="Other Charges Description" value={form.otherChargesDescription} onChange={f("otherChargesDescription")} placeholder="e.g. Cleaning charges" />
        <div className="grid grid-cols-3 gap-3">
          <LabeledInput label="Discount" type="number" value={form.discount} onChange={f("discount")} placeholder="0" min="0" />
          <LabeledInput label="Previous Balance" type="number" value={form.previousBalance} onChange={f("previousBalance")} placeholder="0" />
          <LabeledInput label="Adjustments" type="number" value={form.adjustments} onChange={f("adjustments")} placeholder="0" />
        </div>
        <LabeledTextarea label="Notes" value={form.notes} onChange={f("notes")} placeholder="Any additional notes..." />
        <button
          onClick={submit} disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Payment"}
        </button>
      </div>
    </Modal>
  );
}

// ─── RECORD PAYMENT MODAL ────────────────────────────────────────────────────
function RecordPaymentModal({ open, onClose, payment, onSuccess, toast }) {
  const [form, setForm] = useState({
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    transactionId: "",
    upiId: "",
    notes: "",
    isPartial: false,
    transactionProof: null,
  });
  const [loading, setLoading] = useState(false);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const METHODS = ["Cash", "Bank Transfer", "UPI", "Cheque", "Online Gateway", "Other"];

  const submit = async () => {
    if (!form.amountPaid) { toast("Please enter amount", "error"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("amountPaid", form.amountPaid);
      fd.append("paymentDate", form.paymentDate);
      fd.append("paymentMethod", form.paymentMethod);
      if (form.transactionId) fd.append("transactionId", form.transactionId);
      if (form.paymentMethod === "UPI" && form.upiId) {
        fd.append("upiDetails", JSON.stringify({ upiId: form.upiId, transactionId: form.transactionId }));
      }
      if (form.notes) fd.append("notes", form.notes);
      if (form.isPartial) fd.append("isPartial", "true");
      if (form.transactionProof) fd.append("transactionProof", form.transactionProof);

      const res = await fetch(`${API_BASE}/rent-payments/${payment._id}/record-payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) { toast("Payment recorded!", "success"); onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to record payment", "error"); }
    finally { setLoading(false); }
  };

  const remaining = payment ? payment.amounts.finalAmount - (payment.partialPayments || []).reduce((s, p) => s + p.amount, 0) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      {payment && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-100 rounded-xl p-4 mb-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-bold text-slate-800">{fmt(payment.amounts.finalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">Remaining</span>
              <span className="font-bold text-orange-600">{fmt(remaining)}</span>
            </div>
          </div>
          <LabeledInput label="Amount Paid" type="number" value={form.amountPaid} onChange={f("amountPaid")} required placeholder={remaining} min="1" />
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Payment Date" type="date" value={form.paymentDate} onChange={f("paymentDate")} required />
            <LabeledSelect label="Payment Method" value={form.paymentMethod} onChange={f("paymentMethod")}
              options={METHODS.map((m) => ({ value: m, label: m }))} />
          </div>
          {form.paymentMethod !== "Cash" && (
            <LabeledInput label="Transaction ID" value={form.transactionId} onChange={f("transactionId")} placeholder="e.g. TXN123456789" />
          )}
          {form.paymentMethod === "UPI" && (
            <LabeledInput label="UPI ID" value={form.upiId} onChange={f("upiId")} placeholder="tenant@paytm" />
          )}
          <LabeledTextarea label="Notes" value={form.notes} onChange={f("notes")} placeholder="Payment notes..." />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPartial} onChange={(e) => setForm((p) => ({ ...p, isPartial: e.target.checked }))}
              className="w-4 h-4 accent-orange-500" />
            <span className="text-sm text-slate-600">Mark as partial payment</span>
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction Proof</label>
            <input type="file" accept="image/*,application/pdf"
              onChange={(e) => setForm((p) => ({ ...p, transactionProof: e.target.files[0] }))}
              className="text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
          </div>
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60">
            {loading ? "Recording..." : "Record Payment"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── WAIVE LATE FEE MODAL ────────────────────────────────────────────────────
function WaiveLateFeeModal({ open, onClose, payment, onSuccess, toast }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rent-payments/${payment._id}/waive-late-fee`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) { toast("Late fee waived!", "success"); onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to waive late fee", "error"); }
    finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Waive Late Fee">
      {payment && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm text-slate-600">Current late fee: <span className="font-bold text-red-600">{fmt(payment.amounts.lateFee)}</span></p>
            <p className="text-xs text-slate-400 mt-0.5">Days overdue: {payment.lateFeeCalculation?.daysOverdue || 0}</p>
          </div>
          <LabeledTextarea label="Reason for Waiver" value={reason} onChange={setReason} placeholder="e.g. Good tenant, first time delay" />
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60">
            {loading ? "Waiving..." : "Waive Late Fee"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── APPLY DISCOUNT MODAL ────────────────────────────────────────────────────
function ApplyDiscountModal({ open, onClose, payment, onSuccess, toast }) {
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!discountAmount) { toast("Enter discount amount", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rent-payments/${payment._id}/apply-discount`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ discountAmount: Number(discountAmount), discountReason }),
      });
      const data = await res.json();
      if (data.success) { toast("Discount applied!", "success"); onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to apply discount", "error"); }
    finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Apply Discount">
      {payment && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-slate-600">Current total: <span className="font-bold text-blue-700">{fmt(payment.amounts.finalAmount)}</span></p>
          </div>
          <LabeledInput label="Discount Amount" type="number" value={discountAmount} onChange={setDiscountAmount} required placeholder="Enter amount" min="0" />
          <LabeledTextarea label="Reason" value={discountReason} onChange={setDiscountReason} placeholder="e.g. Diwali discount" />
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60">
            {loading ? "Applying..." : "Apply Discount"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── CANCEL PAYMENT MODAL ────────────────────────────────────────────────────
function CancelPaymentModal({ open, onClose, payment, onSuccess, toast }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rent-payments/${payment._id}/cancel`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) { toast("Payment cancelled", "success"); onSuccess(); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to cancel", "error"); }
    finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Cancel Payment">
      {payment && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">Payment: <span className="font-semibold text-slate-700">{payment.paymentNumber}</span></p>
            <p className="text-sm text-slate-500">Amount: <span className="font-semibold text-slate-700">{fmt(payment.amounts.finalAmount)}</span></p>
          </div>
          <LabeledTextarea label="Reason for Cancellation" value={reason} onChange={setReason} placeholder="e.g. Tenant vacated before billing period" />
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60">
            {loading ? "Cancelling..." : "Cancel Payment"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── SEND REMINDER MODAL ──────────────────────────────────────────────────────
function SendReminderModal({ open, onClose, payment, toast }) {
  const [method, setMethod] = useState("Push Notification");
  const [loading, setLoading] = useState(false);
  const REMINDER_METHODS = ["SMS", "Email", "WhatsApp", "Push Notification"];
  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rent-payments/${payment._id}/send-reminder`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (data.success) { toast("Reminder sent!", "success"); onClose(); }
      else throw new Error(data.message);
    } catch (e) { toast(e.message || "Failed to send reminder", "error"); }
    finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Send Payment Reminder">
      {payment && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm text-slate-600">Sending to: <span className="font-semibold text-slate-800">{payment.tenantId?.name}</span></p>
            <p className="text-sm text-slate-600">Due: <span className="font-semibold text-orange-600">{fmt(payment.amounts.finalAmount)}</span></p>
          </div>
          <LabeledSelect label="Reminder Method" value={method} onChange={setMethod}
            options={REMINDER_METHODS.map((m) => ({ value: m, label: m }))} />
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60">
            {loading ? "Sending..." : "Send Reminder"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── PAYMENT DETAIL PANEL ─────────────────────────────────────────────────────
function PaymentDetailPanel({ payment, onClose }) {
  if (!payment) return null;
  const totalPartialPaid = (payment.partialPayments || []).reduce((s, p) => s + p.amount, 0);
  const remaining = payment.amounts.finalAmount - totalPartialPaid;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-800 to-slate-900">
        <div>
          <p className="text-xs text-slate-400 font-medium">{payment.paymentNumber}</p>
          <h3 className="text-lg font-bold text-white">{payment.tenantId?.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={payment.status} />
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-sm">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Billing Period */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-2">Billing Period</p>
          <p className="font-bold text-slate-800 text-lg">{MONTHS[(payment.billingPeriod?.month || 1) - 1]} {payment.billingPeriod?.year}</p>
          <p className="text-xs text-slate-500">{fmtDate(payment.billingPeriod?.startDate)} — {fmtDate(payment.billingPeriod?.endDate)}</p>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Amount Breakdown</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              ["Monthly Rent", payment.amounts.monthlyRent],
              ["Maintenance", payment.amounts.maintenanceCharges],
              ["Water", payment.amounts.waterCharges],
              ["Electricity", payment.amounts.electricityCharges],
              ["Other Charges", payment.amounts.otherCharges],
            ].map(([label, value]) => value > 0 && (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-700">{fmt(value)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-700">{fmt(payment.amounts.subtotal)}</span>
            </div>
            {payment.amounts.lateFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-500">Late Fee ({payment.lateFeeCalculation?.daysOverdue}d × {fmt(payment.lateFeeCalculation?.ratePerDay)}/day)</span>
                <span className="font-semibold text-red-500">{fmt(payment.amounts.lateFee)}</span>
              </div>
            )}
            {payment.lateFeeCalculation?.waived && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Late Fee Waived</span>
                <span className="text-green-500">— {fmt(payment.amounts.lateFee || 0)}</span>
              </div>
            )}
            {payment.amounts.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Discount ({payment.amounts.discountReason})</span>
                <span className="font-semibold text-green-500">— {fmt(payment.amounts.discount)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-bold text-slate-800">Total Payable</span>
              <span className="font-bold text-orange-600 text-lg">{fmt(payment.amounts.finalAmount)}</span>
            </div>
            {totalPartialPaid > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paid So Far</span>
                  <span className="font-semibold text-green-600">— {fmt(totalPartialPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Remaining</span>
                  <span className="font-bold text-blue-600">{fmt(remaining)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Due Date", payment.dates?.dueDate],
            ["Grace Period End", payment.dates?.gracePeriodEndDate],
            ["Generated", payment.dates?.generatedDate],
            ["Paid Date", payment.dates?.paidDate],
          ].map(([label, val]) => val && (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-700">{fmtDate(val)}</p>
            </div>
          ))}
        </div>

        {/* Partial Payments */}
        {payment.partialPayments?.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Payment History</p>
            </div>
            <div className="divide-y divide-slate-50">
              {payment.partialPayments.map((pp, i) => (
                <div key={pp._id || i} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{fmt(pp.amount)}</p>
                      <p className="text-xs text-slate-400">{fmtDate(pp.paymentDate)} · {pp.paymentMethod}</p>
                      {pp.transactionId && <p className="text-xs text-slate-400">TXN: {pp.transactionId}</p>}
                      {pp.notes && <p className="text-xs text-slate-400 italic mt-0.5">{pp.notes}</p>}
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">{pp.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {payment.timeline?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Timeline</p>
            <div className="space-y-3 relative">
              <div className="absolute left-3.5 top-1 bottom-1 w-px bg-slate-100" />
              {[...payment.timeline].reverse().map((t, i) => (
                <div key={t._id || i} className="flex gap-3 items-start relative">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-xs flex-shrink-0 z-10 shadow-sm">
                    {t.action === "Generated" ? "📄" : t.action === "Paid" ? "✅" : t.action === "Partial Payment" ? "💰" : t.action === "Waived" ? "🙏" : t.action === "Cancelled" ? "❌" : t.action === "Discount Applied" ? "🏷️" : "📌"}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-slate-700">{t.action}</p>
                      <p className="text-xs text-slate-400">{fmtDate(t.timestamp)}</p>
                    </div>
                    {t.notes && <p className="text-xs text-slate-500 mt-0.5">{t.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{payment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANALYTICS SECTION ────────────────────────────────────────────────────────
function AnalyticsSection({ analytics }) {
  if (!analytics) return null;
  const { overallStats, monthlyData, collectionRate } = analytics;

  const maxExpected = Math.max(...(monthlyData || []).map((m) => m.totalExpected), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800">Revenue Analytics {analytics.year}</h3>
        <div className="text-right">
          <p className="text-2xl font-black text-orange-500">{collectionRate?.toFixed(1)}%</p>
          <p className="text-xs text-slate-400">Collection Rate</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {(monthlyData || []).map((m) => (
          <div key={m._id} className="group">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">{MONTHS[m._id - 1]}</span>
              <span>{fmt(m.totalCollected)} / {fmt(m.totalExpected)}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-orange-200 to-orange-100 rounded-full"
                style={{ width: `${(m.totalExpected / maxExpected) * 100}%` }} />
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full absolute top-0 left-0 transition-all"
                style={{ width: `${(m.totalCollected / maxExpected) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {overallStats && (
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
          {[
            ["Total Expected", fmt(overallStats.totalExpected)],
            ["Total Collected", fmt(overallStats.totalCollected)],
            ["Pending", fmt(overallStats.totalPending)],
            ["Avg Rent", fmt(overallStats.averageRent)],
          ].map(([label, val]) => (
            <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-lg font-bold text-slate-800">{val}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAYMENT CARD ─────────────────────────────────────────────────────────────
function PaymentCard({ payment, onSelect, onRecord, onWaive, onDiscount, onCancel, onReminder }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const totalPaid = (payment.partialPayments || []).reduce((s, p) => s + p.amount, 0);
  const progress = payment.amounts.finalAmount > 0 ? Math.min((totalPaid / payment.amounts.finalAmount) * 100, 100) : 0;

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canRecord = !["Paid", "Cancelled"].includes(payment.status);
  const canWaive = payment.amounts.lateFee > 0 && !payment.lateFeeCalculation?.waived && !["Paid", "Cancelled"].includes(payment.status);
  const canCancel = !["Cancelled", "Paid"].includes(payment.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
      onClick={() => onSelect(payment)}>
      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-orange-400 to-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{payment.paymentNumber}</span>
              <StatusBadge status={payment.status} />
            </div>
            <h4 className="font-bold text-slate-800 text-base">{payment.tenantId?.name || "—"}</h4>
            <p className="text-xs text-slate-400">{payment.tenantId?.phone} · Room {payment.roomId?.roomNumber || "—"}</p>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 min-w-[180px] z-20 animate-fade-in">
                  {canRecord && (
                    <button onClick={() => { setMenuOpen(false); onRecord(payment); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-2">
                      💰 Record Payment
                    </button>
                  )}
                  <button onClick={() => { setMenuOpen(false); onReminder(payment); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                    🔔 Send Reminder
                  </button>
                  {canWaive && (
                    <button onClick={() => { setMenuOpen(false); onWaive(payment); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2">
                      🙏 Waive Late Fee
                    </button>
                  )}
                  <button onClick={() => { setMenuOpen(false); onDiscount(payment); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2">
                    🏷️ Apply Discount
                  </button>
                  {canCancel && (
                    <button onClick={() => { setMenuOpen(false); onCancel(payment); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                      ❌ Cancel Payment
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-black text-slate-800">{fmt(payment.amounts.finalAmount)}</p>
            <p className="text-xs text-slate-400">
              {MONTHS[(payment.billingPeriod?.month || 1) - 1]} {payment.billingPeriod?.year} · Due {fmtDate(payment.dates?.dueDate)}
            </p>
          </div>
          {totalPaid > 0 && (
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">{fmt(totalPaid)} paid</p>
              <p className="text-xs text-slate-400">{fmt(payment.amounts.finalAmount - totalPaid)} left</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalPaid > 0 && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Bottom info */}
        <div className="flex items-center gap-3 flex-wrap">
          {payment.amounts.lateFee > 0 && !payment.lateFeeCalculation?.waived && (
            <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
              +{fmt(payment.amounts.lateFee)} late fee
            </span>
          )}
          {payment.lateFeeCalculation?.waived && (
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
              Late fee waived
            </span>
          )}
          {payment.amounts.discount > 0 && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
              {fmt(payment.amounts.discount)} discount
            </span>
          )}
          {payment.propertyId?.location?.city && (
            <span className="text-xs text-slate-400">📍 {payment.propertyId.location.city}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Modals
  const [genOpen, setGenOpen] = useState(false);
  const [recordPayment, setRecordPayment] = useState(null);
  const [waivePayment, setWaivePayment] = useState(null);
  const [discountPayment, setDiscountPayment] = useState(null);
  const [cancelPayment, setCancelPayment] = useState(null);
  const [reminderPayment, setReminderPayment] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [paymentsRes, tenanciesRes, overdueRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/rent-payments/landlord/my-payments`, { headers }),
        fetch(`${API_BASE}/tenancies/landlord/my-tenancies`, { headers }),
        fetch(`${API_BASE}/rent-payments/landlord/overdue`, { headers }),
        fetch(`${API_BASE}/rent-payments/landlord/analytics`, { headers }),
      ]);
      const [pd, td, od, ad] = await Promise.all([
        paymentsRes.json(), tenanciesRes.json(), overdueRes.json(), analyticsRes.json(),
      ]);
      if (pd.success) setPayments(pd.data || []);
      if (td.success) setTenancies(td.data || []);
      if (od.success) setOverduePayments(od.data || []);
      if (ad.success) setAnalytics(ad);
    } catch (e) { showToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const displayPayments = (activeTab === "overdue" ? overduePayments : payments).filter((p) => {
    const matchSearch = !searchQuery ||
      p.tenantId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tenantId?.phone?.includes(searchQuery);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "Pending").length,
    overdue: overduePayments.length,
    collected: analytics?.overallStats?.totalCollected || 0,
  };

  const STATUSES = ["All", "Pending", "Partial", "Paid", "Overdue", "Waived", "Cancelled"];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">₹</div>
                <span className="text-slate-400 text-sm font-medium">Landlord Dashboard</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Rent Payments</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage and track all tenant payments</p>
            </div>
            <button onClick={() => setGenOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 text-sm">
              <span className="text-base">+</span> Generate Payment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Payments" value={stats.total} icon="📋" accent="blue" />
          <StatCard label="Pending" value={stats.pending} icon="⏳" accent="orange" />
          <StatCard label="Overdue" value={stats.overdue} icon="⚠" accent="red" />
          <StatCard label="Collected" value={fmt(stats.collected)} icon="💰" accent="green" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Payments List */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tabs + Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <div className="flex gap-1">
                {[
                  { key: "all", label: "All Payments", count: payments.length },
                  { key: "overdue", label: "Overdue", count: overduePayments.length, badge: true },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}>
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.key ? "bg-white/20" : tab.badge ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                      }`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, payment no..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 focus:bg-white transition" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 text-slate-600">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Payment Cards */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-6 bg-slate-100 rounded w-1/2 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : displayPayments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
                <p className="font-bold text-slate-700">No payments found</p>
                <p className="text-slate-400 text-sm mt-1">Generate a new payment to get started</p>
                <button onClick={() => setGenOpen(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Generate Payment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayPayments.map((payment) => (
                  <PaymentCard key={payment._id} payment={payment}
                    onSelect={setSelectedPayment}
                    onRecord={setRecordPayment}
                    onWaive={setWaivePayment}
                    onDiscount={setDiscountPayment}
                    onCancel={setCancelPayment}
                    onReminder={setReminderPayment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <AnalyticsSection analytics={analytics} />

            {/* Overdue Summary */}
            {overduePayments.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-red-500 text-sm">⚠</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Overdue Payments</p>
                    <p className="text-xs text-slate-400">{overduePayments.length} payment(s)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {overduePayments.slice(0, 3).map((p) => (
                    <div key={p._id} onClick={() => setSelectedPayment(p)}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{p.tenantId?.name}</p>
                        <p className="text-xs text-slate-400">{MONTHS[(p.billingPeriod?.month || 1) - 1]}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">{fmt(p.amounts.finalAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedPayment && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30" onClick={() => setSelectedPayment(null)} />
          <PaymentDetailPanel payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
        </>
      )}

      {/* Modals */}
      <GeneratePaymentModal open={genOpen} onClose={() => setGenOpen(false)} tenancies={tenancies} onSuccess={fetchAll} toast={showToast} />
      <RecordPaymentModal open={!!recordPayment} onClose={() => setRecordPayment(null)} payment={recordPayment} onSuccess={fetchAll} toast={showToast} />
      <WaiveLateFeeModal open={!!waivePayment} onClose={() => setWaivePayment(null)} payment={waivePayment} onSuccess={fetchAll} toast={showToast} />
      <ApplyDiscountModal open={!!discountPayment} onClose={() => setDiscountPayment(null)} payment={discountPayment} onSuccess={fetchAll} toast={showToast} />
      <CancelPaymentModal open={!!cancelPayment} onClose={() => setCancelPayment(null)} payment={cancelPayment} onSuccess={fetchAll} toast={showToast} />
      <SendReminderModal open={!!reminderPayment} onClose={() => setReminderPayment(null)} payment={reminderPayment} toast={showToast} />
    </div>
  );
}