import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Mira Browser, an open source desktop browser.",
  alternates: {
    canonical: `${getSiteUrl()}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="section page-enter">
      <div className="container narrow">
        <h1 className="animate-fade-up" style={{ animationDelay: "80ms" }}>Terms of Use</h1>

        <div className="privacy-card-stack">
          <article className="notice animate-fade-up" style={{ animationDelay: "220ms" }}>
            <p>
              By using Mira Browser, you agree to these terms of use. Mira is provided as-is under the MIT License.
            </p>
          </article>

          <article className="feature-card animate-fade-up" style={{ animationDelay: "300ms" }}>
            <div className="privacy-columns">
              <section className="privacy-column">
                <h2>Software License</h2>
                <p>
                  Mira Browser is licensed under the MIT License. You are free to use, modify, distribute, and sublicense this software under the terms of this license.
                </p>
              </section>
              <section className="privacy-column">
                <h2>Use at Your Own Risk</h2>
                <p>
                  Mira is provided "as-is", without warranty of any kind. The authors are not liable for any damages arising from its use.
                </p>
              </section>
            </div>
          </article>

          <article className="feature-card animate-fade-up" style={{ animationDelay: "460ms" }}>
            <h2>Third-Party Content</h2>
            <p>
              Mira displays web content from third parties. You are responsible for your interactions with external websites and their respective terms of service and privacy policies.
            </p>
          </article>

          <article className="feature-card animate-fade-up" style={{ animationDelay: "540ms" }}>
            <h2>Modifications</h2>
            <p>
              We may update these terms occasionally. Continued use of Mira constitutes acceptance of any changes. The latest version will always be available at this URL.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
