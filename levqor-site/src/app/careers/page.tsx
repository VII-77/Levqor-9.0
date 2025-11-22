import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers at Levqor",
  description: "Join the Levqor team and help build the future of automation.",
};

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Careers at Levqor</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          We&apos;re building the next generation of automation infrastructure, and we&apos;d love to have you join us.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg my-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Currently Building</h2>
          <p className="text-gray-700">
            We&apos;re not actively hiring at the moment, but we&apos;re always interested in hearing from 
            talented engineers, designers, and operators who are passionate about reliability, automation, 
            and building tools that developers love.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Who We&apos;re Looking For</h2>
        <p>
          When we do open roles, we&apos;ll be seeking people who:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Care deeply about developer experience and product quality</li>
          <li>Have strong opinions, weakly held—open to learning and iteration</li>
          <li>Can work autonomously while collaborating effectively with remote teams</li>
          <li>Are excited about infrastructure, automation, and AI</li>
          <li>Value transparency, ownership, and shipping fast</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Get in Touch</h2>
        <p>
          Interested in working with us? We&apos;d love to hear from you. 
          Reach out through our <Link href="/contact" className="text-blue-600 hover:underline font-medium">contact page</Link> and 
          tell us a bit about yourself, what excites you about Levqor, and what you&apos;d like to build together.
        </p>
        
        <p>
          Check back soon for open positions, or follow us on{" "}
          <a href="https://twitter.com/levqor" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>{" "}
          and{" "}
          <a href="https://github.com/levqor" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          for updates.
        </p>
      </div>
    </main>
  );
}
