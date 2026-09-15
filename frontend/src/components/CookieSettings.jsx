
import React from "react";

export default function CookieSettings({ onBack }) {
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
          Cookie Settings
        </h1>

        <p
          style={{
            color: "#5E574C",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          Manage how The Aggregate uses cookies and similar technologies.
        </p>

        <p style={paragraphStyle}>
          The Aggregate, operated by OneSmarter, Inc., uses cookies, browser
          storage, and similar technologies to provide essential website
          functionality and improve your experience.
        </p>

        <p style={paragraphStyle}>
          This page explains the types of technologies that may be used when
          you visit The Aggregate and provides information about the choices
          available to you.
        </p>

        <p style={paragraphStyle}>
          Our approach is designed to minimize unnecessary tracking. The
          Aggregate does not currently use third-party advertising cookies or
          sell users' browsing activity to advertisers.
        </p>

        <h3 style={headingStyle}>1. What Are Cookies?</h3>

        <p style={paragraphStyle}>
          Cookies are small pieces of information that websites may store in
          your browser or on your device. They can help websites remember
          information about your visit, maintain sessions, save preferences,
          and provide certain functionality.
        </p>

        <p style={paragraphStyle}>
          Similar technologies, such as local storage and session storage, can
          also store information in your browser and may perform functions
          similar to cookies.
        </p>

        <h3 style={headingStyle}>2. How The Aggregate Uses These Technologies</h3>

        <p style={paragraphStyle}>
          The Aggregate may use cookies and browser storage for purposes
          including:
        </p>

        <ul style={listStyle}>
          <li>Maintaining essential website functionality.</li>
          <li>Remembering certain user preferences.</li>
          <li>Maintaining authentication or session state where applicable.</li>
          <li>Remembering whether certain website notices have been dismissed.</li>
          <li>Improving website performance and reliability.</li>
          <li>Understanding general website usage where analytics are enabled.</li>
        </ul>

        <h3 style={headingStyle}>3. Strictly Necessary Technologies</h3>

        <p style={paragraphStyle}>
          Certain cookies or browser-storage technologies are necessary for
          the website to function correctly. These technologies do not exist
          primarily for advertising or cross-site tracking.
        </p>

        <p style={paragraphStyle}>
          Depending on the features you use, essential storage may be used to
          maintain navigation state, authentication sessions, security
          controls, or other required application functionality.
        </p>

        <div
          style={{
            padding: "24px",
            backgroundColor: "#FAFAFA",
            border: "1px solid #EBE4D5",
            marginTop: "25px",
            marginBottom: "30px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "not-allowed",
              opacity: 0.75,
            }}
          >
            <input
              type="checkbox"
              checked
              disabled
              readOnly
              style={{
                width: "18px",
                height: "18px",
                accentColor: "#C9A227",
              }}
            />

            <span>
              <strong
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "15px",
                }}
              >
                Essential System Cookies
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#5E574C",
                }}
              >
                Required for core website functionality.
              </span>
            </span>
          </label>
        </div>

        <h3 style={headingStyle}>4. Authentication and Session Storage</h3>

        <p style={paragraphStyle}>
          If The Aggregate provides authenticated areas or account-related
          functionality, browser storage may be used to maintain an active
          session and help verify that requests are associated with the
          appropriate session.
        </p>

        <p style={paragraphStyle}>
          Authentication-related storage is considered essential where it is
          required to provide the requested service or protect account
          functionality.
        </p>

        <h3 style={headingStyle}>5. Preferences and Local Storage</h3>

        <p style={paragraphStyle}>
          Local storage may be used to remember certain choices made within
          the website. For example, the application may remember interface
          preferences, dismissed notices, or other settings so that you do not
          have to repeatedly provide the same preference during your visits.
        </p>

        <p style={paragraphStyle}>
          These technologies are generally stored within your browser and are
          not intended to identify you personally.
        </p>

        <h3 style={headingStyle}>6. Analytics and Measurement</h3>

        <p style={paragraphStyle}>
          The Aggregate may use analytics technologies in the future to
          understand general website performance and usage.
        </p>

        <p style={paragraphStyle}>
          Analytics may help us understand information such as which features
          are used, which pages receive traffic, how users navigate the
          website, and whether technical problems are occurring.
        </p>

        <p style={paragraphStyle}>
          Where analytics technologies are introduced, this page may be
          updated to describe the relevant provider and the choices available
          to users.
        </p>

        <div
          style={{
            padding: "24px",
            backgroundColor: "#F7F3EA",
            border: "1px solid #E5D9BE",
            marginTop: "25px",
            marginBottom: "30px",
          }}
        >
          <strong
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "18px",
            }}
          >
            Current Tracking Status
          </strong>

          <p
            style={{
              lineHeight: "1.7",
              color: "#333",
              margin: "12px 0 0",
              fontSize: "14px",
            }}
          >
            The Aggregate does not currently deploy third-party advertising
            cookies or use cross-site advertising tracking technologies.
          </p>
        </div>

        <h3 style={headingStyle}>7. Advertising Cookies</h3>

        <p style={paragraphStyle}>
          The Aggregate does not currently use third-party advertising cookies
          to build advertising profiles based on your activity across other
          websites.
        </p>

        <p style={paragraphStyle}>
          If advertising functionality is introduced in the future, this
          policy may be updated to explain the technologies used and provide
          appropriate choices where required.
        </p>

        <h3 style={headingStyle}>8. Third-Party Services</h3>

        <p style={paragraphStyle}>
          Some technical services used to operate The Aggregate may place or
          access cookies or similar technologies when their functionality is
          required.
        </p>

        <p style={paragraphStyle}>
          Examples may include infrastructure, security, authentication,
          analytics, email delivery, or other service providers.
        </p>

        <p style={paragraphStyle}>
          Third-party technologies are subject to the applicable provider's
          own policies and terms.
        </p>

        <h3 style={headingStyle}>9. Managing Cookies Through Your Browser</h3>

        <p style={paragraphStyle}>
          Most modern browsers allow you to view, delete, block, or restrict
          cookies through their privacy and security settings.
        </p>

        <p style={paragraphStyle}>
          You may also be able to configure your browser to notify you when a
          website attempts to store cookies.
        </p>

        <p style={paragraphStyle}>
          Please note that disabling certain storage technologies may affect
          the functionality of The Aggregate, particularly features that
          require authentication, sessions, preferences, or security controls.
        </p>

        <h3 style={headingStyle}>10. Clearing Local Storage</h3>

        <p style={paragraphStyle}>
          You can generally clear local storage and session storage through
          your browser's developer or site-data settings.
        </p>

        <p style={paragraphStyle}>
          Clearing this information may reset preferences, dismissals,
          sessions, or other locally stored application state.
        </p>

        <h3 style={headingStyle}>11. Do Not Track Signals</h3>

        <p style={paragraphStyle}>
          Some browsers provide a "Do Not Track" or similar browser setting.
          Because there is currently no universal technical standard for
          interpreting these signals, The Aggregate may not respond to every
          browser implementation in the same manner.
        </p>

        <h3 style={headingStyle}>12. Changes to Cookie Usage</h3>

        <p style={paragraphStyle}>
          As The Aggregate evolves, we may introduce new functionality,
          analytics systems, security mechanisms, or other technologies that
          use cookies or browser storage.
        </p>

        <p style={paragraphStyle}>
          If our use of these technologies changes materially, we may update
          this page and revise the date shown at the top.
        </p>

        <h3 style={headingStyle}>13. Relationship to Our Privacy Policy</h3>

        <p style={paragraphStyle}>
          This Cookie Settings page should be read together with The
          Aggregate's Privacy Policy and Terms of Use.
        </p>

        <p style={paragraphStyle}>
          Our Privacy Policy provides additional information about how
          information collected through our website may be used, retained,
          protected, and disclosed.
        </p>

        <h3 style={headingStyle}>14. Your Privacy Choices</h3>

        <p style={paragraphStyle}>
          Depending on your location and applicable law, you may have
          additional rights regarding personal information and tracking
          technologies.
        </p>

        <p style={paragraphStyle}>
          You may also choose to unsubscribe from newsletters and other
          optional communications at any time.
        </p>

        <h3 style={headingStyle}>15. Contact Us</h3>

        <p style={paragraphStyle}>
          If you have questions about cookies, browser storage, analytics,
          privacy settings, or how The Aggregate uses tracking technologies,
          please contact OneSmarter, Inc. using the contact information
          provided on the website.
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
          <strong>The Aggregate</strong>
          <br />
          Operated by Cyberbrie,
          <br />
          News discovery powered by RSS feeds and automated content
          processing.
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

