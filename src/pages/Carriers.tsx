import { useState, useRef } from 'react';
import { Upload, CheckCircle, Truck, FileText, Shield, DollarSign, Clock, ArrowRight, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const benefits = [
  { icon: DollarSign, title: 'Top Market Rates', desc: 'We negotiate aggressively. Our carriers average 18% above spot market rates.' },
  { icon: Clock, title: '24/7 Dispatcher', desc: 'A real human dispatcher is available any time — nights, holidays, weekends.' },
  { icon: Shield, title: 'Vetted Brokers Only', desc: 'We work only with licensed, bonded brokers. Your load is safe and your payment is secure.' },
  { icon: FileText, title: 'No Forced Dispatch', desc: 'You control your schedule. We suggest loads; you decide what to haul.' },
];

const equipmentTypes = [
  { name: 'Dry Van', icon: '🚛', desc: '48/53 ft enclosed trailers for general commodities.' },
  { name: 'Reefer', icon: '❄️', desc: 'Temperature-controlled for food, pharma, and perishables.' },
  { name: 'Flatbed', icon: '🏗️', desc: 'Open deck for steel, lumber, machinery, and oversized.' },
  { name: 'Power Only', icon: '⚡', desc: 'Hook to shipper-owned trailers. Maximize your time.' },
  { name: 'Hot Shot', icon: '🚐', desc: 'Small urgent loads with dedicated delivery timelines.' },
  { name: 'Step Deck', icon: '🔩', desc: 'For taller loads that need a lower deck height.' },
];

interface FormData {
  company_name: string;
  mc_number: string;
  dot_number: string;
  email: string;
  phone: string;
  equipment_types: string[];
}

interface FileState {
  file: File | null;
  preview: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

function FileUploadZone({
  label,
  hint,
  required,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  required?: boolean;
  value: FileState;
  onChange: (state: FileState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    onChange({ file, preview: file.name });
  };

  return (
    <div>
      <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragging ? 'border-sunny-400 bg-sunny-50' : value.file ? 'border-green-400 bg-green-50' : 'border-charcoal-200 hover:border-sunny-400 hover:bg-sunny-50/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
        {value.file ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <div className="font-body font-600 text-green-700 text-sm">{value.preview}</div>
              <div className="font-body text-green-600 text-xs">File ready to upload</div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange({ file: null, preview: '' }); }}
              className="ml-2 text-green-500 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
            <div className="font-body font-600 text-charcoal-500 text-sm">Drop file here or click to browse</div>
            <div className="font-body text-charcoal-300 text-xs mt-1">{hint}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Carriers() {
  const [form, setForm] = useState<FormData>({
    company_name: '',
    mc_number: '',
    dot_number: '',
    email: '',
    phone: '',
    equipment_types: [],
  });

  const [mcAuthority, setMcAuthority] = useState<FileState>({ file: null, preview: '' });
  const [w9, setW9] = useState<FileState>({ file: null, preview: '' });
  const [insurance, setInsurance] = useState<FileState>({ file: null, preview: '' });

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleEquipment = (type: string) => {
    setForm((prev) => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(type)
        ? prev.equipment_types.filter((t) => t !== type)
        : [...prev.equipment_types, type],
    }));
  };

  const getFileExtension = (fileName: string) => {
    const extension = fileName.split('.').pop();
    return extension ? `.${extension.toLowerCase()}` : '';
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage
      .from('carrier-documents')
      .upload(path, file, { upsert: false });

    if (error) throw error;

    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.mc_number || !form.email || !form.phone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (form.equipment_types.length === 0) {
      setErrorMsg('Please select at least one equipment type.');
      return;
    }
    if (!mcAuthority.file || !insurance.file) {
      setErrorMsg('MC Authority and Insurance Certificate are required documents.');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      const timestamp = Date.now();
      const sanitized = form.mc_number.replace(/[^a-z0-9]/gi, '');

      let mcUrl = '';
      let w9Url = '';
      let insuranceUrl = '';

      const folderName = sanitized || `carrier-${timestamp}`;

      mcUrl = await uploadFile(
        mcAuthority.file,
        `${folderName}/mc-authority-${timestamp}${getFileExtension(mcAuthority.file.name)}`
      );

      if (w9.file) {
        w9Url = await uploadFile(
          w9.file,
          `${folderName}/w9-${timestamp}${getFileExtension(w9.file.name)}`
        );
      }

      insuranceUrl = await uploadFile(
        insurance.file,
        `${folderName}/insurance-${timestamp}${getFileExtension(insurance.file.name)}`
      );

      const { error } = await supabase.from('carrier_registrations').insert({
        company_name: form.company_name.trim(),
        mc_number: form.mc_number.trim(),
        dot_number: form.dot_number.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        equipment_types: form.equipment_types,
        mc_authority_url: mcUrl,
        w9_url: w9Url,
        insurance_url: insuranceUrl,
        status: 'pending',
      });

      if (error) throw error;
      setStatus('success');
    } catch (error) {
      console.error('Carrier registration failed:', error);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or contact us directly.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-heading font-800 text-2xl text-charcoal-700 mb-3">You're Registered!</h2>
          <p className="font-body text-charcoal-400 leading-relaxed mb-6">
            We've received your application for <strong>{form.company_name}</strong>. Our team will review your documents and reach out within 24-48 hours to start finding loads for you.
          </p>
          <div className="bg-sunny-50 border border-sunny-200 rounded-xl p-4 text-left">
            <div className="font-body font-600 text-charcoal-600 text-sm mb-2">What happens next:</div>
            <ul className="space-y-1.5">
              {['Document verification (24-48 hrs)', 'Dispatcher assigned to your account', 'Load search begins immediately'].map((step) => (
                <li key={step} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sunny-500" />
                  <span className="font-body text-charcoal-500 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body pt-16 lg:pt-20">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Carrier trucks"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/95 to-charcoal-800/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="font-body font-600 text-sunny-400 text-sm tracking-wider uppercase">For Carriers & Owner-Operators</span>
            <h1 className="font-heading font-800 text-4xl lg:text-5xl text-white mt-3 mb-5 leading-tight">
              Your Truck. Our Loads.<br />
              <span className="text-sunny-400">Maximum Earnings.</span>
            </h1>
            <p className="font-body text-white/75 text-lg leading-relaxed">
              Stop wasting hours on load boards. Let our expert dispatchers find you the highest-paying loads so you can focus on what you do best — driving.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-charcoal-100 hover:border-sunny-300 hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 bg-sunny-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-sunny-500" />
                </div>
                <h3 className="font-heading font-700 text-charcoal-700 text-base mb-1.5">{title}</h3>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-800 text-2xl lg:text-3xl text-charcoal-700">Equipment We Dispatch</h2>
            <p className="font-body text-charcoal-400 mt-2">Select your equipment type during registration below.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {equipmentTypes.map((eq) => (
              <div key={eq.name} className="bg-white rounded-2xl p-5 text-center border border-charcoal-100 hover:border-sunny-400 hover:shadow-md transition-all duration-200 cursor-default">
                <div className="text-3xl mb-2">{eq.icon}</div>
                <div className="font-heading font-700 text-charcoal-700 text-sm mb-1">{eq.name}</div>
                <div className="font-body text-charcoal-400 text-xs leading-relaxed">{eq.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="register">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Carrier Portal</span>
            <h2 className="font-heading font-800 text-3xl text-charcoal-700 mt-2 mb-3">Register Your Operation</h2>
            <p className="font-body text-charcoal-400">
              Complete the form below and upload your documents. Our team reviews and onboards you within 48 hours.
            </p>
          </div>

          <div className="bg-white border border-charcoal-100 rounded-2xl shadow-xl p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-charcoal-100 pb-6">
                <h3 className="font-heading font-700 text-charcoal-700 text-lg mb-5 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sunny-500" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      placeholder="ABC Trucking LLC"
                    />
                  </div>
                  <div>
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">
                      MC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.mc_number}
                      onChange={(e) => setForm((p) => ({ ...p, mc_number: e.target.value }))}
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      placeholder="MC-XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">DOT Number</label>
                    <input
                      type="text"
                      value={form.dot_number}
                      onChange={(e) => setForm((p) => ({ ...p, dot_number: e.target.value }))}
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      placeholder="USDOT XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      placeholder="dispatch@yourcompany.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-charcoal-100 pb-6">
                <h3 className="font-heading font-700 text-charcoal-700 text-lg mb-5">
                  Equipment Type <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {equipmentTypes.map((eq) => (
                    <button
                      key={eq.name}
                      type="button"
                      onClick={() => toggleEquipment(eq.name)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-body font-600 text-sm transition-all duration-200 ${
                        form.equipment_types.includes(eq.name)
                          ? 'border-sunny-400 bg-sunny-50 text-charcoal-700'
                          : 'border-charcoal-100 text-charcoal-500 hover:border-charcoal-300'
                      }`}
                    >
                      <span>{eq.icon}</span>
                      <span>{eq.name}</span>
                      {form.equipment_types.includes(eq.name) && (
                        <CheckCircle className="w-4 h-4 text-sunny-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-heading font-700 text-charcoal-700 text-lg mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sunny-500" />
                  Document Upload
                </h3>
                <p className="font-body text-charcoal-400 text-sm mb-5">
                  All documents are stored securely and only accessed by our dispatch team.
                </p>
                <div className="space-y-4">
                  <FileUploadZone
                    label="MC Authority Certificate"
                    hint="PDF, JPG, or PNG — max 10MB"
                    required
                    value={mcAuthority}
                    onChange={setMcAuthority}
                  />
                  <FileUploadZone
                    label="W-9 Form"
                    hint="PDF or image — required for payment processing"
                    value={w9}
                    onChange={setW9}
                  />
                  <FileUploadZone
                    label="Insurance Certificate (COI)"
                    hint="Must show $1M liability minimum"
                    required
                    value={insurance}
                    onChange={setInsurance}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-body text-red-600 text-sm">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'uploading'}
                className="w-full flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 disabled:opacity-60 disabled:cursor-not-allowed text-charcoal-800 font-heading font-700 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg text-base"
              >
                {status === 'uploading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-charcoal-700/30 border-t-charcoal-700 rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="font-body text-charcoal-400 text-xs text-center">
                By submitting, you agree to our dispatch service terms. Your documents are encrypted and never shared without consent.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
