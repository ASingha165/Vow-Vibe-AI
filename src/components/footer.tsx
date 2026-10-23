import Link from "next/link";
import { Sparkles, ShieldCheck, Heart, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5D5B5]/60 bg-[#FAF8F5] py-12 text-[#5E4B66] no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B1242] text-[#E5D5B5]">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#22092C]">Vow &amp; Vibe AI</span>
            </div>
            <p className="text-sm text-[#5E4B66] max-w-md leading-relaxed">
              An intelligent, culturally nuanced event-planning architect built for PromptWars Virtual — Challenge 5:
              Celebration &amp; Event Planner. Empowers hosts to balance high emotional vision with strict financial clarity.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#8C6D23] font-medium pt-1">
              <Award className="h-4 w-4" />
              <span>PromptWars Virtual Challenge 5 Candidate</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22092C] mb-3 font-serif">Core Capabilities</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plan" className="hover:text-[#3B1242] transition-colors">
                  Multi-Step Event Wizard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#3B1242] transition-colors">
                  Deterministic Budget Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#3B1242] transition-colors">
                  What-If Simulation Lab
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#3B1242] transition-colors">
                  Cultural Ceremony Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22092C] mb-3 font-serif">Architecture &amp; Safety</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Deterministic Financial Arithmetic</span>
              </li>
              <li>Local Persistence &amp; Zero Lock-in</li>
              <li>Offline &amp; Fallback Ready</li>
              <li>Server-Side Gemini Model Security</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E5D5B5]/40 pt-6 text-xs text-[#7A6B80]">
          <p>© 2026 Vow &amp; Vibe AI. Crafted with precision for celebrations.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Designed for weddings, birthdays, anniversaries &amp; festivals</span>
            <Heart className="h-3 w-3 text-[#D95B72] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
}
