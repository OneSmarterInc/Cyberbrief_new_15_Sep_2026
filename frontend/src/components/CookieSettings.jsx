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
          Last updated: September 22, 2026
        </p>

        <p style={paragraphStyle}>
          CyberBriefs uses limited browser storage to provide essential website functionality, maintain secure administrative sessions, and remember certain interface settings.
        </p>

        <p style={paragraphStyle}>
          CyberBriefs does not currently use third-party advertising cookies, cross-site advertising trackers, or third-party analytics cookies.
        </p>

        <h3 style={headingStyle}>1. Cookies and Browser Storage</h3>
        <p style={paragraphStyle}>
          Cookies are small files that websites may store on your device. CyberBriefs may also use local storage and session storage, which provide similar functionality within your browser.
        </p>

        <h3 style={headingStyle}>2. Technologies We Use</h3>
        <p style={paragraphStyle}>
          CyberBriefs currently uses essential browser storage for:
        </p>
        <ul style={listStyle}>
          <li>Maintaining authenticated administrative sessions</li>
          <li>Remembering the signed-in user and current page</li>
          <li>Remembering the selected administrative view</li>
        </ul>
        <p style={paragraphStyle}>
          Authentication information is stored only as needed to provide and protect restricted website functionality.
        </p>

        <h3 style={headingStyle}>3. Essential Storage</h3>
        <p style={paragraphStyle}>
          Essential storage supports login, authentication, navigation, security, and administrative functionality. Disabling or clearing this storage may sign you out or prevent restricted features from working correctly.
        </p>
        <p style={paragraphStyle}>
          CyberBriefs does not use this storage to create advertising profiles or track your activity across unrelated websites.
        </p>

        <h3 style={headingStyle}>4. RSS Feeds and AI Processing</h3>
        <p style={paragraphStyle}>
          CyberBriefs collects news from RSS and publisher-provided feeds. Automated systems and artificial intelligence may organize, categorize, and summarize that content.
        </p>
        <p style={paragraphStyle}>
          RSS collection and AI processing occur through CyberBriefs' backend systems. These processes do not require cookies or browser storage on your device.
        </p>

        <h3 style={headingStyle}>5. Analytics and Advertising</h3>
        <p style={paragraphStyle}>
          CyberBriefs does not currently use third-party analytics or advertising cookies.
        </p>
        <p style={paragraphStyle}>
          If analytics, advertising, or other optional tracking technologies are introduced, this page will be updated. Where required by law, users will be given an appropriate consent choice before non-essential technologies are activated.
        </p>

        <h3 style={headingStyle}>6. External Websites</h3>
        <p style={paragraphStyle}>
          CyberBriefs links to original news publishers and other external websites. When you open an external link, that website may use its own cookies or tracking technologies.
        </p>
        <p style={paragraphStyle}>
          CyberBriefs does not control the cookie practices of external websites. Please review their privacy and cookie policies for more information.
        </p>

        <h3 style={headingStyle}>7. Managing Browser Storage</h3>
        <p style={paragraphStyle}>
          You can view, delete, or restrict cookies and browser storage through your browser's privacy or site-data settings.
        </p>
        <p style={paragraphStyle}>
          Clearing CyberBriefs' site data may sign you out and reset saved navigation or interface settings.
        </p>

        <h3 style={headingStyle}>8. Changes to These Settings</h3>
        <p style={paragraphStyle}>
          CyberBriefs may update this page if its use of cookies, browser storage, analytics, or other technologies changes. The date at the top will show when the page was most recently revised.
        </p>

        <h3 style={headingStyle}>9. Related Policies</h3>
        <p style={paragraphStyle}>
          This Cookie Settings page should be read together with the CyberBriefs Privacy Policy and Terms of Use.
        </p>

        <h3 style={headingStyle}>10. Contact Us</h3>
        <p style={paragraphStyle}>
          If you have questions about cookies, browser storage, or CyberBriefs' privacy practices, please contact us using the contact information available on the CyberBriefs website.
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
          News discovery powered by RSS feeds and AI-assisted content processing.
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