import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">EduDash</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative isolate pt-14">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Supercharge your learning with AI
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Generate comprehensive study notes from YouTube videos instantly.
                Join our platform to access advanced study tools and manage your learning journey.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center gap-2"
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold leading-6 text-gray-900 group flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  Already have an account? <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="mt-20 flex justify-center gap-8 sm:gap-16">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Instant AI Notes</h3>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Secure Access</h3>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Admin Approved</h3>
              </div>
            </div>

          </div>

          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
