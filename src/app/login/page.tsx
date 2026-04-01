import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a84c] mb-4">
            <span className="text-[#003366] font-bold text-2xl">A</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Alliance 4DX Tracker</h1>
          <p className="text-blue-200 text-sm mt-1">Alliance College-Ready Public Schools</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-slate-900 text-xl font-semibold text-center mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Use your <strong>@laalliance.org</strong> Google account
          </p>

          <GoogleSignInButton />

          <p className="text-xs text-slate-400 text-center mt-6">
            Access is restricted to Alliance College-Ready Public Schools staff.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleSignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        try {
          await signIn("google", { redirectTo: "/dashboard" });
        } catch (error) {
          if (error instanceof AuthError) throw error;
          throw error;
        }
      }}
    >
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
      >
        {/* Google G logo */}
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    </form>
  );
}
