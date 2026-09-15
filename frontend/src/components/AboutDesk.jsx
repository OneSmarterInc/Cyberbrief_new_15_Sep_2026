
import React from "react";

export default function AboutDesk({ onBack }) {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <div className="kicker">BEHIND THE SCENES</div>
          <h1>About CyberBrief</h1>
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
          <strong>CyberBrief</strong> is a modern news discovery platform
          designed to help you stay informed about the rapidly changing worlds
          of cybersecurity, artificial intelligence, software, cloud
          computing, technology, and digital security.
        </p>

        <p>
          The technology landscape moves faster every day. New vulnerabilities
          are discovered, security incidents unfold, AI models are released,
          companies announce new products, and researchers publish important
          developments across hundreds of different sources. Keeping track of
          all of this information can quickly become overwhelming.
        </p>

        <p>
          CyberBrief was created to solve that problem by bringing relevant
          stories from multiple trusted technology and cybersecurity sources
          into one focused news desk. Instead of opening dozens of websites
          every morning, readers can use CyberBrief to quickly discover what is
          happening and decide which stories deserve a deeper read.
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
          CyberBrief focuses on information that matters to developers,
          cybersecurity professionals, technology enthusiasts, students,
          researchers, founders, and anyone interested in understanding the
          technology shaping the modern world.
        </p>

        <p>
          Our coverage can include cybersecurity incidents, data breaches,
          vulnerabilities, malware campaigns, threat intelligence, security
          research, artificial intelligence, machine learning, cloud
          infrastructure, software development, major technology releases,
          privacy developments, and other important developments across the
          technology industry.
        </p>

        <p>
          Rather than attempting to replace traditional journalism, CyberBrief
          acts as a discovery layer that helps readers find relevant reporting
          from the original publishers.
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
          CyberBrief uses RSS feeds and publisher-provided feeds to collect
          information from technology and cybersecurity publications. RSS
          allows publishers to make information about newly published stories
          available in a structured format.
        </p>

        <p>
          Our system continuously processes available feeds and organizes
          incoming stories into a unified news stream. Depending on the source,
          the information available through an RSS feed may include the
          headline, publication date, description, image, category, publisher,
          and a link to the original article.
        </p>

        <p>
          When you discover a story through CyberBrief, the original publisher
          remains the destination for the complete article and full reporting.
          We encourage readers to visit the original source whenever they want
          the complete context, detailed reporting, quotations, technical
          information, or additional material.
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
          One of the core ideas behind CyberBrief is making large volumes of
          information easier to understand. Our platform can use artificial
          intelligence to process incoming stories and generate concise
          summaries.
        </p>

        <p>
          Instead of spending several minutes reading every article that
          appears in your feed, readers can first review a short summary to
          understand the basic story. The system can identify the central
          event, relevant organizations or technologies, and the broader
          significance of the development.
        </p>

        <p>
          Our AI processing pipeline is designed to reduce unnecessary
          information while preserving the most useful context. Summaries are
          intended to help readers decide which original stories they want to
          explore further.
        </p>

        <p>
          AI-generated summaries can occasionally contain mistakes,
          omissions, or incorrect interpretations. For this reason, CyberBrief
          should be considered a news discovery and summarization tool rather
          than a replacement for the original reporting.
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
          CyberBrief is not only focused on showing users what happened. We
          also aim to make technology news easier to understand by highlighting
          the context behind important developments.
        </p>

        <p>
          A cybersecurity vulnerability, for example, may appear as a technical
          announcement that is difficult for a general reader to understand.
          Our summaries can help explain the basic issue, the technology
          involved, the potential impact, and why the story may matter.
        </p>

        <p>
          The same principle applies to artificial intelligence releases,
          security incidents, developer tools, cloud technologies, and other
          complex technology stories.
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
          News should be accessible in more than one format. CyberBrief
          includes browser-based text-to-speech functionality that allows
          users to listen to available news summaries and briefings without
          having to continuously read the screen.
        </p>

        <p>
          Using native browser speech synthesis capabilities, readers can turn
          written information into spoken audio directly from their device.
          This can be useful while commuting, working, exercising, or simply
          when listening is more convenient than reading.
        </p>

        <p>
          We continue to explore ways to make the CyberBrief experience easier
          to use across different devices, screen sizes, and accessibility
          needs.
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
          The internet produces an enormous amount of technology information
          every day. More information does not necessarily mean better
          information.
        </p>

        <p>
          CyberBrief is built around the idea of reducing the time required to
          find meaningful stories. By bringing multiple sources together,
          organizing incoming headlines, and applying automated processing, we
          aim to give readers a cleaner starting point for their daily
          technology news.
        </p>

        <p>
          The goal is simple: help you spend less time searching for news and
          more time understanding the developments that actually matter.
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
            <strong>Backend:</strong> Django and Python power the core
            application, APIs, data processing, and server-side workflows.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Frontend:</strong> React and JavaScript provide the
            interactive news desk and user interface.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>AI Engine:</strong> Local AI processing can be powered by
            Mistral models through Ollama for automated news summarization and
            content processing.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>News Sources:</strong> RSS and publisher-provided feeds
            supply incoming headlines and article metadata from technology and
            cybersecurity publications.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Content Processing:</strong> Automated workflows process
            incoming stories, organize metadata, and prepare information for
            presentation.
          </li>

          <li style={{ marginBottom: "12px" }}>
            <strong>Text-to-Speech:</strong> Native browser speech synthesis
            enables users to listen to available news summaries and briefings.
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
          CyberBrief brings information from multiple publishers together
          without presenting itself as the original publisher of those
          stories. Each source has its own editorial standards, reporting
          practices, and areas of expertise.
        </p>

        <p>
          We believe readers benefit from being able to discover different
          perspectives and then visit the original publication for complete
          reporting.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          Designed for the Modern Reader
        </h2>

        <p>
          CyberBrief is designed for people who want useful information without
          unnecessary complexity. The interface emphasizes headlines,
          summaries, source information, categories, and quick access to
          original reporting.
        </p>

        <p>
          Whether you have five minutes to scan the latest cybersecurity
          developments or want to spend an entire morning exploring AI and
          technology news, CyberBrief is designed to provide a flexible starting
          point.
        </p>

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "15px",
            fontFamily: "Georgia, serif",
          }}
        >
          What CyberBrief Is Not
        </h2>

        <p>
          CyberBrief is not intended to replace professional journalism,
          security advisories, technical documentation, or authoritative
          sources.
        </p>

        <p>
          AI-generated summaries and automated classifications may contain
          inaccuracies. Important cybersecurity, technical, legal, financial,
          or business decisions should always be based on verified information
          from appropriate authoritative sources.
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
          Our vision for CyberBrief is to create a smarter and more accessible
          way to understand the rapidly changing technology landscape.
        </p>

        <p>
          As artificial intelligence, cybersecurity, cloud computing, and
          software development continue to evolve, the amount of information
          available to readers will continue to grow. We want CyberBrief to
          become a trusted starting point for navigating that information.
        </p>

        <p>
          We are building CyberBrief around a simple principle:
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
          <strong>CyberBrief</strong>
          <br />
          AI, Cybersecurity & Technology News
          <br />
          Operated by OneSmarter, Inc.
        </div>
      </section>
    </main>
  );
}
