import React from "react";

export default function PrivacyPolicy({ onBack }) {
  return (
    <div
      style={{
        backgroundColor: "#F3EEE3",
        minHeight: "100vh",
        padding: "50px 20px",
        color: "#161412",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#fff",
          border: "2px solid #161412",
          padding: "60px 70px",
          boxShadow: "10px 10px 0px #161412",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "42px",
            lineHeight: "1.15",
            marginBottom: "10px",
            borderBottom: "2px solid #C9A227",
            paddingBottom: "18px",
          }}
        >
          Privacy Policy
        </h1>

        <p
          style={{
            color: "#5E574C",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          Last Updated: September 11, 2026
        </p>

        <p
          style={{
            lineHeight: "1.8",
            color: "#333",
            fontSize: "16px",
            marginBottom: "25px",
          }}
        >
          Welcome to CyberBriefs, a news discovery and aggregation platform. This Privacy Policy explains how we collect, use, store, protect, and disclose information when you access or use our website, applications, newsletter, news discovery features, and related services.
        </p>

        <p
          style={{
            lineHeight: "1.8",
            color: "#333",
            fontSize: "16px",
            marginBottom: "30px",
          }}
        >
          CyberBriefs is designed to make it easier for users to discover current news and information from multiple publishers in one place. Our platform may use RSS feeds, publisher-provided feeds, publicly available information, automated processing, and artificial intelligence technologies to organize and summarize news content.
        </p>

        <p
          style={{
            lineHeight: "1.8",
            color: "#333",
            fontSize: "16px",
            marginBottom: "35px",
          }}
        >
          By using CyberBriefs, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with this policy, please discontinue use of the website.
        </p>

        <h3 style={headingStyle}>1. Information We Collect</h3>

        <p style={paragraphStyle}>
          We collect information that is necessary to operate, maintain, and improve CyberBriefs. The information we collect depends on how you interact with our platform.
        </p>

        <p style={paragraphStyle}>This information may include:</p>

        <ul style={listStyle}>
          <li>Email address when you subscribe to our newsletter.</li>
          <li>
            Information voluntarily submitted through contact forms or other communication channels.
          </li>
          <li>
            Browser, device, operating system, language, and general technical information.
          </li>
          <li>
            Website interaction information, including pages viewed and features used.
          </li>
          <li>
            Approximate geographic information derived from technical data, where available and permitted.
          </li>
          <li>
            Cookies, local storage, and similar technologies used to operate and improve the website.
          </li>
        </ul>

        <h3 style={headingStyle}>2. Information You Provide</h3>

        <p style={paragraphStyle}>
          You may voluntarily provide personal information when using certain features of CyberBriefs. For example, if you subscribe to our newsletter, we may collect your email address so that we can deliver the requested communications.
        </p>

        <p style={paragraphStyle}>
          If you contact us with a question, feedback, correction request, technical issue, or other inquiry, we may retain the information necessary to respond to and manage your request.
        </p>

        <h3 style={headingStyle}>3. RSS Feeds and News Sources</h3>

        <p style={paragraphStyle}>
          CyberBriefs obtains information from RSS feeds and other publisher-provided or publicly available sources. These feeds may contain headlines, article descriptions, publication dates, source names, categories, images, and links to original articles.
        </p>

        <p style={paragraphStyle}>
          RSS feed information is processed to help users discover news from different publishers. Where appropriate, we identify the original publisher and provide a link that allows users to access the publisher's website and read the complete article.
        </p>

        <p style={paragraphStyle}>
          CyberBriefs does not represent itself as the original publisher of third-party news articles unless explicitly stated. Copyright, trademarks, and other intellectual property rights in original publisher content remain with their respective owners.
        </p>

        <h3 style={headingStyle}>4. AI-Generated Content and Summaries</h3>

        <p style={paragraphStyle}>
          CyberBriefs may use artificial intelligence and automated processing technologies to analyze news information obtained from available sources.
        </p>

        <p style={paragraphStyle}>
          These technologies may be used to generate summaries, categorize articles, identify topics, extract keywords, organize headlines, identify related stories, or improve content discovery.
        </p>

        <p style={paragraphStyle}>
          AI-generated summaries are intended to provide users with a quick overview and may not always accurately represent every detail of an original article. AI-generated information should not be treated as a replacement for the original reporting.
        </p>

        <p style={paragraphStyle}>
          For important, sensitive, financial, legal, medical, or otherwise consequential information, users should consult the original publisher and appropriate authoritative sources.
        </p>

        <h3 style={headingStyle}>5. How We Use Information</h3>

        <p style={paragraphStyle}>
          Information collected through CyberBriefs may be used for the following purposes:
        </p>

        <ul style={listStyle}>
          <li>Providing and maintaining the website and its services.</li>
          <li>Delivering newsletters and requested communications.</li>
          <li>Organizing and displaying news information.</li>
          <li>Improving search, discovery, and recommendation features.</li>
          <li>Improving website performance and usability.</li>
          <li>Understanding general website usage patterns.</li>
          <li>Detecting technical problems and security threats.</li>
          <li>Preventing misuse, abuse, fraud, or unauthorized access.</li>
          <li>Developing and improving automated content-processing systems.</li>
          <li>Complying with applicable laws and legal obligations.</li>
        </ul>

        <h3 style={headingStyle}>6. Newsletter and Email Communications</h3>

        <p style={paragraphStyle}>
          If you subscribe to CyberBriefs newsletter, your email address may be used to send news briefings, headlines, summaries, product updates, or other communications related to CyberBriefs.
        </p>

        <p style={paragraphStyle}>
          We do not sell or rent newsletter subscriber email addresses to third parties.
        </p>

        <p style={paragraphStyle}>
          Every marketing or newsletter communication should provide an appropriate mechanism for unsubscribing. After unsubscribing, we may retain limited information where necessary to honor your unsubscribe request or comply with legal requirements.
        </p>

        <h3 style={headingStyle}>7. Cookies and Similar Technologies</h3>

        <p style={paragraphStyle}>
          CyberBriefs may use cookies, browser storage, pixels, and similar technologies to support website functionality and understand how visitors interact with our services.
        </p>

        <p style={paragraphStyle}>
          These technologies may be used to remember preferences, maintain sessions, improve performance, understand traffic patterns, and measure the effectiveness of features.
        </p>

        <p style={paragraphStyle}>
          You can generally control or disable cookies through your browser settings. Some functionality may not work correctly if certain technologies are disabled.
        </p>

        <h3 style={headingStyle}>8. Analytics and Usage Information</h3>

        <p style={paragraphStyle}>
          We may collect aggregated or technical usage information to understand how visitors use CyberBriefs. This can help us identify popular features, improve page performance, understand navigation patterns, and identify technical problems.
        </p>

        <p style={paragraphStyle}>
          Analytics information may include information such as device type, browser type, operating system, referring pages, approximate location, pages viewed, session information, and interaction events.
        </p>

        <h3 style={headingStyle}>9. Third-Party Services</h3>

        <p style={paragraphStyle}>
          We may use third-party service providers to help operate portions of our platform. These services may include hosting, email delivery, analytics, security, database infrastructure, authentication, and other technical services.
        </p>

        <p style={paragraphStyle}>
          These providers may process information on our behalf where necessary to provide their services. We seek to work with providers that maintain appropriate security and privacy practices.
        </p>

        <h3 style={headingStyle}>10. External Links and Publishers</h3>

        <p style={paragraphStyle}>
          CyberBriefs contains links to external websites, news publishers, organizations, and other third-party services.
        </p>

        <p style={paragraphStyle}>
          When you click an external link, you may leave CyberBriefs and interact directly with the third-party website. We do not control the privacy practices, security, content, or policies of external websites.
        </p>

        <p style={paragraphStyle}>
          We encourage users to review the privacy policies and terms of external websites before providing personal information to those services.
        </p>

        <h3 style={headingStyle}>11. Information Sharing</h3>

        <p style={paragraphStyle}>
          We do not sell or rent your personal information.
        </p>

        <p style={paragraphStyle}>
          We may share limited information with service providers that help us operate CyberBriefs. We may also disclose information when reasonably necessary to comply with legal obligations, respond to lawful requests, protect our systems, enforce our agreements, or protect the rights, safety, and security of users or others.
        </p>

        <h3 style={headingStyle}>12. Data Security</h3>

        <p style={paragraphStyle}>
          We use reasonable technical, administrative, and organizational safeguards designed to protect information against unauthorized access, alteration, disclosure, misuse, or destruction.
        </p>

        <p style={paragraphStyle}>
          Administrative systems may use additional security controls, including authentication controls and multi-factor authentication where implemented.
        </p>

        <p style={paragraphStyle}>
          Despite these measures, no website, application, database, or internet transmission can be guaranteed to be completely secure.
        </p>

        <h3 style={headingStyle}>13. Data Retention</h3>

        <p style={paragraphStyle}>
          We retain information only for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining business records, resolving disputes, preventing abuse, enforcing agreements, and satisfying legal obligations.
        </p>

        <p style={paragraphStyle}>
          Retention periods may vary depending on the type of information and the purpose for which it was collected.
        </p>

        <h3 style={headingStyle}>14. Your Privacy Choices</h3>

        <p style={paragraphStyle}>
          Depending on your location and applicable law, you may have rights relating to your personal information.
        </p>

        <p style={paragraphStyle}>These may include the ability to:</p>

        <ul style={listStyle}>
          <li>Request access to certain personal information.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request deletion of certain information.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Unsubscribe from newsletters and marketing communications.</li>
        </ul>

        <p style={paragraphStyle}>
          Requests may be subject to applicable legal requirements and verification procedures.
        </p>

        <h3 style={headingStyle}>15. Children's Privacy</h3>

        <p style={paragraphStyle}>
          CyberBriefs is not intended to knowingly collect personal information from children where such collection is prohibited by applicable law.
        </p>

        <p style={paragraphStyle}>
          If you believe that a child has provided personal information to us without appropriate authorization, please contact us so that we can review the situation and take appropriate action.
        </p>

        <h3 style={headingStyle}>16. International Users</h3>

        <p style={paragraphStyle}>
          Depending on where you access CyberBriefs from, your information may be processed or stored in countries other than the country in which you reside.
        </p>

        <p style={paragraphStyle}>
          Where required, we will take appropriate measures for international transfers of personal information in accordance with applicable privacy laws.
        </p>

        <h3 style={headingStyle}>17. News Content Accuracy</h3>

        <p style={paragraphStyle}>
          CyberBriefs is a news discovery and aggregation service. We do not guarantee that every headline, description, publication date, summary, categorization, or other piece of information displayed on the platform is complete, current, or error-free.
        </p>

        <p style={paragraphStyle}>
          News content can change rapidly. Users should verify important information by visiting the original publisher or another authoritative source.
        </p>

        <h3 style={headingStyle}>18. Content Removal and Corrections</h3>

        <p style={paragraphStyle}>
          If you are a publisher, rights holder, or other authorized party and believe that information displayed by CyberBriefs should be corrected, removed, or otherwise reviewed, you may contact us with the relevant details.
        </p>

        <p style={paragraphStyle}>
          Requests should identify the affected content and provide sufficient information for us to understand and evaluate the request.
        </p>

        <h3 style={headingStyle}>19. Changes to This Privacy Policy</h3>

        <p style={paragraphStyle}>
          We may update this Privacy Policy periodically to reflect changes in our services, technology, business practices, or applicable legal requirements.
        </p>

        <p style={paragraphStyle}>
          When changes are made, the updated policy will be published on this page and the "Last Updated" date will be revised accordingly.
        </p>

        <h3 style={headingStyle}>20. Contact Us</h3>

        <p style={paragraphStyle}>
          If you have questions about this Privacy Policy, our data practices, newsletter communications, RSS aggregation, content displayed on CyberBriefs, or a privacy-related request, please contact us using the contact information provided on the website.
        </p>

        <div
          style={{
            marginTop: "50px",
            paddingTop: "25px",
            borderTop: "1px solid #D8D1C4",
            color: "#5E574C",
            fontSize: "13px",
            lineHeight: "1.7",
          }}
        >
          <strong>CyberBriefs</strong>
          <br />
          News discovery powered by RSS feeds and automated content processing.
        </div>
      </div>
    </div>
  );
}

const headingStyle = {
  fontFamily: "Georgia, serif",
  fontSize: "22px",
  lineHeight: "1.3",
  marginTop: "38px",
  marginBottom: "15px",
  color: "#161412",
};

const paragraphStyle = {
  lineHeight: "1.8",
  marginBottom: "20px",
  color: "#333",
  fontSize: "15px",
};

const listStyle = {
  lineHeight: "1.9",
  color: "#333",
  marginBottom: "25px",
  paddingLeft: "25px",
};