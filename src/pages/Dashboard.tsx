import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  Inbox,
  LogOut,
  Mail,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sun,
  Truck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  type: string;
  created_at: string;
}

interface CarrierRegistration {
  id: string;
  company_name: string;
  mc_number: string;
  dot_number: string | null;
  email: string;
  phone: string;
  equipment_types: string[] | null;
  mc_authority_url: string | null;
  w9_url: string | null;
  insurance_url: string | null;
  status: string;
  created_at: string;
}

interface LoadStat {
  id: string;
  month: string;
  loads_moved: number;
  updated_at: string;
}

interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
}

interface DocumentPreview {
  title: string;
  filePath: string;
  signedUrl: string;
  fileType: 'image' | 'pdf' | 'other';
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'approved') {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (normalized === 'rejected') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-sunny-400/10 text-charcoal-700 border-sunny-400/30';
}

function detectFileType(filePath: string): DocumentPreview['fileType'] {
  const lower = filePath.toLowerCase();

  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
    return 'image';
  }

  if (lower.endsWith('.pdf')) {
    return 'pdf';
  }

  return 'other';
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [carriers, setCarriers] = useState<CarrierRegistration[]>([]);
  const [loadStats, setLoadStats] = useState<LoadStat | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRegistration | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [updatingCarrierId, setUpdatingCarrierId] = useState<string | null>(null);

  const shipperRequests = useMemo(
    () => contacts.filter((contact) => contact.type === 'shipper'),
    [contacts]
  );

  const pendingCarriers = useMemo(
    () => carriers.filter((carrier) => carrier.status === 'pending'),
    [carriers]
  );

  const selectedCarrierLive = useMemo(() => {
    if (!selectedCarrier) return null;
    return carriers.find((carrier) => carrier.id === selectedCarrier.id) || selectedCarrier;
  }, [carriers, selectedCarrier]);

  const loadDashboardData = async () => {
    setLoading(true);
    setNotice('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const [contactsResponse, carriersResponse, loadStatsResponse, userResponse] = await Promise.all([
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('carrier_registrations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('load_stats')
          .select('*')
          .order('month', { ascending: false })
          .limit(1)
          .maybeSingle(),
        sessionData.session
          ? supabase
              .from('users')
              .select('id, email, full_name, role, is_active')
              .eq('id', sessionData.session.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (contactsResponse.error) throw contactsResponse.error;
      if (carriersResponse.error) throw carriersResponse.error;
      if (loadStatsResponse.error) throw loadStatsResponse.error;
      if (userResponse.error) throw userResponse.error;

      setContacts((contactsResponse.data || []) as ContactSubmission[]);
      setCarriers((carriersResponse.data || []) as CarrierRegistration[]);
      setLoadStats((loadStatsResponse.data || null) as LoadStat | null);
      setCurrentUser((userResponse.data || null) as AppUser | null);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setNotice('Failed to load dashboard data. Make sure you are logged in and your Supabase policies allow authenticated users to view submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const updateCarrierStatus = async (
    carrierId: string,
    status: 'approved' | 'rejected' | 'pending'
  ) => {
    setNotice('');
    setUpdatingCarrierId(carrierId);

    try {
      const { error } = await supabase
        .from('carrier_registrations')
        .update({ status })
        .eq('id', carrierId);

      if (error) throw error;

      setCarriers((currentCarriers) =>
        currentCarriers.map((carrier) =>
          carrier.id === carrierId ? { ...carrier, status } : carrier
        )
      );

      setSelectedCarrier((currentCarrier) =>
        currentCarrier?.id === carrierId ? { ...currentCarrier, status } : currentCarrier
      );

      setNotice(`Carrier registration ${status} successfully.`);
    } catch (error) {
      console.error('Failed to update carrier status:', error);
      setNotice('Failed to update carrier status. Make sure your user role is admin or manager and RLS policies allow updates.');
    } finally {
      setUpdatingCarrierId(null);
    }
  };

  const openCarrierDocument = async (title: string, filePath: string | null) => {
    setNotice('');

    if (!filePath) {
      setNotice('No document was uploaded for this field.');
      return;
    }

    setDocumentLoading(true);

    try {
      const { data, error } = await supabase.storage
        .from('carrier-documents')
        .createSignedUrl(filePath, 60 * 5);

      if (error) throw error;

      if (data?.signedUrl) {
        setDocumentPreview({
          title,
          filePath,
          signedUrl: data.signedUrl,
          fileType: detectFileType(filePath),
        });
      }
    } catch (error) {
      console.error('Failed to open document:', error);
      setNotice('Unable to preview this document. Check the storage bucket policies.');
    } finally {
      setDocumentLoading(false);
    }
  };

  const closeDocumentModal = () => {
    setDocumentPreview(null);
  };

  const cards = [
    {
      label: 'Carrier Applications',
      value: carriers.length,
      icon: Truck,
      helper: `${pendingCarriers.length} pending review`,
    },
    {
      label: 'Total Submissions',
      value: contacts.length,
      icon: Inbox,
      helper: 'Latest contact and quote messages',
    },
    {
      label: 'Shipper Requests',
      value: shipperRequests.length,
      icon: PackageCheck,
      helper: 'Requests saved from shipper form',
    },
    {
      label: 'Loads This Month',
      value: loadStats?.loads_moved ?? 0,
      icon: BarChart3,
      helper: loadStats ? `Month: ${loadStats.month}` : 'No load stats yet',
    },
  ];

  return (
    <section className="min-h-screen bg-charcoal-50 pb-12">
      <div className="bg-charcoal-700 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sunny-400/10 border border-sunny-400/30 text-sunny-300 px-4 py-2 rounded-full font-body text-sm font-600 mb-4">
                <ShieldCheck className="w-4 h-4" />
                Sunny Logistics Admin
              </div>

              <h1 className="font-heading font-800 text-3xl sm:text-4xl text-white">
                Dashboard
              </h1>

              <p className="font-body text-white/60 mt-2">
                Manage carrier applications, uploaded documents, contact messages, and shipper requests.
              </p>

              {currentUser && (
                <p className="font-body text-sunny-300 text-sm mt-2">
                  Logged in as {currentUser.full_name?.trim() || currentUser.email} · Role:{' '}
                  <span className="font-700 capitalize">{currentUser.role}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadDashboardData}
                type="button"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-heading font-700 px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-800 px-4 py-2.5 rounded-xl transition-colors shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {notice && (
          <div className="mb-6 rounded-2xl border border-sunny-400/40 bg-sunny-50 px-5 py-4">
            <p className="font-body text-sm text-charcoal-700">{notice}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="w-12 h-12 border-4 border-sunny-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-heading font-700 text-charcoal-800">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.label} className="bg-white rounded-2xl shadow-lg p-5 border border-charcoal-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-body text-sm text-charcoal-500">{card.label}</p>
                        <p className="font-heading font-800 text-3xl text-charcoal-800 mt-1">{card.value}</p>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-sunny-400/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-sunny-600" />
                      </div>
                    </div>
                    <p className="font-body text-xs text-charcoal-400 mt-4">{card.helper}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-8 mb-8">
              <div className="bg-white rounded-3xl shadow-lg border border-charcoal-100 overflow-hidden">
                <div className="p-6 border-b border-charcoal-100 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-800 text-xl text-charcoal-800">Carrier Registrations</h2>
                    <p className="font-body text-sm text-charcoal-500 mt-1">
                      Click any row to view full registration details, documents, and approval actions.
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-sunny-500" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-charcoal-50">
                      <tr>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Company</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">MC / DOT</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Status</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Documents</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100">
                      {carriers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center font-body text-charcoal-400">
                            No carrier registrations yet.
                          </td>
                        </tr>
                      ) : (
                        carriers.slice(0, 10).map((carrier) => (
                          <tr
                            key={carrier.id}
                            onClick={() => setSelectedCarrier(carrier)}
                            className="hover:bg-charcoal-50/70 transition-colors cursor-pointer"
                            title="Click to view full carrier registration"
                          >
                            <td className="px-5 py-4">
                              <p className="font-heading font-700 text-sm text-charcoal-800">{carrier.company_name}</p>
                              <p className="font-body text-xs text-charcoal-500">{carrier.email}</p>
                              <p className="font-body text-xs text-charcoal-400">{carrier.phone}</p>
                              <p className="font-body text-[11px] text-sunny-600 mt-1 font-700">View details</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-body text-sm text-charcoal-700">MC: {carrier.mc_number}</p>
                              <p className="font-body text-sm text-charcoal-500">DOT: {carrier.dot_number || '—'}</p>
                              <p className="font-body text-xs text-charcoal-400 mt-1">
                                {(carrier.equipment_types || []).join(', ') || 'No equipment listed'}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full border px-3 py-1 font-body text-xs font-700 capitalize ${statusBadge(carrier.status)}`}>
                                {carrier.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openCarrierDocument('MC Authority', carrier.mc_authority_url);
                                  }}
                                  type="button"
                                  disabled={documentLoading}
                                  className="inline-flex items-center gap-1 rounded-lg bg-charcoal-700 hover:bg-charcoal-800 disabled:opacity-60 text-white px-3 py-2 font-body text-xs font-600 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  MC
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openCarrierDocument('W-9 Document', carrier.w9_url);
                                  }}
                                  type="button"
                                  disabled={documentLoading}
                                  className="inline-flex items-center gap-1 rounded-lg bg-charcoal-700 hover:bg-charcoal-800 disabled:opacity-60 text-white px-3 py-2 font-body text-xs font-600 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  W-9
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openCarrierDocument('Insurance Certificate', carrier.insurance_url);
                                  }}
                                  type="button"
                                  disabled={documentLoading}
                                  className="inline-flex items-center gap-1 rounded-lg bg-sunny-400 hover:bg-sunny-500 disabled:opacity-60 text-charcoal-800 px-3 py-2 font-body text-xs font-800 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Insurance
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updateCarrierStatus(carrier.id, 'approved');
                                  }}
                                  type="button"
                                  disabled={updatingCarrierId === carrier.id || carrier.status === 'approved'}
                                  className="inline-flex items-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-100 disabled:text-green-500 text-white px-3 py-2 font-body text-xs font-700 transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </button>

                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updateCarrierStatus(carrier.id, 'rejected');
                                  }}
                                  type="button"
                                  disabled={updatingCarrierId === carrier.id || carrier.status === 'rejected'}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-100 disabled:text-red-500 text-white px-3 py-2 font-body text-xs font-700 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>

                                {carrier.status !== 'pending' && (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      updateCarrierStatus(carrier.id, 'pending');
                                    }}
                                    type="button"
                                    disabled={updatingCarrierId === carrier.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-charcoal-100 hover:bg-charcoal-200 disabled:opacity-60 text-charcoal-700 px-3 py-2 font-body text-xs font-700 transition-colors"
                                  >
                                    Pending
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-charcoal-100 overflow-hidden">
                <div className="p-6 border-b border-charcoal-100 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-800 text-xl text-charcoal-800">Contact Submissions</h2>
                    <p className="font-body text-sm text-charcoal-500 mt-1">Click any row to view full submission details.</p>
                  </div>
                  <Mail className="w-6 h-6 text-sunny-500" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-charcoal-50">
                      <tr>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Name</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Type</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Email</th>
                        <th className="px-5 py-3 text-left font-heading font-700 text-xs uppercase tracking-wider text-charcoal-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100">
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center font-body text-charcoal-400">
                            No contact submissions yet.
                          </td>
                        </tr>
                      ) : (
                        contacts.slice(0, 10).map((contact) => (
                          <tr
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="hover:bg-charcoal-50/70 transition-colors cursor-pointer"
                            title="Click to view full submission"
                          >
                            <td className="px-5 py-4">
                              <p className="font-heading font-700 text-sm text-charcoal-800">{contact.name}</p>
                              <p className="font-body text-xs text-charcoal-500 max-w-xs truncate">{contact.message}</p>
                              <p className="font-body text-[11px] text-sunny-600 mt-1 font-700">View details</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full border border-sunny-400/30 bg-sunny-400/10 px-3 py-1 font-body text-xs font-600 text-charcoal-700 capitalize">
                                {contact.type}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-body text-sm text-charcoal-600">{contact.email}</td>
                            <td className="px-5 py-4 font-body text-sm text-charcoal-500">{formatDate(contact.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-charcoal-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sunny-400/15 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-sunny-600" />
                  </div>
                  <div>
                    <h2 className="font-heading font-800 text-xl text-charcoal-800">Load Stats</h2>
                    <p className="font-body text-sm text-charcoal-500 mt-1">
                      Homepage load counter currently shows{' '}
                      <span className="font-700 text-charcoal-800">{loadStats?.loads_moved ?? 0}</span> loads
                      {loadStats?.month ? ` for ${loadStats.month}` : ''}.
                    </p>
                    <p className="font-body text-xs text-charcoal-400 mt-1">
                      Last updated: {formatDate(loadStats?.updated_at)}
                    </p>
                  </div>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 bg-charcoal-700 hover:bg-charcoal-800 text-white font-heading font-700 px-5 py-3 rounded-xl transition-colors"
                >
                  <Sun className="w-4 h-4 text-sunny-400" />
                  View Website
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedCarrierLive && (
        <div className="fixed inset-0 z-[100] bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-charcoal-100">
              <div>
                <div className={`inline-flex rounded-full border px-3 py-1 font-body text-xs font-700 capitalize mb-2 ${statusBadge(selectedCarrierLive.status)}`}>
                  {selectedCarrierLive.status}
                </div>
                <h3 className="font-heading font-800 text-2xl text-charcoal-800">
                  {selectedCarrierLive.company_name}
                </h3>
                <p className="font-body text-sm text-charcoal-500">
                  Carrier registration submitted on {formatDate(selectedCarrierLive.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCarrier(null)}
                className="w-10 h-10 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-charcoal-700 transition-colors shrink-0"
                aria-label="Close carrier details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-auto flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Company</p>
                  <p className="font-body text-charcoal-800 font-600">{selectedCarrierLive.company_name || '—'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Email</p>
                  <a
                    href={`mailto:${selectedCarrierLive.email}`}
                    className="font-body text-charcoal-800 font-600 hover:text-sunny-600 transition-colors break-all"
                  >
                    {selectedCarrierLive.email || '—'}
                  </a>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Phone</p>
                  <a
                    href={`tel:${selectedCarrierLive.phone}`}
                    className="font-body text-charcoal-800 font-600 hover:text-sunny-600 transition-colors"
                  >
                    {selectedCarrierLive.phone || '—'}
                  </a>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">MC Number</p>
                  <p className="font-body text-charcoal-800 font-600">{selectedCarrierLive.mc_number || '—'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">DOT Number</p>
                  <p className="font-body text-charcoal-800 font-600">{selectedCarrierLive.dot_number || '—'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Submitted Date</p>
                  <p className="font-body text-charcoal-800 font-600">{formatDate(selectedCarrierLive.created_at)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-charcoal-100 shadow-sm p-5 mb-6">
                <p className="font-heading font-800 text-sm uppercase tracking-wider text-charcoal-500 mb-3">
                  Equipment Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedCarrierLive.equipment_types || []).length > 0 ? (
                    selectedCarrierLive.equipment_types?.map((equipment) => (
                      <span
                        key={equipment}
                        className="inline-flex rounded-full border border-sunny-400/30 bg-sunny-400/10 px-3 py-1 font-body text-xs font-700 text-charcoal-700"
                      >
                        {equipment}
                      </span>
                    ))
                  ) : (
                    <p className="font-body text-charcoal-500 text-sm">No equipment listed.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-charcoal-100 shadow-sm p-5">
                <p className="font-heading font-800 text-sm uppercase tracking-wider text-charcoal-500 mb-3">
                  Uploaded Documents
                </p>

                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => openCarrierDocument('MC Authority', selectedCarrierLive.mc_authority_url)}
                    type="button"
                    disabled={documentLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-700 hover:bg-charcoal-800 disabled:opacity-60 text-white px-4 py-3 font-heading font-700 text-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    MC Authority
                  </button>

                  <button
                    onClick={() => openCarrierDocument('W-9 Document', selectedCarrierLive.w9_url)}
                    type="button"
                    disabled={documentLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-700 hover:bg-charcoal-800 disabled:opacity-60 text-white px-4 py-3 font-heading font-700 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    W-9 Document
                  </button>

                  <button
                    onClick={() => openCarrierDocument('Insurance Certificate', selectedCarrierLive.insurance_url)}
                    type="button"
                    disabled={documentLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sunny-400 hover:bg-sunny-500 disabled:opacity-60 text-charcoal-800 px-4 py-3 font-heading font-800 text-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Insurance
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-charcoal-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <p className="font-body text-xs text-charcoal-400">
                Carrier registration ID: {selectedCarrierLive.id}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateCarrierStatus(selectedCarrierLive.id, 'approved')}
                  type="button"
                  disabled={updatingCarrierId === selectedCarrierLive.id || selectedCarrierLive.status === 'approved'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-100 disabled:text-green-500 text-white px-4 py-2.5 font-heading font-800 text-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>

                <button
                  onClick={() => updateCarrierStatus(selectedCarrierLive.id, 'rejected')}
                  type="button"
                  disabled={updatingCarrierId === selectedCarrierLive.id || selectedCarrierLive.status === 'rejected'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-100 disabled:text-red-500 text-white px-4 py-2.5 font-heading font-800 text-sm transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>

                {selectedCarrierLive.status !== 'pending' && (
                  <button
                    onClick={() => updateCarrierStatus(selectedCarrierLive.id, 'pending')}
                    type="button"
                    disabled={updatingCarrierId === selectedCarrierLive.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 disabled:opacity-60 text-charcoal-700 px-4 py-2.5 font-heading font-800 text-sm transition-colors"
                  >
                    Pending
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCarrier(null)}
                  className="inline-flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-800 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 z-[100] bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-charcoal-100">
              <div>
                <div className="inline-flex rounded-full border border-sunny-400/30 bg-sunny-400/10 px-3 py-1 font-body text-xs font-700 text-charcoal-700 capitalize mb-2">
                  {selectedContact.type} Submission
                </div>
                <h3 className="font-heading font-800 text-2xl text-charcoal-800">
                  {selectedContact.name}
                </h3>
                <p className="font-body text-sm text-charcoal-500">
                  Submitted on {formatDate(selectedContact.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="w-10 h-10 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-charcoal-700 transition-colors shrink-0"
                aria-label="Close contact details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-auto flex-1">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Name</p>
                  <p className="font-body text-charcoal-800 font-600">{selectedContact.name || '—'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Email</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="font-body text-charcoal-800 font-600 hover:text-sunny-600 transition-colors break-all"
                  >
                    {selectedContact.email || '—'}
                  </a>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Phone</p>
                  {selectedContact.phone ? (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="font-body text-charcoal-800 font-600 hover:text-sunny-600 transition-colors"
                    >
                      {selectedContact.phone}
                    </a>
                  ) : (
                    <p className="font-body text-charcoal-500">—</p>
                  )}
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Company</p>
                  <p className="font-body text-charcoal-800 font-600">{selectedContact.company || '—'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Type</p>
                  <p className="font-body text-charcoal-800 font-600 capitalize">{selectedContact.type || 'general'}</p>
                </div>

                <div className="rounded-2xl bg-charcoal-50 border border-charcoal-100 p-4">
                  <p className="font-heading font-700 text-xs uppercase tracking-wider text-charcoal-400 mb-1">Date</p>
                  <p className="font-body text-charcoal-800 font-600">{formatDate(selectedContact.created_at)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-charcoal-100 shadow-sm p-5">
                <p className="font-heading font-800 text-sm uppercase tracking-wider text-charcoal-500 mb-3">
                  Full Message
                </p>
                <p className="font-body text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-charcoal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="font-body text-xs text-charcoal-400">
                Contact submission ID: {selectedContact.id}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="inline-flex items-center justify-center gap-2 bg-charcoal-700 hover:bg-charcoal-800 text-white font-heading font-700 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Reply by Email
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="inline-flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-800 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {documentPreview && (
        <div className="fixed inset-0 z-[110] bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-charcoal-100">
              <div>
                <h3 className="font-heading font-800 text-lg text-charcoal-800">
                  {documentPreview.title}
                </h3>
                <p className="font-body text-xs text-charcoal-400 truncate max-w-[60vw]">
                  {documentPreview.filePath}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDocumentModal}
                className="w-10 h-10 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-charcoal-700 transition-colors"
                aria-label="Close document preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-charcoal-50 p-4 sm:p-6 overflow-auto flex-1">
              {documentPreview.fileType === 'image' && (
                <img
                  src={documentPreview.signedUrl}
                  alt={documentPreview.title}
                  className="max-w-full max-h-[65vh] mx-auto rounded-2xl shadow-lg bg-white object-contain"
                />
              )}

              {documentPreview.fileType === 'pdf' && (
                <iframe
                  src={documentPreview.signedUrl}
                  title={documentPreview.title}
                  className="w-full h-[65vh] rounded-2xl bg-white shadow-lg border border-charcoal-100"
                />
              )}

              {documentPreview.fileType === 'other' && (
                <div className="bg-white rounded-2xl shadow-lg border border-charcoal-100 p-8 text-center max-w-lg mx-auto">
                  <FileText className="w-12 h-12 text-sunny-500 mx-auto mb-4" />
                  <h4 className="font-heading font-800 text-xl text-charcoal-800 mb-2">
                    Preview not available
                  </h4>
                  <p className="font-body text-charcoal-500 text-sm leading-relaxed mb-5">
                    This file type may not preview inside the browser. Use the button below to open or download it.
                  </p>
                  <a
                    href={documentPreview.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-800 px-5 py-3 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document
                  </a>
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-charcoal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="font-body text-xs text-charcoal-400">
                This secure preview link expires after 5 minutes.
              </p>

              <div className="flex gap-3">
                <a
                  href={documentPreview.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-charcoal-700 hover:bg-charcoal-800 text-white font-heading font-700 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open New Tab
                </a>

                <button
                  type="button"
                  onClick={closeDocumentModal}
                  className="inline-flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-800 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
