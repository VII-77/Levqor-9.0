import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the team behind Levqor. Engineers, designers, and automation experts building the future of workflow automation.",
};

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're a team of engineers, designers, and automation experts passionate about
            building reliable systems that just work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              LX
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Engineering Team</h3>
            <p className="text-sm text-gray-600 mb-3">Building reliable automation infrastructure</p>
            <p className="text-gray-700 text-sm">
              Our engineers have experience from companies like Stripe, AWS, and Datadog,
              bringing world-class reliability patterns to workflow automation.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              PD
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Product & Design</h3>
            <p className="text-sm text-gray-600 mb-3">Crafting intuitive automation experiences</p>
            <p className="text-gray-700 text-sm">
              We obsess over making complex workflows simple. Our design philosophy:
              powerful capabilities, zero learning curve.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              CS
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Customer Success</h3>
            <p className="text-sm text-gray-600 mb-3">Supporting teams at every stage</p>
            <p className="text-gray-700 text-sm">
              Our CS team ensures you get value from day one. From onboarding to scaling,
              we're here to help you succeed.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🎯 Reliability First</h3>
              <p className="text-gray-700">
                We build systems that work 99.9% of the time because your business depends on it.
                Every feature is designed with failure modes in mind.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ Move Fast, Ship Quality</h3>
              <p className="text-gray-700">
                Speed matters, but not at the cost of quality. We iterate quickly while maintaining
                high standards for security and performance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🤝 Customer-Driven</h3>
              <p className="text-gray-700">
                Our roadmap is shaped by customer feedback. We listen, adapt, and build what
                you actually need—not what we think you need.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🌍 Remote-First</h3>
              <p className="text-gray-700">
                We're a distributed team across multiple time zones. Flexibility and async
                communication are core to how we work.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl mb-8 opacity-90">
            We're always looking for talented engineers, designers, and operators who
            want to build the future of automation.
          </p>
          <Link href="/careers" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition">
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
}
