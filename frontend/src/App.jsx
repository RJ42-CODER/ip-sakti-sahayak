import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Scale, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Loader2, 
  Search, 
  Tag, 
  Send,
  CheckCircle2,
  X,
  FileText,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('query');

  // Query tab state
  const [question, setQuestion] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState(null);
  const [queryError, setQueryError] = useState('');

  // Classify tab state
  const [description, setDescription] = useState('');
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyResponse, setClassifyResponse] = useState(null);
  const [classifyError, setClassifyError] = useState('');

  // Escalation Modal state
  const [showEscalatedModal, setShowEscalatedModal] = useState(false);
  const [escalateSubmitted, setEscalateSubmitted] = useState(false);

  // Handlers
  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setQueryLoading(true);
    setQueryError('');
    setQueryResponse(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, jurisdiction })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setQueryResponse(data);
    } catch (err) {
      setQueryError(err.message || 'Failed to connect to backend legal engine.');
    } finally {
      setQueryLoading(false);
    }
  };

  const handleClassifySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setClassifyLoading(true);
    setClassifyError('');
    setClassifyResponse(null);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setClassifyResponse(data);
    } catch (err) {
      setClassifyError(err.message || 'Failed to connect to classification service.');
    } finally {
      setClassifyLoading(false);
    }
  };

  const handleQuickPrompt = (promptText, jur = 'India') => {
    setQuestion(promptText);
    setJurisdiction(jur);
  };

  const handlePresetDescription = (descText) => {
    setDescription(descText);
  };

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'High':
        return <span className="badge badge-high"><ShieldCheck className="w-3.5 h-3.5" /> High Confidence</span>;
      case 'Medium':
        return <span className="badge badge-medium"><AlertTriangle className="w-3.5 h-3.5" /> Medium Confidence</span>;
      case 'Low':
        return <span className="badge badge-low"><AlertTriangle className="w-3.5 h-3.5" /> Low Confidence</span>;
      default:
        return null;
    }
  };

  // Check if answer contains verifier caveat text
  const hasVerifierCaveat = queryResponse?.answer?.includes('*Note: Parts of this answer could not be fully verified');

  return (
    <div className="app-root">
      {/* Top Gov Banner */}
      <div className="gov-top-bar">
        <div className="gov-left">
          <span>MINISTRY OF AYUSH • GOVERNMENT OF INDIA</span>
        </div>
        <div>
          <span>Smart India Hackathon 2026 (SIH26045)</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="portal-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="emblem-icon">
              <Scale size={24} />
            </div>
            <div className="brand-titles">
              <h1>IP-SAKTI Sahayak</h1>
              <p>Ayurvedic Intellectual Property & Regulatory Compliance AI Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="main-container">
        {/* Nav Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            <Search className="w-4 h-4" />
            IP Legal Query Engine
          </button>
          <button 
            className={`nav-tab ${activeTab === 'classify' ? 'active' : ''}`}
            onClick={() => setActiveTab('classify')}
          >
            <Tag className="w-4 h-4" />
            Product Regulatory Classifier
          </button>
        </nav>

        {/* TAB 1: IP LEGAL QUERY */}
        {activeTab === 'query' && (
          <div className="tab-content">
            <div className="panel-card">
              <div className="panel-header">
                <div className="panel-title">
                  <FileText className="w-5 h-5 text-blue-900" />
                  Ask an Intellectual Property or Regulatory Question
                </div>
                
                {/* Jurisdiction Toggle */}
                <div className="jurisdiction-toggle">
                  <button 
                    type="button"
                    className={`toggle-btn ${jurisdiction === 'India' ? 'active' : ''}`}
                    onClick={() => setJurisdiction('India')}
                  >
                    🇮🇳 India Law
                  </button>
                  <button 
                    type="button"
                    className={`toggle-btn ${jurisdiction === 'International' ? 'active' : ''}`}
                    onClick={() => setJurisdiction('International')}
                  >
                    🌐 International Law
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuerySubmit}>
                <div className="form-group">
                  <label className="form-label">Product / Legal Scenario Description</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Describe your Ayurvedic product, formulation, or action (e.g. Can I patent a classical Ayurvedic formulation like Chawanprash in India?)..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                {/* Quick Sample Prompts */}
                <div className="form-group">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Sample Queries:
                  </span>
                  <div className="quick-prompts">
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handleQuickPrompt("Can I patent a classical Ayurvedic formulation like Chawanprash in India?", "India")}
                    >
                      Chawanprash Patentability
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handleQuickPrompt("Do I need NBA approval to export Indian medicinal plants for foreign commercial research?", "India")}
                    >
                      NBA Plant Export Approval
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handleQuickPrompt("What does Article 27 of the TRIPS Agreement state regarding patent exclusions for therapeutic methods?", "International")}
                    >
                      TRIPS Article 27 Exclusions
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handleQuickPrompt("What happened in the Neem patent case and why was it revoked?", "International")}
                    >
                      Neem Patent Case Study
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={queryLoading || !question.trim()}
                  >
                    {queryLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner" />
                        Analyzing Legal Corpus & Verifying...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Legal Query
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {queryError && (
              <div className="panel-card bg-red-50 border-red-200 text-red-900 p-4 rounded-md mb-6">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Query Execution Error
                </div>
                <p className="text-sm mt-1 text-red-700">{queryError}</p>
              </div>
            )}

            {/* Response Display Panel */}
            {queryResponse && (
              <div className="response-card">
                <div className="response-header">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Legal Guidance & Analysis</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-600 rounded">
                      Jurisdiction: {jurisdiction}
                    </span>
                  </div>
                  <div>
                    {getConfidenceBadge(queryResponse.confidence)}
                  </div>
                </div>

                {/* Markdown Answer */}
                <div className="markdown-body">
                  <ReactMarkdown>{queryResponse.answer}</ReactMarkdown>
                </div>

                {/* Verifier Caveat Banner (if flagged) */}
                {hasVerifierCaveat && (
                  <div className="caveat-banner">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-amber-900">Independent Verification Warning</span>
                      <p>Parts of this answer could not be fully verified against the cited sources — recommend human review for this specific query.</p>
                    </div>
                  </div>
                )}

                {/* Citations Grid */}
                {queryResponse.citations && queryResponse.citations.length > 0 && (
                  <div className="citations-section">
                    <div className="citations-title">Verified Legal Source Citations</div>
                    <div className="citations-grid">
                      {queryResponse.citations.map((cit, idx) => (
                        <a 
                          key={idx}
                          href={cit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="citation-card"
                        >
                          <div className="citation-info">
                            <span className="citation-source">{cit.source_name}</span>
                            <span className="citation-section">{cit.section}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 citation-icon" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalation Button & Disclaimer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-4 border-t border-slate-200">
                  <div className="disclaimer-bar">
                    <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{queryResponse.disclaimer || "This is informational guidance, not legal advice."}</span>
                  </div>

                  {queryResponse.escalate_available && (
                    <button 
                      type="button"
                      className="btn-escalate"
                      onClick={() => setShowEscalatedModal(true)}
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Escalate to Human Legal Expert
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT REGULATORY CLASSIFIER */}
        {activeTab === 'classify' && (
          <div className="tab-content">
            <div className="panel-card">
              <div className="panel-header">
                <div className="panel-title">
                  <Tag className="w-5 h-5 text-blue-900" />
                  Ayurvedic Product Category Classification
                </div>
              </div>

              <form onSubmit={handleClassifySubmit}>
                <div className="form-group">
                  <label className="form-label">Product Formulation & Manufacturing Description</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Enter full product description (e.g. Herbal hair vitalizing oil with Amla and Bhringraj processed using coconut oil as per Sharangdhara Samhita)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Sample Presets */}
                <div className="form-group">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Sample Product Presets:
                  </span>
                  <div className="quick-prompts">
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handlePresetDescription("Chawanprash manufactured strictly according to the formula described in Sharangdhara Samhita.")}
                    >
                      Classical Chawanprash
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handlePresetDescription("Ayurvedic cough syrup containing Ashwagandha and Tulsi in modern syrup vehicle packaged in 100ml PET bottle.")}
                    >
                      Proprietary Cough Syrup
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handlePresetDescription("A novel food beverage infused with Brahmi and Shankhpushpi marketed as a daily health tonic under FSSAI regulations.")}
                    >
                      Ayurveda-Aahar Beverage
                    </button>
                    <button 
                      type="button"
                      className="prompt-chip"
                      onClick={() => handlePresetDescription("Herbal hair vitalizing oil with Amla, Bhringraj, and Coconut oil for external scalp massage.")}
                    >
                      Herbal Cosmetic Oil
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={classifyLoading || !description.trim()}
                  >
                    {classifyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner" />
                        Classifying Regulatory Category...
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4" />
                        Classify Regulatory Category
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Classification Error */}
              {classifyError && (
                <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-md mt-4">
                  <p className="text-sm">{classifyError}</p>
                </div>
              )}

              {/* Classification Response Output */}
              {classifyResponse && (
                <div className="classify-result-box">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Determined Category</span>
                    {getConfidenceBadge(classifyResponse.confidence)}
                  </div>
                  <div className="classify-category-title">
                    {classifyResponse.category}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {classifyResponse.category === 'Classical Medicine' && 
                      'Formulation is recognized under the First Schedule of the Drugs and Cosmetics Act, 1940. Excluded from patent protection under Section 3(p) of Patents Act.'}
                    {classifyResponse.category === 'Patent or Proprietary Medicine' && 
                      'Formulation contains Ayurvedic ingredients in non-classical proportions or modern dosage forms. Patentable only if non-obvious inventive step is proven beyond traditional knowledge.'}
                    {classifyResponse.category === 'Ayurveda-Aahar / Nutraceutical' && 
                      'Regulated under FSSAI Ayurveda-Aahar Regulations, 2022. Governed by food safety compliance standards rather than pharmaceutical drug licensing.'}
                    {classifyResponse.category === 'Cosmetic' && 
                      'Topical application intended for cleansing or beautifying. Governed by Cosmetic Rules under the Drugs and Cosmetics Act.'}
                    {classifyResponse.category === 'Phytopharmaceutical' && 
                      'Purified, standardized fraction of medicinal plant extract. Subject to botanical drug regulatory pathway.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Escalation Modal */}
      {showEscalatedModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ministry of Ayush — Human Expert Escalation</h3>
              <button 
                className="text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setShowEscalatedModal(false);
                  setEscalateSubmitted(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!escalateSubmitted ? (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  This query has been flagged for human legal review. Submitting this request will route your question and retrieved context to the Ministry of Ayush IP Legal Advisory Panel.
                </p>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs text-slate-700 mb-3">
                  <strong>Query:</strong> "{question}"
                </div>
                
                {/* Official Ministry Contact Info */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs text-slate-700 mb-4">
                  <div className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">Nodal Contact Office:</div>
                  <div><strong>Ministry of Ayush</strong>, Ayush Bhawan, B Block, GPO Complex, INA, New Delhi - 110023</div>
                  <div className="mt-1 text-slate-600">Phone: 011-24651942 | Email: support-moayush@nic.in | Web: ayush.gov.in</div>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowEscalatedModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => setEscalateSubmitted(true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Submit Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-base">Escalation Ticket Submitted</h4>
                <p className="text-xs text-slate-600 mt-1 mb-3">Ticket Ref: AYUSH-IP-2026-8841. An Ayush IP officer will review your query.</p>
                
                {/* Official Ministry Contact Info */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs text-slate-700 mb-4 text-left">
                  <div className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">Direct Nodal Office Details:</div>
                  <div><strong>Ministry of Ayush</strong>, Ayush Bhawan, B Block, GPO Complex, INA, New Delhi - 110023</div>
                  <div className="mt-1 text-slate-600">Phone: 011-24651942 | Email: support-moayush@nic.in | Web: ayush.gov.in</div>
                </div>

                <button 
                  className="btn-primary mx-auto"
                  onClick={() => {
                    setShowEscalatedModal(false);
                    setEscalateSubmitted(false);
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="portal-footer">
        <p>© 2026 Ministry of Ayush, Government of India. Developed for Smart India Hackathon 2026 (SIH26045).</p>
      </footer>
    </div>
  );
}
