'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Building2, Mail, RefreshCw } from 'lucide-react';
import { checkEmployeeApproval, getEmployeeRequestStatus } from '@/lib/companyRegistry';
import { updateCurrentUser } from '@/lib/auth';

export default function WaitingApprovalPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [switchingMode, setSwitchingMode] = useState<null | 'individual' | 'creator'>(null);

  useEffect(() => {
    // Get user data from localStorage
    const data = localStorage.getItem('userData');
    if (data) {
      const parsed = JSON.parse(data);
      setUserData(parsed);

      const status = getEmployeeRequestStatus(parsed.email);
      setRequestStatus(status);

      // If user has no pending employee request, redirect out
      const hasPendingRequest =
        (parsed.userType === 'employee' && parsed.companyApproved === false) ||
        status?.pending ||
        parsed?.pendingEmployeeRequest?.status === 'pending';

      if (!hasPendingRequest) {
        router.push('/dashboard');
      }

      // If already approved, redirect to dashboard
      if (parsed.companyApproved) {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleCheckStatus = async () => {
    if (!userData) return;

    setChecking(true);
    
    // Check approval status
    const approval = checkEmployeeApproval(userData.email);
    
    if (approval.approved) {
      // Update userData with approval
      const updatedUserData = {
        ...userData,
        userType: 'employee',
        companyApproved: true,
        companyName: approval.companyName,
        employeePermissions: approval.permissions || [],
        pendingEmployeeRequest: {
          ...(userData.pendingEmployeeRequest || {}),
          status: 'approved',
        },
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      updateCurrentUser(updatedUserData);

      setRequestStatus(getEmployeeRequestStatus(userData.email));
      
      // Show success and redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setChecking(false);
    }
  };

  const handleSwitchWhileWaiting = (nextType: 'individual' | 'creator') => {
    if (!userData || switchingMode) return;

    setSwitchingMode(nextType);

    const updated = {
      ...userData,
      userType: nextType,
      companyApproved: false,
      onboardingComplete: userData.onboardingComplete || false,
      pendingEmployeeRequest: {
        companyName: requestStatus?.companyName || userData.companyName,
        employerCode: requestStatus?.employerCode || userData.employerCode,
        status: 'pending',
        requestedAt: requestStatus?.requestedAt || userData.pendingEmployeeRequest?.requestedAt,
        verificationCode: requestStatus?.verificationCode || userData.pendingEmployeeRequest?.verificationCode,
      },
    };

    localStorage.setItem('userData', JSON.stringify(updated));
    updateCurrentUser(updated);
    setUserData(updated);

    setSwitchingMode(null);
    router.push('/dashboard');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">
            Awaiting Approval
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Your access request is pending approval from your company administrator
          </p>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Your Email</p>
                <p className="text-sm font-medium text-gray-900">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Employer Code</p>
                <p className="text-sm font-medium text-gray-900">
                  {userData.employerCode || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Verification Code</p>
                <p className="text-sm font-medium text-gray-900">
                  {requestStatus?.verificationCode || userData?.pendingEmployeeRequest?.verificationCode || 'Pending generation'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Share this code with your company admin so they can verify and approve your request.</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  What happens next?
                </h3>
                <p className="text-sm text-blue-700">
                  Your company administrator will review your request, verify your authentication code, and then assign permissions. You'll receive access once approved.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Features Available */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 mb-1">
                  Access Personal Features Now!
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  While waiting for approval, you can access your personal productivity tools including Wellness, Performance, Content Studio, and Scheduler.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Need immediate access?</h3>
            <p className="text-sm text-purple-700 mb-3">
              If approval is taking too long, continue now as an Individual or Content Creator. Your employee request stays saved so you can check status later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSwitchWhileWaiting('individual')}
                disabled={switchingMode !== null}
                className="w-full bg-white text-purple-700 border border-purple-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all disabled:opacity-60"
              >
                {switchingMode === 'individual' ? 'Switching...' : 'Use Individual Account'}
              </button>
              <button
                onClick={() => handleSwitchWhileWaiting('creator')}
                disabled={switchingMode !== null}
                className="w-full bg-white text-purple-700 border border-purple-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all disabled:opacity-60"
              >
                {switchingMode === 'creator' ? 'Switching...' : 'Use Creator Account'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-6 py-3 font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Check Status
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-100 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-200 transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Need help? Contact your company administrator<br />
            or email{' '}
            <a href="mailto:support@yourdomain.com" className="text-purple-600 hover:underline">
              support@yourdomain.com
            </a>
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This may take a few hours to a few days depending on your company's approval process
          </p>
        </div>
      </div>
    </div>
  );
}
