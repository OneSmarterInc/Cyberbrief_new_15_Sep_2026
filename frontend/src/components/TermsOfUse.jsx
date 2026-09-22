import React from "react";

export default function TermsOfUse({ onBack }) {
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
          Terms of Use
        </h1>

        <p
          style={{
            color: "#5E574C",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          Effective Date: September 11, 2026
        </p>

        <p style={paragraphStyle}>
          Welcome to CyberBriefs, a news discovery and aggregation platform. These Terms of Use govern your access to and use of the CyberBriefs website, services, features, newsletters, content, and related functionality.
        </p>

        <p style={paragraphStyle}>
          By accessing or using CyberBriefs, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree with these terms, you should not access or use the service.
        </p>

        <h3 style={headingStyle}>1. Acceptance of Terms</h3>
        <p style={paragraphStyle}>
          By accessing, browsing, or using CyberBriefs, you agree to comply with these Terms of Use and all applicable laws and regulations.
        </p>
        <p style={paragraphStyle}>
          These Terms apply to all visitors, readers, subscribers, and other users of the platform.
        </p>

        <h3 style={headingStyle}>2. Description of the Service</h3>
        <p style={paragraphStyle}>
          CyberBriefs is a news discovery platform that organizes information from multiple news sources and publishers into a centralized interface.
        </p>
        <p style={paragraphStyle}>
          Our service may use RSS feeds, publisher-provided feeds, publicly available information, automated technologies, and artificial intelligence to collect, organize, classify, summarize, and present information for news discovery purposes.
        </p>
        <p style={paragraphStyle}>
          CyberBriefs is intended to help users discover news efficiently. It is not intended to replace the original reporting or publications provided by news organizations.
        </p>

        <h3 style={headingStyle}>3. RSS Feeds and Third-Party Content</h3>
        <p style={paragraphStyle}>
          CyberBriefs may obtain headlines, descriptions, publication dates, source names, images, categories, and links through RSS feeds and other publisher-provided sources.
        </p>
        <p style={paragraphStyle}>
          Third-party content remains subject to the rights, terms, and policies of its respective publisher or rights holder.
        </p>
        <p style={paragraphStyle}>
          Where available, CyberBriefs provides links to the original source so that users can access the complete article and additional context directly from the publisher.
        </p>

        <h3 style={headingStyle}>4. AI-Generated Summaries</h3>
        <p style={paragraphStyle}>
          CyberBriefs may use artificial intelligence and automated processing systems to generate summaries, classifications, keywords, topics, recommendations, or other representations of news information.
        </p>
        <p style={paragraphStyle}>
          AI-generated content may contain errors, omissions, outdated information, incorrect interpretations, or other inaccuracies.
        </p>
        <p style={paragraphStyle}>
          AI-generated summaries are provided for informational and discovery purposes only. Users should consult the original article and publisher for complete context, details, quotations, and authoritative reporting.
        </p>

        <h3 style={headingStyle}>5. News Accuracy and Timeliness</h3>
        <p style={paragraphStyle}>
          News information can change rapidly. Headlines, article descriptions, publication information, and summaries displayed on CyberBriefs may become outdated or may contain inaccuracies.
        </p>
        <p style={paragraphStyle}>
          Although we make reasonable efforts to provide useful and current information, CyberBriefs does not guarantee that information presented through the service is accurate, complete, current, reliable, or error-free.
        </p>
        <p style={paragraphStyle}>
          For important matters, users should independently verify information through the original publisher or another authoritative source.
        </p>

        <h3 style={headingStyle}>6. Intellectual Property</h3>
        <p style={paragraphStyle}>
          Third-party articles, photographs, logos, trademarks, headlines, publications, and other publisher materials remain the property of their respective owners and rights holders.
        </p>
        <p style={paragraphStyle}>
          CyberBriefs does not claim ownership of third-party publisher content merely because that content is referenced, indexed, linked, or displayed through the service.
        </p>
        <p style={paragraphStyle}>
          The original CyberBriefs interface, software, design, branding, proprietary systems, databases, workflows, and other original materials may be protected by applicable intellectual property laws.
        </p>

        <h3 style={headingStyle}>7. Permitted Use</h3>
        <p style={paragraphStyle}>
          You may use CyberBriefs for lawful personal, informational, and news discovery purposes in accordance with these Terms.
        </p>
        <p style={paragraphStyle}>
          You agree not to misuse the service or interfere with its normal operation.
        </p>

        <h3 style={headingStyle}>8. Prohibited Activities</h3>
        <p style={paragraphStyle}>
          You may not use CyberBriefs to:
        </p>
        <ul style={listStyle}>
          <li>Violate any applicable law, regulation, or third-party right.</li>
          <li>Attempt to gain unauthorized access to systems, accounts, or administrative interfaces.</li>
          <li>Interfere with the security, availability, or functionality of the service.</li>
          <li>Introduce malware, malicious code, or other harmful technologies.</li>
          <li>Conduct automated activity that places unreasonable load on the service.</li>
          <li>Scrape, harvest, copy, or systematically reproduce platform content in violation of applicable law or these Terms.</li>
          <li>Attempt to bypass technical restrictions or security mechanisms.</li>
          <li>Impersonate CyberBriefs, a publisher, or another individual or organization.</li>
          <li>Use the service for fraudulent, deceptive, or abusive purposes.</li>
        </ul>

        <h3 style={headingStyle}>9. External Links</h3>
        <p style={paragraphStyle}>
          CyberBriefs may provide links to websites operated by third parties, including news organizations, publishers, technology providers, and other external services.
        </p>
        <p style={paragraphStyle}>
          External websites are independent from CyberBriefs. We do not control and are not responsible for the content, availability, security, privacy practices, or terms of third-party websites.
        </p>
        <p style={paragraphStyle}>
          Your interaction with an external website is governed by that website's own terms and policies.
        </p>

        <h3 style={headingStyle}>10. Newsletter and Communications</h3>
        <p style={paragraphStyle}>
          Users may have the opportunity to subscribe to newsletters or other communications from CyberBriefs.
        </p>
        <p style={paragraphStyle}>
          By subscribing, you agree to receive the communications associated with the subscription you selected.
        </p>
        <p style={paragraphStyle}>
          You may unsubscribe from newsletter or marketing communications at any time using the unsubscribe mechanism included in the applicable communication.
        </p>

        <h3 style={headingStyle}>11. Service Availability</h3>
        <p style={paragraphStyle}>
          We aim to keep CyberBriefs available and functional, but we do not guarantee uninterrupted or error-free operation.
        </p>
        <p style={paragraphStyle}>
          The service may occasionally be unavailable because of maintenance, technical issues, infrastructure failures, updates, third-party dependencies, network problems, or circumstances beyond our reasonable control.
        </p>

        <h3 style={headingStyle}>12. Changes to the Service</h3>
        <p style={paragraphStyle}>
          CyberBriefs may modify, improve, suspend, or discontinue features of CyberBriefs at any time.
        </p>
        <p style={paragraphStyle}>
          This may include changes to news sources, RSS feeds, AI processing, website functionality, layouts, subscription features, or other components of the platform.
        </p>

        <h3 style={headingStyle}>13. Third-Party RSS Availability</h3>
        <p style={paragraphStyle}>
          The availability of news information may depend on third-party RSS feeds and publisher systems.
        </p>
        <p style={paragraphStyle}>
          If a publisher changes, removes, restricts, modifies, or discontinues an RSS feed, certain content may become unavailable on CyberBriefs.
        </p>
        <p style={paragraphStyle}>
          We are not responsible for interruptions caused by changes or failures in third-party feeds or publisher infrastructure.
        </p>

        <h3 style={headingStyle}>14. User Feedback</h3>
        <p style={paragraphStyle}>
          If you submit suggestions, feedback, ideas, or recommendations about CyberBriefs, you grant us permission to use that feedback to evaluate, develop, and improve the service without creating an obligation to compensate you.
        </p>

        <h3 style={headingStyle}>15. Privacy</h3>
        <p style={paragraphStyle}>
          Your use of CyberBriefs is also subject to our Privacy Policy, which explains how information may be collected, used, stored, and protected.
        </p>
        <p style={paragraphStyle}>
          By using the service, you acknowledge that you have reviewed our Privacy Policy.
        </p>

        <h3 style={headingStyle}>16. Disclaimer of Warranties</h3>
        <p style={paragraphStyle}>
          CyberBriefs is provided on an "as available" basis to the extent permitted by applicable law.
        </p>
        <p style={paragraphStyle}>
          We do not warrant that the service or information presented through it will always be accurate, complete, reliable, uninterrupted, secure, or free from errors.
        </p>
        <p style={paragraphStyle}>
          We make no guarantee regarding the availability, accuracy, or completeness of information originating from third-party publishers or RSS feeds.
        </p>

        <h3 style={headingStyle}>17. Limitation of Liability</h3>
        <p style={paragraphStyle}>
          To the maximum extent permitted by applicable law, CyberBriefs and its affiliates, officers, employees, contractors, and service providers will not be responsible for losses or damages arising from your use of or inability to use CyberBriefs or reliance on information presented through the service.
        </p>
        <p style={paragraphStyle}>
          This includes, where legally permitted, indirect, incidental, consequential, special, or other similar damages.
        </p>

        <h3 style={headingStyle}>18. Indemnification</h3>
        <p style={paragraphStyle}>
          To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless CyberBriefs and its affiliates, officers, employees, contractors, and service providers from claims, liabilities, damages, losses, and expenses arising from your unlawful use of the service or violation of these Terms.
        </p>

        <h3 style={headingStyle}>19. Content Removal and Rights Concerns</h3>
        <p style={paragraphStyle}>
          If you are a publisher, copyright holder, or authorized representative and believe that content referenced or displayed by CyberBriefs requires correction, review, or removal, you may contact us with the relevant information.
        </p>
        <p style={paragraphStyle}>
          Requests should include enough information for us to identify the relevant content and understand the nature of the request.
        </p>
        <p style={paragraphStyle}>
          We may review requests and take appropriate action where we determine it is necessary or appropriate.
        </p>

        <h3 style={headingStyle}>20. Changes to These Terms</h3>
        <p style={paragraphStyle}>
          We may update these Terms of Use from time to time to reflect changes to our services, technology, business practices, or applicable legal requirements.
        </p>
        <p style={paragraphStyle}>
          Updated Terms will be posted on this page with a revised effective date. Your continued use of CyberBriefs after changes are posted constitutes acceptance of the updated Terms to the extent permitted by applicable law.
        </p>

        <h3 style={headingStyle}>21. Severability</h3>
        <p style={paragraphStyle}>
          If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision will be interpreted or limited to the extent necessary, and the remaining provisions will continue to apply.
        </p>

        <h3 style={headingStyle}>22. Entire Agreement</h3>
        <p style={paragraphStyle}>
          These Terms, together with policies or additional terms expressly referenced by them, constitute the agreement governing your use of CyberBriefs, except where additional written agreements apply.
        </p>

        <h3 style={headingStyle}>23. Contact Us</h3>
        <p style={paragraphStyle}>
          If you have questions about these Terms of Use, the operation of CyberBriefs, RSS content, AI-generated summaries, or other aspects of the service, please contact us using the contact information provided on the website.
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