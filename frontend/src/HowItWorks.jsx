import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  BookOpen,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Mic,
  ChevronDown,
  ChevronUp,
  Scale,
  FileText,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function HowItWorks({ onBackToAsk }) {
  // State for collapsible "See how it works internally" sections
  const [expandedStages, setExpandedStages] = useState({});

  const toggleStage = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  return (
    <div className="how-it-works-page">
      {/* Top Breadcrumb / Back Bar */}
      <div className="hiw-top-bar">
        <button className="hiw-back-btn" onClick={onBackToAsk}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ask IP-SAKTI</span>
        </button>
        <div className="hiw-tag-pill">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transparency & Verification Methodology</span>
        </div>
      </div>

      {/* Hero Section */}
      <header className="hiw-hero">
        <div className="hiw-hero-badge">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Under the Hood</span>
        </div>
        <h1 className="hiw-title">HOW IP-SAKTI WORKS</h1>
        <p className="hiw-subtitle">Question → Evidence → Assessment</p>
        <p className="hiw-narrative">
          IP-SAKTI transforms a natural-language question into a structured, evidence-grounded response
          by understanding your context, retrieving relevant information, and checking the supporting
          evidence before presenting the result.
        </p>

        {/* High-Level Narrative Flowchart */}
        <div className="hiw-flow-banner">
          <div className="hiw-flow-step">
            <span className="step-num">01</span>
            <span className="step-label">YOUR QUESTION</span>
          </div>
          <div className="hiw-flow-arrow">→</div>
          <div className="hiw-flow-step">
            <span className="step-num">02</span>
            <span className="step-label">UNDERSTAND</span>
          </div>
          <div className="hiw-flow-arrow">→</div>
          <div className="hiw-flow-step">
            <span className="step-num">03</span>
            <span className="step-label">FIND RELEVANT EVIDENCE</span>
          </div>
          <div className="hiw-flow-arrow">→</div>
          <div className="hiw-flow-step highlight-step">
            <span className="step-num">04</span>
            <span className="step-label">CHECK THE EVIDENCE</span>
          </div>
          <div className="hiw-flow-arrow">→</div>
          <div className="hiw-flow-step">
            <span className="step-num">05</span>
            <span className="step-label">CLEAR RESULT</span>
          </div>
        </div>
      </header>

      {/* Core Stages Container */}
      <main className="hiw-stages-container">
        {/* 01 — QUERY UNDERSTANDING */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">01</div>
            <div>
              <span className="stage-meta-category">QUERY UNDERSTANDING</span>
              <h2 className="stage-title">First, IP-SAKTI understands what you're asking</h2>
            </div>
          </div>

          <p className="stage-description">
            Instead of forwarding your input blindly as a simple text search, IP-SAKTI analyzes your
            question to isolate the specific Ayurvedic product or formulation, your underlying IP goal,
            and the applicable jurisdiction.
          </p>

          {/* Concrete Interactive Example */}
          <div className="hiw-example-box">
            <div className="example-query-banner">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Example Query: <em>"Can I patent Chyawanprash in India?"</em></span>
            </div>
            <div className="example-grid">
              <div className="example-item">
                <span className="item-key">Product:</span>
                <span className="item-val">Chyawanprash</span>
              </div>
              <div className="example-item">
                <span className="item-key">Intent:</span>
                <span className="item-val">Patentability Evaluation</span>
              </div>
              <div className="example-item">
                <span className="item-key">Goal:</span>
                <span className="item-val">Patentability assessment</span>
              </div>
              <div className="example-item">
                <span className="item-key">Jurisdiction:</span>
                <span className="item-val">India</span>
              </div>
            </div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              Understanding the context helps IP-SAKTI retrieve information relevant to your actual
              question instead of treating every query as a generic search.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-1')}
          >
            <span>{expandedStages['stage-1'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-1'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-1'] && (
            <div className="hiw-tech-reveal">
              <h4>Internal Context Resolution</h4>
              <p>
                The query parser extracts four distinct semantic dimensions: <code>Intent</code> (e.g. patentability vs. regulatory licensing), <code>Product</code> (identifying specific ASU botanicals or classical formulations), <code>User Goal</code>, and <code>Jurisdiction</code>. It also references multi-turn session history to resolve follow-up inquiries (e.g., <em>"What about in the US?"</em>) without requiring the user to re-enter full context.
              </p>
            </div>
          )}
        </section>

        {/* 02 — EVIDENCE BASE */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">02</div>
            <div>
              <span className="stage-meta-category">CONTROLLED KNOWLEDGE</span>
              <h2 className="stage-title">Where does the information come from?</h2>
            </div>
          </div>

          <p className="stage-description">
            IP-SAKTI uses a controlled knowledge base containing relevant legal, regulatory,
            institutional and supporting information. We call this <strong>Our Evidence Base</strong>.
          </p>

          {/* Categories Grid */}
          <div className="hiw-categories-grid">
            <div className="category-column">
              <div className="category-header">
                <Scale className="w-4 h-4 text-emerald-400" />
                <h3>Indian IP & Regulatory Information</h3>
              </div>
              <ul className="category-list">
                <li><strong>Patents Act, 1970</strong> (Section 3(p), Section 3(d), Section 2(1)(j))</li>
                <li><strong>Biological Diversity Act, 2002</strong> (NBA approvals & ABS obligations)</li>
                <li><strong>Trade Marks Act, 1999 & GI Act, 1999</strong> (Brand & regional indications)</li>
                <li><strong>Drugs and Cosmetics Act, 1940</strong> (ASU licensing & First Schedule)</li>
                <li><strong>Food Safety & Standards Authority</strong> (FSSAI Ayurveda-Aahar Regulations, 2022)</li>
              </ul>
            </div>

            <div className="category-column">
              <div className="category-header">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3>International Frameworks</h3>
              </div>
              <ul className="category-list">
                <li><strong>TRIPS Agreement</strong> (Article 27 & patentable subject matter)</li>
                <li><strong>WIPO Standards</strong> (Intergovernmental Committee on IP & Genetic Resources)</li>
                <li><strong>Patent Cooperation Treaty (PCT)</strong> (International filing routes)</li>
                <li><strong>Convention on Biological Diversity (CBD)</strong> & Nagoya Protocol</li>
              </ul>
            </div>

            <div className="category-column">
              <div className="category-header">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3>Supporting Knowledge</h3>
              </div>
              <ul className="category-list">
                <li><strong>Traditional Knowledge Digital Library (TKDL)</strong> documentation precedents</li>
                <li><strong>Landmark Revocation Precedents</strong> (e.g. historical Turmeric, Neem, and Basmati challenges)</li>
                <li><strong>Official Practice Guidelines</strong> published for ASU patent examinations</li>
              </ul>
            </div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              You can trace the information back to its supporting sources instead of receiving an unexplained AI-generated response.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-2')}
          >
            <span>{expandedStages['stage-2'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-2'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-2'] && (
            <div className="hiw-tech-reveal">
              <h4>Knowledge Base Structure</h4>
              <p>
                The corpus is organized into curated statutory records with fine-grained metadata tagging (Jurisdiction, Primary Act, Relevant Section, Authority Type, and Direct Government Document URL). TKDL records serve as non-statutory supporting prior-art documentation to demonstrate traditional knowledge documentation principles without confusing them for statutory law.
              </p>
            </div>
          )}
        </section>

        {/* 03 — RAG RETRIEVAL */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">03</div>
            <div>
              <span className="stage-meta-category">RETRIEVAL & RELEVANCE</span>
              <h2 className="stage-title">How does IP-SAKTI find what matters?</h2>
            </div>
          </div>

          <p className="stage-description">
            Rather than scanning every document by brute force or keyword match, the system uses
            semantic understanding to identify legal provisions that match the conceptual meaning of your inquiry.
          </p>

          {/* Step Pipeline Visualization */}
          <div className="hiw-mini-pipeline">
            <div className="mini-pipeline-node">YOUR QUESTION</div>
            <div className="mini-pipeline-arrow">↓</div>
            <div className="mini-pipeline-node">Meaning-based representation</div>
            <div className="mini-pipeline-arrow">↓</div>
            <div className="mini-pipeline-node">Knowledge Base Search</div>
            <div className="mini-pipeline-arrow">↓</div>
            <div className="mini-pipeline-node">Relevant Evidence</div>
            <div className="mini-pipeline-arrow">↓</div>
            <div className="mini-pipeline-node">Relevance + Context Ranking</div>
            <div className="mini-pipeline-arrow">↓</div>
            <div className="mini-pipeline-node node-highlight">Evidence Used for the Response</div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              The system searches for information based on meaning and context, not only exact keyword matches,
              helping surface evidence relevant to the question.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-3')}
          >
            <span>{expandedStages['stage-3'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-3'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-3'] && (
            <div className="hiw-tech-reveal">
              <h4>Retrieval & Legal Reranking Technology</h4>
              <p>
                <strong>Embeddings:</strong> Sentence Transformers (<code>all-MiniLM-L6-v2</code>) generate dense vector representations.<br />
                <strong>Vector Database:</strong> ChromaDB maintains indexed embeddings partitioned by jurisdiction (India vs. International).<br />
                <strong>Legal Reranking:</strong> An authority-aware reranker promotes primary statutory exclusions (e.g., Section 3(p) for traditional formulations) above generic regulatory definitions to ensure the most pertinent legal sections guide the response.
              </p>
            </div>
          )}
        </section>

        {/* 04 — ANSWER GENERATION */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">04</div>
            <div>
              <span className="stage-meta-category">SYNTHESIS</span>
              <h2 className="stage-title">The AI doesn't work from the question alone</h2>
            </div>
          </div>

          <p className="stage-description">
            The language model receives relevant retrieved evidence as context and generates a structured
            response around that evidence. It is strictly constrained to synthesize guidance using the retrieved statutory excerpts.
          </p>

          <div className="hiw-synthesis-visual">
            <div className="synthesis-inputs">
              <div className="syn-box">YOUR QUESTION</div>
              <span className="syn-plus">+</span>
              <div className="syn-box">RETRIEVED EVIDENCE</div>
            </div>
            <div className="syn-arrow">↓</div>
            <div className="syn-box syn-engine">AI RESPONSE GENERATION</div>
            <div className="syn-arrow">↓</div>
            <div className="syn-box syn-result">STRUCTURED RESPONSE</div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              The response remains connected to the evidence retrieved for your question rather than
              relying only on the model's general knowledge.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-4')}
          >
            <span>{expandedStages['stage-4'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-4'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-4'] && (
            <div className="hiw-tech-reveal">
              <h4>Constrained LLM Architecture</h4>
              <p>
                The synthesis stage utilizes Groq and Gemini models loaded with strict closed-context instructions. The prompt mandates structured sections (Verdict, Assessment, Legal Basis, Alternative Routes, Next Action) and prohibits fabricating statutes or court cases.
              </p>
            </div>
          )}
        </section>

        {/* 05 — CLAIM & CITATION VERIFICATION ⭐ (HERO PILLAR) */}
        <section className="hiw-stage-card hero-pillar-card">
          <div className="pillar-badge-ribbon">
            <ShieldCheck className="w-4 h-4" />
            <span>CORE TRUST PILLAR</span>
          </div>

          <div className="hiw-stage-header">
            <div className="stage-index-badge pillar-badge">05</div>
            <div>
              <span className="stage-meta-category text-emerald-400">CLAIM & CITATION VERIFICATION</span>
              <h2 className="stage-title">We don't stop at generating an answer</h2>
            </div>
          </div>

          <p className="stage-description">
            Important claims are checked against the retrieved evidence before the response is finalized.
            Claim-level verification against retrieved evidence ensures that material legal assertions are corroborated by the cited legal provisions.
          </p>

          {/* Verification Pipeline Flow */}
          <div className="hiw-verification-flow">
            <div className="v-step">GENERATED RESPONSE</div>
            <div className="v-arrow">→</div>
            <div className="v-step">CLAIM IDENTIFICATION</div>
            <div className="v-arrow">→</div>
            <div className="v-step">CLAIM ↔ EVIDENCE</div>
            <div className="v-arrow">→</div>
            <div className="v-step highlight-v">VERIFICATION</div>
            <div className="v-arrow">→</div>
            <div className="v-step">CITATION CHECK</div>
            <div className="v-arrow">→</div>
            <div className="v-step">FINAL RESPONSE</div>
          </div>

          {/* Real Example Box */}
          <div className="hiw-claim-example-card">
            <div className="claim-row">
              <span className="claim-label">CLAIM:</span>
              <p className="claim-content">"Section 3(p) addresses inventions that are, in effect, traditional knowledge or an aggregation/duplication of known properties of traditionally known components. Whether it applies depends on the subject matter and claims of the particular invention."</p>
            </div>
            <div className="evidence-row">
              <span className="claim-label">EVIDENCE:</span>
              <p className="evidence-content">Patents Act, 1970 — Section 3(p)</p>
            </div>
            <div className="result-row">
              <span className="claim-label">RESULT:</span>
              <span className="result-badge-supported">
                <CheckCircle2 className="w-4 h-4" /> Evidence supported
              </span>
            </div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              You are not asked to simply trust an AI-generated statement. Important claims are connected
              to supporting evidence and citations.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-5')}
          >
            <span>{expandedStages['stage-5'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-5'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-5'] && (
            <div className="hiw-tech-reveal">
              <h4>Claim Verification Engine</h4>
              <p>
                Every key legal assertion undergoes claim-level verification against retrieved statutory chunks. If a claim cannot be verified against the underlying source, it is flagged, and any unsupported citations are pruned to protect source integrity. Every material claim presented as supported must have a corresponding verified citation.
              </p>
            </div>
          )}
        </section>

        {/* 06 — EVIDENCE CONFIDENCE & ABSTENTION ⭐ (HERO PILLAR) */}
        <section className="hiw-stage-card hero-pillar-card">
          <div className="pillar-badge-ribbon">
            <Scale className="w-4 h-4" />
            <span>CORE TRUST PILLAR</span>
          </div>

          <div className="hiw-stage-header">
            <div className="stage-index-badge pillar-badge">06</div>
            <div>
              <span className="stage-meta-category text-emerald-400">TRANSPARENT CONFIDENCE</span>
              <h2 className="stage-title">How strong is the supporting evidence?</h2>
            </div>
          </div>

          <p className="stage-description">
            The system evaluates multiple evidence signals rather than relying on the language model's
            own confidence. Evidence confidence describes the strength of the supporting information —
            it is not a prediction of whether an application will be approved or legally successful.
          </p>

          {/* Multi-Signal Diagram */}
          <div className="hiw-signals-diagram">
            <div className="signals-grid">
              <div className="signal-pill">Retrieval Quality</div>
              <span className="sig-plus">+</span>
              <div className="signal-pill">Source Authority</div>
              <span className="sig-plus">+</span>
              <div className="signal-pill">Jurisdiction Match</div>
              <span className="sig-plus">+</span>
              <div className="signal-pill">Claim Support</div>
              <span className="sig-plus">+</span>
              <div className="signal-pill">Citation Integrity</div>
            </div>
            <div className="sig-arrow">↓</div>
            <div className="signal-output">Evidence Confidence Assessment</div>
          </div>

          {/* Confidence Tiers */}
          <div className="hiw-confidence-tiers">
            <div className="tier-card tier-high">
              <span className="tier-badge badge-high">HIGH</span>
              <h4>Strong supporting evidence</h4>
              <p>Direct statutory provisions and clear regulatory frameworks directly align with the query.</p>
            </div>
            <div className="tier-card tier-medium">
              <span className="tier-badge badge-medium">MEDIUM</span>
              <h4>Useful but partial or qualified evidence</h4>
              <p>General statutory guidelines apply, but final determination depends on individual application claims.</p>
            </div>
            <div className="tier-card tier-low">
              <span className="tier-badge badge-low">LOW</span>
              <h4>Limited or uncertain evidence</h4>
              <p>Relevant statutes touch on related topics, but clear legal precedents are sparse or ambiguous.</p>
            </div>
            <div className="tier-card tier-abstain">
              <span className="tier-badge badge-abstain">ABSTAIN</span>
              <h4>Insufficient evidence for a reliable assessment</h4>
              <p>The system openly communicates the gap and offers escalation to human legal facilitators.</p>
            </div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              You can see when the supporting information is strong, limited or insufficient, giving you
              realistic decision support instead of artificial certainty.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-6')}
          >
            <span>{expandedStages['stage-6'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-6'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-6'] && (
            <div className="hiw-tech-reveal">
              <h4>Composite Evidence Scoring</h4>
              <p>
                The confidence metric synthesizes vector cosine distance (below 0.40 threshold for High), source authority rating (Acts and Gazette Rules outrank general commentary), jurisdiction parity, and verification survival ratios. When evidence falls below minimum standards, the system intentionally abstains rather than inventing speculative conclusions.
              </p>
            </div>
          )}
        </section>

        {/* 07 — SECURITY & GUARDRAILS */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">07</div>
            <div>
              <span className="stage-meta-category">SECURITY & ISOLATION</span>
              <h2 className="stage-title">How does IP-SAKTI protect the process?</h2>
            </div>
          </div>

          <p className="stage-description">
            Legal systems require strict safeguards against manipulation and out-of-jurisdiction contamination.
            IP-SAKTI implements defense-in-depth across the pipeline.
          </p>

          {/* 4 Compact Security Cards */}
          <div className="hiw-security-grid">
            <div className="security-card">
              <div className="sec-icon-box"><Lock className="w-5 h-5 text-emerald-400" /></div>
              <h3>Input Protection</h3>
              <p>Suspicious or manipulative instructions are detected during input processing before reaching any language model.</p>
            </div>
            <div className="security-card">
              <div className="sec-icon-box"><Database className="w-5 h-5 text-indigo-400" /></div>
              <h3>Source Protection</h3>
              <p>The knowledge base is controlled rather than freely editable by users, preserving the integrity of legal statutes.</p>
            </div>
            <div className="security-card">
              <div className="sec-icon-box"><Globe className="w-5 h-5 text-amber-400" /></div>
              <h3>Jurisdiction Isolation</h3>
              <p>Information from different jurisdictions is kept separated during retrieval, preventing Indian exclusions from leaking into US questions.</p>
            </div>
            <div className="security-card">
              <div className="sec-icon-box"><AlertTriangle className="w-5 h-5 text-teal-400" /></div>
              <h3>Abstention</h3>
              <p>When evidence is insufficient, the system communicates that limitation rather than forcing an unsupported conclusion.</p>
            </div>
          </div>

          <div className="hiw-closing-quote">
            <p>"The goal is not to always produce an answer. The goal is to avoid presenting unsupported information as reliable information."</p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-7')}
          >
            <span>{expandedStages['stage-7'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-7'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-7'] && (
            <div className="hiw-tech-reveal">
              <h4>Multi-Layer Guardrail Details</h4>
              <p>
                Layer 1 employs heuristic and pattern filtering to detect system prompt extraction, jailbreaks, or instructional overrides. Layer 2 isolates retrieved context blocks as passive data strings. Layer 3 strictly restricts ChromaDB query filters to the selected jurisdiction parameter (<code>{'where={"jurisdiction": filter_jur}'}</code>).
              </p>
            </div>
          )}
        </section>

        {/* 08 — MULTILINGUAL & VOICE */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">08</div>
            <div>
              <span className="stage-meta-category">ACCESSIBILITY</span>
              <h2 className="stage-title">Information should be accessible to more users</h2>
            </div>
          </div>

          <p className="stage-description">
            AYUSH practitioners, researchers, and traditional knowledge holders speak diverse languages.
            IP-SAKTI provides native interaction while keeping legal citations grounded in authoritative legal terms.
          </p>

          <div className="hiw-lang-badges">
            <div className="lang-chip active-chip">
              <span className="chip-dot"></span>
              <span>English (Authoritative Grounding)</span>
            </div>
            <div className="lang-chip active-chip">
              <span className="chip-dot"></span>
              <span>Hindi (हिन्दी)</span>
            </div>
            <div className="lang-chip active-chip">
              <span className="chip-dot"></span>
              <span>Marathi (मराठी)</span>
            </div>
            <div className="lang-chip active-chip">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice Input & Speech Output</span>
            </div>
          </div>

          {/* User Benefit Callout */}
          <div className="hiw-benefit-callout">
            <div className="benefit-header">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <strong>HOW THIS BENEFITS YOU:</strong>
            </div>
            <p>
              Users can interact with IP-SAKTI through supported languages and voice while the
              evidence-grounded workflow remains behind the interaction.
            </p>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            className="hiw-expand-btn"
            onClick={() => toggleStage('stage-8')}
          >
            <span>{expandedStages['stage-8'] ? 'Hide internal methodology' : 'See how it works internally'}</span>
            {expandedStages['stage-8'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedStages['stage-8'] && (
            <div className="hiw-tech-reveal">
              <h4>Audio & Translation Architecture</h4>
              <p>
                Voice capture relies on the standard browser <strong>Web Speech API</strong> for zero-latency speech-to-text. Regional translation is processed by dedicated neural models instructed to maintain exact statute names (e.g. <em>Patents Act, 1970 Section 3(p)</em>) in English to prevent mistranslating codified legal terminology.
              </p>
            </div>
          )}
        </section>

        {/* 09 — FINAL USER RESULT */}
        <section className="hiw-stage-card">
          <div className="hiw-stage-header">
            <div className="stage-index-badge">09</div>
            <div>
              <span className="stage-meta-category">DELIVERABLE</span>
              <h2 className="stage-title">From a Question to a Clearer Understanding</h2>
            </div>
          </div>

          <p className="stage-description">
            Rather than a wall of generic text, the final result is formatted into an actionable decision-support hierarchy:
          </p>

          {/* Result Hierarchy Flowchart */}
          <div className="hiw-result-hierarchy">
            <div className="res-node main-node">
              <strong>Assessment / Verdict</strong>
              <span>Immediate qualified outcome answering your question directly</span>
            </div>
            <div className="res-down-arrow">↓</div>
            <div className="res-node">
              <strong>Why it applies</strong>
              <span>Concise 1–3 sentence explanation highlighting key legal factors</span>
            </div>
            <div className="res-down-arrow">↓</div>
            <div className="res-node">
              <strong>Supporting Evidence</strong>
              <span>Specific statutory sections and prior-art documentation</span>
            </div>
            <div className="res-down-arrow">↓</div>
            <div className="res-node">
              <strong>Evidence Confidence</strong>
              <span>Evaluation of the strength and sufficiency of the supporting information</span>
            </div>
            <div className="res-down-arrow">↓</div>
            <div className="res-node">
              <strong>Verified Sources & Citations</strong>
              <span>Direct links to the relevant official source/document</span>
            </div>
            <div className="res-down-arrow">↓</div>
            <div className="res-node">
              <strong>Recommended Next Steps</strong>
              <span>Actionable compliance checklist and human expert escalation when needed</span>
            </div>
          </div>

          {/* Official Disclaimer */}
          <div className="hiw-disclaimer-card">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong>Important Notice:</strong> IP-SAKTI provides IP and regulatory information for research and decision support. It is not legal advice and does not replace qualified legal or regulatory professionals.
            </p>
          </div>

          {/* Bottom Action CTA */}
          <div className="hiw-cta-bar">
            <button className="btn-hero-primary" onClick={onBackToAsk}>
              <span>Try IP-SAKTI Legal Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
