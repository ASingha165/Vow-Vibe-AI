import Link from "next/link";
import { Sparkles, ShieldCheck, Heart, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary-container/10 bg-surface-container py-12 text-on-surface-variant no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-primary font-headline-sm text-xl font-bold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-secondary-container">
                <Sparkles className="h-4 w-4 text-secondary-container" />
              </div>
              <span className="text-primary-container">Vow &amp; Vibe AI</span>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant max-w-md leading-relaxed">
              Harmonizing creative passion and computational rigor for extraordinary celebrations. Built for PromptWars Virtual — Challenge 5: Celebration &amp; Event Planner.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary font-semibold pt-1">
              <Award className="h-4 w-4" />
              <span>PromptWars Virtual Challenge 5 Candidate • Editorial Edition</span>
            </div>
          </div>

          <div>
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-3">Solutions</h4>
            <ul className="space-y-2 font-body-sm text-sm">
              <li>
                <Link href="/plan" className="hover:text-primary transition-colors">
                  Weddings &amp; Galas Wizard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Deterministic Budget Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  What-If Simulation Playground
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Verified Vendor Intelligence
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary mb-3">Architecture &amp; Safety</h4>
            <ul className="space-y-2 font-body-sm text-sm">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>Deterministic Financial Math</span>
              </li>
              <li>Local Persistence &amp; Zero Lock-in</li>
              <li>Offline &amp; Fallback Ready</li>
              <li>Server-Side Gemini AI Security</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-primary-container/10 pt-6 text-xs text-on-surface-variant/80">
          <p>© 2026 Vow &amp; Vibe Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-label-sm">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-semibold">
              Editorial Edition
            </span>
            <span className="flex items-center gap-1">
              <span>Made with devotion</span>
              <Heart className="h-3 w-3 text-secondary fill-current" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
