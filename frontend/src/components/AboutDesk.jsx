import React from "react";

export default function AboutDesk({ onBack }) {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <div className="kicker">BEHIND THE SCENES</div>
          <h1>About CyberBriefs</h1>
          <p>Your daily desk for AI, cybersecurity, and technology news.</p>
        </div>

        <button className="refresh" onClick={onBack}>
          ← BACK TO NEWS
        </button>
      </section>

      <section
        className="about-content"
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 30px",
          lineHeight: "1.8",
          color: "#161412",
          fontSize: "17px",
        }}
      >
        <p>
          <strong>CyberBriefs</strong> is a modern news discovery platform
          designed to help readers follow the rapidly changing worlds of
          cybersecurity, artificial intelligence, software, cloud computing,
          technology, and digital security.
        </p>

        <p>
          The technology landscape moves quickly. New vulnerabilities are
          discovered, security incidents unfold, AI models are released,
          companies announce products, and researchers publish developments
          across many sources. CyberBriefs brings relevant stories from
          technology and cybersecurity publishers into one focused news desk
          so readers can quickly understand what is happening and decide which
          stories deserve a deeper read.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          A Focused Technology News Desk
        </h2>

        <p>
          CyberBriefs serves developers, cybersecurity professionals,
          technology enthusiasts, students, researchers, founders, and anyone
          interested in the technologies shaping the modern world.
        </p>

        <p>
          Coverage may include cybersecurity incidents, data breaches,
          vulnerabilities, malware campaigns, threat intelligence, security
          research, artificial intelligence, machine learning, cloud
          infrastructure, software development, major technology releases, and
          privacy developments.
        </p>

        <p>
          CyberBriefs does not replace professional journalism. It acts as a
          discovery layer that helps readers find relevant reporting and
          continue to the original publisher.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          RSS-Powered News Aggregation
        </h2>

        <p>
          CyberBriefs uses RSS and publisher-provided feeds to collect
          available information from technology and cybersecurity publications.
          Depending on the source, a feed may include a headline, publication
          date, description, image, category, publisher name, and link to the
          original article.
        </p>

        <p>
          The system processes these feeds and organizes incoming stories into
          a unified news stream. The original publisher remains the
          destination for the complete article, detailed reporting,
          quotations, technical information, and full context.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          AI-Powered News Summaries
        </h2>

        <p>
          CyberBriefs may use artificial intelligence to process incoming
          stories and generate concise summaries. These summaries can identify
          the central event, relevant organizations or technologies, and the
          broader significance of a development.
        </p>

        <p>
          Summaries are intended to help readers decide which original stories
          to explore. AI-generated content may contain mistakes, omissions,
          outdated information, or incorrect interpretations. Readers should
          verify important information through the original publisher or
          another authoritative source.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Understanding Why It Matters
        </h2>

        <p>
          CyberBriefs aims to explain not only what happened but also why a
          development may matter. For example, a technical vulnerability
          announcement may be summarized in terms of the affected technology,
          potential impact, and relevance to readers.
        </p>

        <p>
          The same approach may be applied to AI releases, security incidents,
          developer tools, cloud technologies, and other complex technology
          stories.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Accessibility First
        </h2>

        <p>
          CyberBriefs includes browser-based text-to-speech functionality that
          allows users to listen to available summaries and briefings. Native
          browser speech synthesis converts displayed text into spoken audio
          on the user's device.
        </p>

        <p>
          CyberBriefs continues to explore ways to improve usability across
          devices, screen sizes, and accessibility needs.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Built for Signal, Not Noise
        </h2>

        <p>
          CyberBriefs is designed to reduce the time required to find
          meaningful technology news. By combining multiple sources,
          organizing incoming headlines, and applying automated processing, it
          provides a cleaner starting point for daily news discovery.
        </p>

        <p>
          The goal is simple: help readers spend less time searching and more
          time understanding the developments that matter.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Our Technology
        </h2>

        <ul
          style={{
            paddingLeft: "25px",
            marginTop: "15px",
            marginBottom: "25px",
          }}
        >
          <li style={{ marginBottom: "12px" }}>
            <strong>Backend:</strong> Django and Python support the APIs, data
            processing, and server-side workflows.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Frontend:</strong> React and JavaScript provide the
            interactive news interface.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>AI processing:</strong> Local Mistral models running through
            Ollama may support automated summarization and content processing.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>News sources:</strong> RSS and publisher-provided feeds
            supply headlines and article metadata.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Content processing:</strong> Automated workflows organize
            incoming stories and prepare them for presentation.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Text-to-speech:</strong> Native browser speech synthesis
            allows users to listen to available summaries and briefings.
          </li>
        </ul>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Independent Sources, One Unified Desk
        </h2>

        <p>
          CyberBriefs brings information from multiple publishers together
          without presenting itself as the original publisher. Each source has
          its own editorial standards, reporting practices, and areas of
          expertise.
        </p>

        <p>
          Readers are encouraged to visit the original publication for
          complete reporting and additional context.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          What CyberBriefs Is Not
        </h2>

        <p>
          CyberBriefs is not a replacement for professional journalism,
          security advisories, technical documentation, or authoritative
          sources.
        </p>

        <p>
          AI-generated summaries and automated classifications may contain
          inaccuracies. Important cybersecurity, technical, legal, financial,
          medical, or business decisions should be based on verified
          information from appropriate authoritative sources.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Our Vision
        </h2>

        <p>
          Our vision is to create a smarter and more accessible way to
          understand the rapidly changing technology landscape.
        </p>

        <p>
          CyberBriefs is built around a simple principle:
          <strong> discover quickly, understand clearly, and read from the
          source.</strong>
        </p>

        <div
          style={{
            marginTop: "50px",
            paddingTop: "25px",
            borderTop: "1px solid #D8D1C4",
            color: "#5E574C",
            fontSize: "14px",
            lineHeight: "1.7",
          }}
        >
          <strong>CyberBriefs</strong>
          <br />
          AI, Cybersecurity & Technology News
          <br />
          News discovery powered by RSS feeds and AI-assisted content processing.
        </div>
      </section>
    </main>
  );
}