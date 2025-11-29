import Link from "next/link";

interface SupportPageProps {
  params: Promise<{ locale: string }>;
}

const FAQ = [
  {
    q: "How do I reset my password?",
    a: "Click 'Forgot password' on the sign-in page, or sign in with Google/Microsoft which doesn't require a password."
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from the Billing page. Your access continues until the end of your billing period."
  },
  {
    q: "How do I export my data?",
    a: "Go to Settings > Privacy > Export Data. You'll receive a download link within 24 hours."
  },
  {
    q: "What happens when my trial ends?",
    a: "Your workflows will pause but your data stays safe. Subscribe to resume everything instantly."
  },
  {
    q: "Can I get a demo or setup help?",
    a: "Yes! Book a call with our team and we'll walk you through everything."
  }
];

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Levqor
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Support Center</h2>
          <p className="text-gray-600 mt-2">Find answers or get in touch</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h4 className="font-medium text-gray-900 mb-2">{item.q}</h4>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Need more help?</h3>
          <p className="text-blue-100 mb-6">Book a free setup call with our team</p>
          
          <a
            href="https://calendly.com/levqor/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Book a setup call
          </a>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Or email us directly</p>
          <a 
            href="mailto:support@levqor.ai" 
            className="text-blue-600 hover:underline font-medium"
          >
            support@levqor.ai
          </a>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href={`/${locale}/dashboard`}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &larr; Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
