import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Building2, LogOut, ShieldAlert, ShieldCheck, ShieldEllipsis, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/company/profile');
        setCompany(data);
      } catch (error) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const { data } = await api.post('/company/verify');
      setCompany(prev => ({
        ...prev,
        verificationStatus: data.status,
        verificationResult: data.details,
        verificationDate: new Date().toISOString()
      }));
      toast.success(data.message || 'Verification successful');
    } catch (error) {
      if (error.response?.data) {
        setCompany(prev => ({
          ...prev,
          verificationStatus: error.response.data.status || prev.verificationStatus,
          verificationResult: error.response.data.details || prev.verificationResult,
        }));
        toast.error(error.response.data.message || 'Verification failed');
      } else {
        toast.error('Verification service unavailable');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) return null;

  const getStatusBadge = () => {
    switch (company.verificationStatus) {
      case 'Verified':
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            <ShieldCheck className="h-4 w-4" />
            Verified
          </div>
        );
      case 'Rejected':
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            <ShieldAlert className="h-4 w-4" />
            Rejected
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            <ShieldEllipsis className="h-4 w-4" />
            Pending Verification
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Building2 className="h-6 w-6" />
            <span>VerifyCo</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your company profile and verification status.</p>
          </div>
          
          {company.verificationStatus !== 'Verified' && (
            <Button 
              size="lg" 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-primary hover:bg-primary/90"
            >
              {isVerifying ? 'Verifying...' : 'Verify Company Now'}
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Status Card */}
          <Card className="col-span-full lg:col-span-1 border-t-4 border-t-primary border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Current standing with authorities</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              {getStatusBadge()}
              
              {company.verificationDate && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Last updated: {new Date(company.verificationDate).toLocaleDateString()}
                </p>
              )}
              
              {company.verificationResult && (
                <div className="mt-6 w-full rounded-md bg-slate-50 p-4 text-sm border">
                  <h4 className="font-semibold mb-2">API Response Details</h4>
                  <pre className="whitespace-pre-wrap text-xs overflow-x-auto text-slate-700">
                    {JSON.stringify(company.verificationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="col-span-full lg:col-span-2 border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Registered information for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2 flex items-center gap-3 pb-4 border-b">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Company Name</dt>
                    <dd className="mt-1 text-lg font-semibold text-foreground">{company.name}</dd>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Registration Number
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{company.registrationNumber}</dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> PAN
                  </dt>
                  <dd className="text-sm font-medium text-foreground uppercase">{company.pan}</dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{company.email}</dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{company.phoneNumber}</dd>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Registered Address
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{company.address}</dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Registration Date
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {new Date(company.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
