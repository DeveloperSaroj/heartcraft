import React from 'react'

const UPDATED = 'July 2026'

function LegalPage({ title, children }) {
  return (
    <div className="wizard">
      <header className="brand">
        <img src="logo-full.png" alt="SmileHeart" className="brand-logo" />
        <a className="mine-link" href="#">← Back to SmileHeart</a>
      </header>
      <div className="step-card legal-card">
        <h2 className="step-title">{title}</h2>
        <p className="legal-updated">Last updated: {UPDATED}</p>
        {children}
      </div>
    </div>
  )
}

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>SmileHeart ("we", "the app") is a free platform used by people around the world to create and share beautiful surprise experiences. We're currently in beta and evolving quickly — this page explains what happens to information you put into it.</p>

      <h3>What we store</h3>
      <p>When you create a wish, its contents — recipient name, occasion, chosen options, your letter, any photos or voice note you add — are saved securely so a shareable link can be generated, and are only accessible via the unique link you share.</p>

      <h3>What we don't collect</h3>
      <p>We do not ask for your name, email, phone number, or any account signup to create a wish. We do not sell or share your content with advertisers or other third parties.</p>

      <h3>Aggregate, anonymous analytics</h3>
      <p>To understand how the app is used — e.g. how many wishes are opened, which occasions are popular, and what browsers/devices visitors use — we log anonymous, aggregate technical information (browser name, operating system, device type, and referring site). This is not linked to your name or identity and cannot be used to identify you. We do not collect IP addresses or use tracking cookies.</p>

      <h3>Recipient reactions</h3>
      <p>If a recipient chooses to "send something back" after viewing a wish, that emoji/message is stored and shown to the wish's creator. This is an optional, visible feature — nothing is sent without the recipient actively choosing to send it.</p>

      <h3>Deleting your data</h3>
      <p>Since wishes are created without an account, we can't verify ownership to process automatic deletion requests. If you'd like a specific wish removed, contact us with its link and we'll remove it.</p>

      <h3>Changes</h3>
      <p>SmileHeart is in beta and actively evolving. This policy may be updated as features change; the "last updated" date above will reflect that.</p>

      <h3>Contact</h3>
      <p>Questions about this policy? Reach us on WhatsApp at <a href="https://wa.me/918018034448">+91 80180 34448</a> or by email at <a href="mailto:sarojbarik626@gmail.com">sarojbarik626@gmail.com</a>.</p>
    </LegalPage>
  )
}

export function TermsOfUse() {
  return (
    <LegalPage title="Terms of Use">
      <p>By using SmileHeart, you agree to the following.</p>

      <h3>Be kind</h3>
      <p>SmileHeart is meant to spread joy — birthdays, anniversaries, apologies, and proposals. Please don't use it to harass, threaten, impersonate, or send hateful or abusive content to anyone. We reserve the right to remove content that violates this.</p>

      <h3>Your content, your responsibility</h3>
      <p>You are responsible for what you write and upload (letters, photos, voice notes). Don't upload anything you don't have the right to share, or anything illegal, hateful, or harmful.</p>

      <h3>Free service</h3>
      <p>SmileHeart is free to use for everyone, everywhere. If that ever changes for specific features, it will be clearly communicated before you're asked to pay anything.</p>

      <h3>Changes to these terms</h3>
      <p>These terms may be updated as the app evolves.</p>

      <h3>Contact</h3>
      <p>Questions about these terms? Reach us on WhatsApp at <a href="https://wa.me/918018034448">+91 80180 34448</a> or by email at <a href="mailto:sarojbarik626@gmail.com">sarojbarik626@gmail.com</a>.</p>
    </LegalPage>
  )
}
