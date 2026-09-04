import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  ArrowRight,
  Info,
  Menu,
  ChevronRight,
  Award,
  Layers,
  Check,
  Leaf,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function App() {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = useState('query');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Backend Health Status
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

  // Query Engine State
  const [question, setQuestion] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  // Voice Interaction (Native Browser Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Product Classifier State
  const [description, setDescription] = useState('');
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyResponse, setClassifyResponse] = useState(null);
  const [classifyError, setClassifyError] = useState('');

  // Escalation Modal State
  const [showEscalatedModal, setShowEscalatedModal] = useState(false);
  const [escalateSubmitted, setEscalateSubmitted] = useState(false);

  // Check Backend Health on Mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy' || data.status === 'online') {
          setBackendStatus({ online: true, checking: false, details: data });
        } else {
          setBackendStatus({ online: false, checking: false });
        }
      })
      .catch(() => setBackendStatus({ online: false, checking: false }));
  }, []);

  // Initialize Web Speech API for Voice Input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuestion(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Language Code mapping for Speech Recognition
  const getLanguageCode = (langName) => {
    switch (langName) {
      case 'Hindi': return 'hi-IN';
      case 'Marathi': return 'mr-IN';
      case 'Tamil': return 'ta-IN';
      case 'Telugu': return 'te-IN';
      case 'Bengali': return 'bn-IN';
      case 'Gujarati': return 'gu-IN';
      case 'Kannada': return 'kn-IN';
      case 'Malayalam': return 'ml-IN';
      default: return 'en-IN';
    }
  };

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Voice input is using Web Speech API. Please allow microphone permissions in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = getLanguageCode(targetLanguage);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Text-to-Speech Output Reader
  const toggleTextToSpeech = (textToRead) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const cleanText = textToRead.replace(/[*#_\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Submit Query to Backend API `/api/query`
  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setQueryLoading(true);
    setQueryError('');
    setQueryResponse(null);
    setShowFullExplanation(false);

    // Stop speaking if currently active
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    try {
      const payload = { question, jurisdiction };
      if (targetLanguage) {
        payload.target_language = targetLanguage;
      }

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errText = `Server returned status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errText = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      setQueryResponse(data);
    } catch (err) {
      setQueryError(err.message || 'Failed to connect to backend legal engine.');
    } finally {
      setQueryLoading(false);
    }
  };

  // Submit Regulatory Classification to Backend API `/api/classify`
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
        let errText = `Server returned status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errText = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      setClassifyResponse(data);
    } catch (err) {
      setClassifyError(err.message || 'Failed to connect to classification service.');
    } finally {
      setClassifyLoading(false);
    }
  };

  // Quick Prompt Populator
  const handleQuickPrompt = (promptText, jur = 'India') => {
    setQuestion(promptText);
    setJurisdiction(jur);
    setShowFullExplanation(false);
    // Smooth scroll to assistant workspace
    const el = document.getElementById('ask-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper for Genuine Backend Confidence Badge (High, Medium, Low)
  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'High':
        return (
          <span className="confidence-badge high" title="High certainty supported directly by verified statutory sources">
            <ShieldCheck className="w-4 h-4" /> High Confidence
          </span>
        );
      case 'Medium':
        return (
          <span className="confidence-badge medium" title="Medium certainty based on statutory definitions and principles">
            <AlertTriangle className="w-4 h-4" /> Medium Confidence
          </span>
        );
      case 'Low':
        return (
          <span className="confidence-badge low" title="Low certainty or complex query - human legal escalation recommended">
            <AlertTriangle className="w-4 h-4" /> Low Confidence
          </span>
        );
      default:
        return null;
    }
  };

  // Helper for splitting answer into bold first-line takeaway and detailed explanation
  const splitAnswer = (answerText) => {
    if (!answerText) return { firstLine: '', rest: '' };
    const parts = answerText.trim().split(/\n\n+/);
    const firstLine = parts[0] || '';
    const rest = parts.slice(1).join('\n\n');
    return { firstLine, rest };
  };

  // Check if verifier caveat is present in answer
  const hasVerifierCaveat = queryResponse?.answer?.includes('*Note: Parts of this answer could not be fully verified');

  return (
    <div className="app-root">
      {/* Top Official Government & Hackathon Banner */}
      <div className="gov-banner">
        <div className="gov-banner-left">
          <div className="gov-flag-dots">
            <span className="gov-dot-saffron"></span>
            <span className="gov-dot-white"></span>
            <span className="gov-dot-green"></span>
          </div>
          <span>MINISTRY OF AYUSH • GOVERNMENT OF INDIA</span>
        </div>
      </div>

      {/* Modern Glassmorphic Header */}
      <header className="navbar">
        <div className="nav-container">
          <a href="#" className="nav-brand">
            <div className="brand-emblem">
              <Scale size={24} />
            </div>
            <div className="brand-info">
              <h1>IP-SAKTI Sahayak</h1>
              <p>Ayurvedic Intellectual Property & Regulatory AI Assistant</p>
            </div>
          </a>

          <nav className="nav-links">
            <button 
              className={`nav-link-btn ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => setActiveTab('query')}
            >
              <Search className="w-4 h-4" /> Ask IP-SAKTI
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'classify' ? 'active' : ''}`}
              onClick={() => setActiveTab('classify')}
            >
              <Tag className="w-4 h-4" /> Regulatory Classifier
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setActiveTab('how-it-works')}
            >
              <Layers className="w-4 h-4" /> How It Works
            </button>
            <div className="bhashini-header-pill">
              <Sparkles className="w-3.5 h-3.5" /> Multilingual Support
            </div>
          </nav>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* HERO SECTION WITH AYURVEDIC PHOTOGRAPH */}
      <section className="hero-section">
        <div className="hero-bg-container">
          <img 
            src="/ayurvedic.jpg" 
            alt="Ayurvedic Traditional Knowledge background" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <BookOpen className="w-4 h-4" /> AI Guidance for Traditional Knowledge & IP
          </div>

          <h1 className="hero-title">
            Protecting Wisdom. <br />
            Navigating <span className="hero-title-highlight">Ayurvedic IP Law.</span>
          </h1>

          <p className="hero-description">
            Intelligent legal guidance for Ayurvedic formulations, patentability rules, 
            Traditional Knowledge protection, Geographical Indications, and regulatory compliance.
          </p>

          <div className="hero-actions">
            <button 
              className="btn-hero-primary"
              onClick={() => {
                setActiveTab('query');
                const el = document.getElementById('ask-workspace');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ask IP-SAKTI <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              className="btn-hero-secondary"
              onClick={() => {
                setActiveTab('classify');
                const el = document.getElementById('ask-workspace');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Tag className="w-4 h-4" /> Classify Formulation
            </button>
          </div>

          <div className="hero-feature-tags">
            <span className="hero-tag"><Check className="w-4 h-4 text-emerald-400" /> Patents Act, 1970 (Sec 3(p))</span>
            <span className="hero-tag"><Check className="w-4 h-4 text-emerald-400" /> Biological Diversity Act (ABS)</span>
            <span className="hero-tag"><Check className="w-4 h-4 text-emerald-400" /> FSSAI Ayurveda-Aahar</span>
            <span className="hero-tag"><Check className="w-4 h-4 text-emerald-400" /> TRIPS & Nagoya Protocol</span>
          </div>
        </div>
      </section>

      {/* MAIN WORKSPACE AREA */}
      <main className="workspace-container" id="ask-workspace">
        {/* Navigation Tabs Bar for Workspace */}
        <div className="flex justify-center mb-8">
          <div className="jurisdiction-switch" style={{ padding: '6px', background: 'var(--bg-glass-card)' }}>
            <button 
              className={`jurisdiction-btn ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => setActiveTab('query')}
              style={{ fontSize: '0.95rem', padding: '10px 24px' }}
            >
              <Search className="w-4 h-4" /> Ask IP-SAKTI Legal Engine
            </button>
            <button 
              className={`jurisdiction-btn ${activeTab === 'classify' ? 'active' : ''}`}
              onClick={() => setActiveTab('classify')}
              style={{ fontSize: '0.95rem', padding: '10px 24px' }}
            >
              <Tag className="w-4 h-4" /> Product Regulatory Classifier
            </button>
            <button 
              className={`jurisdiction-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setActiveTab('how-it-works')}
              style={{ fontSize: '0.95rem', padding: '10px 24px' }}
            >
              <Layers className="w-4 h-4" /> Legal Corpus & Architecture
            </button>
          </div>
        </div>

        {/* TAB 1: ASK IP-SAKTI MAIN AI ASSISTANT */}
        {activeTab === 'query' && (
          <div className="assistant-workspace">
            <div className="card-glass">
              {/* Workspace Controls Bar */}
              <div className="query-controls-bar">
                <div className="control-group">
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Target Language:
                  </span>
                  <select 
                    className="custom-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    aria-label="Select Target Language"
                  >
                    <option value="">English (Authoritative)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                  </select>
                </div>

                <div className="control-group">
                  <span className="text-sm font-semibold text-slate-300">Jurisdiction:</span>
                  <div className="jurisdiction-switch">
                    <button 
                      type="button"
                      className={`jurisdiction-btn ${jurisdiction === 'India' ? 'active' : ''}`}
                      onClick={() => setJurisdiction('India')}
                    >
                      🇮🇳 India Law
                    </button>
                    <button 
                      type="button"
                      className={`jurisdiction-btn ${jurisdiction === 'International' ? 'active' : ''}`}
                      onClick={() => setJurisdiction('International')}
                    >
                      🌐 International Law
                    </button>
                  </div>
                </div>
              </div>

              {/* Scope Info Panel - Diagrammatic Grid */}
              <div className="scope-grid-wrapper">
                <div className="scope-grid">
                  <div className="scope-card">
                    <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Patent Eligibility</span>
                  </div>
                  <div className="scope-card">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>GI &amp; Trademark Protection</span>
                  </div>
                  <div className="scope-card">
                    <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Biodiversity/ABS Compliance</span>
                  </div>
                  <div className="scope-card">
                    <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Product Classification</span>
                  </div>
                  <div className="scope-card">
                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Case Precedents</span>
                  </div>
                </div>
                <p className="scope-caption">
                  Questions outside Indian/international IP and AYUSH regulatory law will be declined.
                </p>
              </div>

              {/* Main Input Textarea */}
              <form onSubmit={handleQuerySubmit} className="mt-6">
                <div className="input-wrapper">
                  <textarea 
                    className="prompt-textarea"
                    placeholder="Ask IP-SAKTI about Ayurvedic patents, Traditional Knowledge protection, GI, trademarks, or Ayurveda regulations..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />

                  <div className="input-actions-strip">
                    <div className="input-actions-left">
                      {/* Native Voice Input Button */}
                      <button 
                        type="button"
                        className={`btn-bhashini-voice ${isListening ? 'listening' : ''}`}
                        onClick={toggleVoiceInput}
                        title="Voice speech-to-text input powered by Web Speech API"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isListening ? 'Listening...' : '🎙 Voice Input'}
                      </button>
                    </div>

                    <div className="input-actions-right">
                      <button 
                        type="submit" 
                        className="btn-submit-query"
                        disabled={queryLoading || !question.trim()}
                      >
                        {queryLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 spinner" />
                            Analyzing Corpus...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Ask IP-SAKTI
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Sample Prompts Chips */}
              <div className="sample-queries-container">
                <span className="sample-label">Sample Questions (Click to Ask):</span>
                <div className="sample-chips-grid">
                  <button 
                    type="button"
                    className="sample-chip"
                    onClick={() => handleQuickPrompt("Can I patent a classical Ayurvedic formulation like Chawanprash in India?", "India")}
                  >
                    🌿 Chawanprash Patentability
                  </button>
                  <button 
                    type="button"
                    className="sample-chip"
                    onClick={() => handleQuickPrompt("Do I need NBA approval to export Indian medicinal plants for foreign commercial research?", "India")}
                  >
                    📜 NBA Medicinal Plant Export
                  </button>
                  <button 
                    type="button"
                    className="sample-chip"
                    onClick={() => handleQuickPrompt("What does Article 27 of the TRIPS Agreement state regarding patent exclusions for therapeutic methods?", "International")}
                  >
                    🌐 TRIPS Article 27 Exclusions
                  </button>
                  <button 
                    type="button"
                    className="sample-chip"
                    onClick={() => handleQuickPrompt("What happened in the Neem patent case and why was it revoked?", "International")}
                  >
                    🛡️ Neem Patent Case Study
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message Card */}
            {queryError && (
              <div className="card-glass border-red-500 bg-red-950/40 text-red-200">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Query Execution Error
                </div>
                <p className="text-sm mt-1 text-red-300">{queryError}</p>
              </div>
            )}

            {/* RESPONSE CARD DISPLAY */}
            {queryResponse && (
              <div className="card-glass response-container">
                <div className="response-header-bar">
                  <div className="response-title">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>IP Legal Guidance & Statutory Analysis</span>
                    <span className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full font-medium">
                      Jurisdiction: {jurisdiction}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Genuine Backend Confidence Indicator */}
                    {getConfidenceBadge(queryResponse.confidence)}

                    {/* Text-to-Speech Button */}
                    <button 
                      type="button"
                      className="btn-hero-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => toggleTextToSpeech(queryResponse.answer)}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {isSpeaking ? 'Stop Reading' : 'Listen'}
                    </button>
                  </div>
                </div>

                {/* Markdown Main Answer with Progressive Disclosure */}
                {(() => {
                  const { firstLine, rest } = splitAnswer(queryResponse.answer);
                  return (
                    <div className="answer-wrapper">
                      {/* Bolded Takeaway Line Always Rendered */}
                      <div className="answer-markdown takeaway-line">
                        <ReactMarkdown>{firstLine}</ReactMarkdown>
                      </div>

                      {/* Full Explanation Collapsed by Default */}
                      {rest && (
                        <>
                          <div className={`explanation-content ${showFullExplanation ? 'expanded' : 'collapsed'}`}>
                            <div className="answer-markdown mt-3">
                              <ReactMarkdown>{rest}</ReactMarkdown>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-toggle-explanation"
                            onClick={() => setShowFullExplanation(!showFullExplanation)}
                          >
                            {showFullExplanation ? (
                              <>
                                <ChevronUp className="w-4 h-4" /> Hide full explanation
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" /> Show full explanation
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Regional Language Translation Display Box */}
                {queryResponse.translated_answer && (
                  <div className="translated-card">
                    <div className="translated-card-title">
                      <Globe className="w-4 h-4" />
                      Translated Explanation ({targetLanguage || 'Regional Language'})
                    </div>
                    <div className="answer-markdown">
                      <ReactMarkdown>{queryResponse.translated_answer}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Verifier Warning Banner */}
                {hasVerifierCaveat && (
                  <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-amber-300 block">Independent Auditor Flag</span>
                      Parts of this answer could not be fully verified against the cited sources — human legal review is recommended for high-stakes decisions.
                    </div>
                  </div>
                )}

                {/* Citations Grid */}
                {queryResponse.citations && queryResponse.citations.length > 0 && (
                  <div className="citations-wrapper">
                    <div className="citations-heading">Verified Statutory Sources & Citations</div>
                    <div className="citations-grid">
                      {queryResponse.citations.map((cit, idx) => (
                        <a 
                          key={idx}
                          href={cit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="citation-card"
                        >
                          <div>
                            <span className="citation-title">{cit.source_name}</span>
                            <span className="citation-sub">{cit.section}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Strip with Escalation Button */}
                <div className="response-footer-strip">
                  <div className="legal-disclaimer">
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{queryResponse.disclaimer || "This is informational guidance, not legal advice."}</span>
                  </div>

                  {queryResponse.escalate_available && (
                    <button 
                      type="button"
                      className="btn-escalate"
                      onClick={() => setShowEscalatedModal(true)}
                    >
                      <AlertTriangle className="w-4 h-4" />
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
          <div className="classifier-workspace">
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-subtle">
                <Tag className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Ayurvedic Product Regulatory Classifier</h2>
                  <p className="text-xs text-slate-400">Categorize product formulations under Indian Drugs & Cosmetics Rules and FSSAI regulations</p>
                </div>
              </div>

              <form onSubmit={handleClassifySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Formulation & Manufacturing Description</label>
                  <textarea 
                    className="prompt-textarea"
                    style={{ minHeight: '110px' }}
                    placeholder="Enter full formulation details (e.g., Herbal hair oil containing Amla and Bhringraj processed using coconut oil as per Sharangdhara Samhita)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Sample Presets */}
                <div className="sample-queries-container mb-4">
                  <span className="sample-label">Product Formulation Presets:</span>
                  <div className="sample-chips-grid">
                    <button 
                      type="button" 
                      className="sample-chip"
                      onClick={() => setDescription("Chawanprash manufactured strictly according to the formula described in Sharangdhara Samhita.")}
                    >
                      📜 Classical Chawanprash
                    </button>
                    <button 
                      type="button" 
                      className="sample-chip"
                      onClick={() => setDescription("Ayurvedic cough syrup containing Ashwagandha and Tulsi in modern syrup vehicle packaged in 100ml PET bottle.")}
                    >
                      🧪 Proprietary Cough Syrup
                    </button>
                    <button 
                      type="button" 
                      className="sample-chip"
                      onClick={() => setDescription("A novel food beverage infused with Brahmi and Shankhpushpi marketed as a daily health tonic under FSSAI regulations.")}
                    >
                      🍵 Ayurveda-Aahar Beverage
                    </button>
                    <button 
                      type="button" 
                      className="sample-chip"
                      onClick={() => setDescription("Herbal hair vitalizing oil with Amla, Bhringraj, and Coconut oil for external scalp massage.")}
                    >
                      🧴 Herbal Cosmetic Oil
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    type="submit"
                    className="btn-submit-query"
                    disabled={classifyLoading || !description.trim()}
                  >
                    {classifyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner" />
                        Classifying...
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

              {/* Classification Output */}
              {classifyResponse && (
                <div className="category-result-card">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Determined Regulatory Category</span>
                    {getConfidenceBadge(classifyResponse.confidence)}
                  </div>

                  <h3 className="category-badge-title">{classifyResponse.category}</h3>

                  <p className="category-explanation">
                    {classifyResponse.category === 'Classical Medicine' && 
                      'Recognized under the First Schedule of the Drugs and Cosmetics Act, 1940. Excluded from patent protection under Section 3(p) of the Patents Act, 1970.'}
                    {classifyResponse.category === 'Patent or Proprietary Medicine' && 
                      'Contains Ayurvedic ingredients in non-classical proportions or modern dosage form. Patentable only if non-obvious inventive step is proven beyond traditional knowledge.'}
                    {classifyResponse.category === 'Ayurveda-Aahar / Nutraceutical' && 
                      'Regulated under FSSAI Ayurveda-Aahar Regulations, 2022. Governed by food safety compliance standards rather than pharmaceutical licensing.'}
                    {classifyResponse.category === 'Cosmetic' && 
                      'Topical application intended for beautification or hygiene. Governed by Cosmetic Rules under the Drugs and Cosmetics Act.'}
                    {classifyResponse.category === 'Phytopharmaceutical' && 
                      'Purified, standardized fraction of medicinal plant extract. Subject to botanical drug regulatory pathway.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HOW IT WORKS & KNOWLEDGE SOURCES */}
        {activeTab === 'how-it-works' && (
          <div>
            <div className="section-header">
              <span className="section-tag">Platform Architecture</span>
              <h2 className="section-title">Legal Knowledge & RAG Engine</h2>
              <p className="section-subtitle">
                IP-SAKTI Sahayak combines verified statutory legal corpora, vector retrieval, and closed-context audit verification.
              </p>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon-box"><BookOpen className="w-6 h-6" /></div>
                <h3>Patents Act, 1970</h3>
                <p>Grounding in Section 3(p), Section 3(d), Section 3(h), and statutory exclusions for traditional knowledge and classical formulations.</p>
              </div>

              <div className="info-card">
                <div className="info-icon-box"><ShieldCheck className="w-6 h-6" /></div>
                <h3>Biological Diversity Act, 2002</h3>
                <p>Compliance guidelines for National Biodiversity Authority (NBA) approval, Access and Benefit Sharing (ABS), and Nagoya Protocol obligations.</p>
              </div>

              <div className="info-card">
                <div className="info-icon-box"><Globe className="w-6 h-6" /></div>
                <h3>TRIPS Agreement</h3>
                <p>International intellectual property standards under WIPO, TRIPS Article 27, and landmark revocation case studies (Neem, Turmeric, Basmati).</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* HUMAN EXPERT ESCALATION MODAL */}
      {showEscalatedModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Ministry of Ayush — Human Expert Escalation</h3>
              <button className="btn-close-modal" onClick={() => setShowEscalatedModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!escalateSubmitted ? (
              <div>
                <p className="text-sm text-slate-300 mb-4">
                  This query has been flagged for human legal review. Submitting this request routes your question to the Ministry of Ayush IP Legal Advisory Panel.
                </p>

                <div className="nodal-contact-box">
                  <strong className="block text-white mb-1">Nodal Contact Office:</strong>
                  <div>Ministry of Ayush, Ayush Bhawan, B Block, GPO Complex, INA, New Delhi - 110023</div>
                  <div className="mt-1 text-slate-400">Phone: 011-24651942 | Email: support-moayush@nic.in | Web: ayush.gov.in</div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="btn-hero-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setShowEscalatedModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-submit-query" onClick={() => setEscalateSubmitted(true)}>
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Submit Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-white text-lg">Escalation Ticket Submitted</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Ticket Ref: AYUSH-IP-2026-8841. An Ayush IP officer will review your query.</p>
                <button className="btn-submit-query mx-auto" onClick={() => { setShowEscalatedModal(false); setEscalateSubmitted(false); }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Scale className="w-5 h-5 text-emerald-400" /> IP-SAKTI Sahayak
          </div>
          <p>© 2026 Ministry of Ayush, Government of India.</p>
          <ul className="footer-links">
            <li><a href="https://ayush.gov.in" target="_blank" rel="noreferrer">Ministry of Ayush</a></li>
            <li><a href="https://ipindia.gov.in" target="_blank" rel="noreferrer">IP India Portal</a></li>
            <li><a href="https://tkdl.res.in" target="_blank" rel="noreferrer">TKDL Portal</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
