import Link from "next/link";
import { Mail, MapPin, Phone, Clock, Globe, Send } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

export const metadata = {
  title: "Contact Us | TaraCurong",
  description: "Get in touch with TaraCurong of Tacurong City.",
};

export default function ContactPage() {
  return (
    <div
      className="gw"
      style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}
    >
      <SiteHeader />

      {/* Header Section */}
      <section
        className="px-4 sm:px-8 lg:px-14 py-12 lg:py-[72px]"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--ink-7)" }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 760 }}>
          <div className="tx-eyebrow">Helpdesk & Support</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Get in Touch
          </h1>
          <p
            className="tx-body"
            style={{ marginTop: 12, color: "var(--ink-3)", marginLeft: "auto", marginRight: "auto", maxWidth: 560 }}
          >
            Have questions or need assistance? Our TaraCurong team is here to help you navigate your employment journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-8 lg:px-14 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="gw-card flex items-start space-x-4" style={{ padding: 24 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--r-2)",
                  background: "var(--teal-4)",
                  color: "var(--teal)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="tx-h4" style={{ marginBottom: 8 }}>Office Location</h3>
                <p className="tx-caption" style={{ color: "var(--ink-4)" }}>
                  TaraCurong<br />
                  A community project by John Aerol Tapales<br />
                  Tacurong City, Sultan Kudarat
                </p>
              </div>
            </div>

            <div className="gw-card flex items-start space-x-4" style={{ padding: 24 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--r-2)",
                  background: "var(--emerald-bg)",
                  color: "var(--emerald)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="tx-h4" style={{ marginBottom: 8 }}>Service Hours</h3>
                <p className="tx-caption" style={{ color: "var(--ink-4)" }}>
                  Monday–Friday<br />
                  8:00 AM–5:00 PM<br />
                  <span style={{ fontStyle: "italic", color: "var(--ink-4)", fontWeight: 500 }}>(Excluding public holidays)</span>
                </p>
              </div>
            </div>

            <div className="gw-card flex items-start space-x-4" style={{ padding: 24 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--r-2)",
                  background: "var(--violet-bg)",
                  color: "var(--violet)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="tx-h4" style={{ marginBottom: 12 }}>Connect With Us</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:helpdesk@taracurong.com"
                    className="tx-caption flex items-center"
                    style={{ color: "var(--ink-3)", fontWeight: 500, textDecoration: "none" }}
                  >
                    <Mail className="w-4 h-4 mr-3 shrink-0" style={{ color: "var(--ink-5)" }} />
                    helpdesk@taracurong.com
                  </a>
                  <a
                    href="tel:+63644771234"
                    className="tx-caption flex items-center"
                    style={{ color: "var(--ink-3)", fontWeight: 500, textDecoration: "none" }}
                  >
                    <Phone className="w-4 h-4 mr-3 shrink-0" style={{ color: "var(--ink-5)" }} />
                    (064) 477-1234
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Access Box from original page */}
            <div className="gw-card" style={{ padding: 24, background: "var(--ink)", borderColor: "var(--ink-2)" }}>
              <h2 className="tx-h4" style={{ color: "#fff" }}>Need quick access?</h2>
              <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-5)" }}>Use the role-specific sign-up or login pages below.</p>
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <Link href="/login" className="gw-btn gw-btn--accent gw-btn--block" style={{ textAlign: "center" }}>
                  Login to Account
                </Link>
                <Link
                  href="/signup?role=employer"
                  className="gw-btn gw-btn--block"
                  style={{ textAlign: "center", border: "1px solid var(--ink-3)", color: "#fff", background: "transparent" }}
                >
                  Employer Sign Up
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form & Messaging */}
          <div className="lg:col-span-2 gw-card" style={{ padding: 32 }}>
            <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--ink-7)" }}>
              <h2 className="tx-h2">Send us a Message</h2>
              <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
                Fill out the form below and our helpdesk team will get back to you as soon as possible.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first-name" className="gw-label">First name</label>
                  <div style={{ marginTop: 8 }}>
                    <input type="text" name="first-name" id="first-name" className="gw-input" placeholder="Juan" />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="gw-label">Last name</label>
                  <div style={{ marginTop: 8 }}>
                    <input type="text" name="last-name" id="last-name" className="gw-input" placeholder="Dela Cruz" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="gw-label">Email address</label>
                <div style={{ marginTop: 8 }}>
                  <input type="email" name="email" id="email" className="gw-input" placeholder="juan@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="gw-label">Subject</label>
                <div style={{ marginTop: 8 }}>
                  <select id="subject" name="subject" className="gw-input">
                    <option>General Inquiry</option>
                    <option>Job Seeker Assistance</option>
                    <option>Employer Onboarding</option>
                    <option>Technical Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="gw-label">Message</label>
                <div style={{ marginTop: 8 }}>
                  <textarea id="message" name="message" rows={5} className="gw-input" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }} placeholder="How can we help you?"></textarea>
                </div>
              </div>

              <div style={{ paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="gw-btn gw-btn--accent gw-btn--lg w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
