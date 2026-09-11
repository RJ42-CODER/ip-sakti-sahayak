import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorks from './HowItWorks';
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

const DEFAULT_UI_TEXTS = {
  gov_banner: "MINISTRY OF AYUSH • GOVERNMENT OF INDIA",
  nav_brand_title: "IP-SAKTI Sahayak",
  nav_brand_sub: "Ayurvedic Intellectual Property & Regulatory AI Assistant",
  nav_ask: "Ask IP-SAKTI",
  nav_classifier: "Regulatory Classifier",
  nav_how_it_works: "How It Works",
  nav_multilingual: "Multilingual Support",
  hero_badge: "AI Guidance for Traditional Knowledge & IP",
  hero_title_1: "Protecting Wisdom.",
  hero_title_2: "Navigating",
  hero_title_3: "Ayurvedic IP Law.",
  hero_desc: "Intelligent legal guidance for Ayurvedic formulations, patentability rules, Traditional Knowledge protection, Geographical Indications, and regulatory compliance.",
  hero_btn_ask: "Ask IP-SAKTI",
  hero_btn_classify: "Classify Formulation",
  tag_patent: "Patents Act, 1970 (Sec 3(p))",
  tag_bio: "Biological Diversity Act (ABS)",
  tag_fssai: "FSSAI Ayurveda-Aahar",
  tag_trips: "TRIPS & Nagoya Protocol",
  tab_ask_legal: "Ask IP-SAKTI Legal Engine",
  tab_classifier: "Product Regulatory Classifier",
  tab_corpus: "Legal Corpus & Architecture",
  target_lang_label: "Target Language:",
  jurisdiction_label: "Jurisdiction:",
  india_law: "India Law",
  international_law: "International Law",
  scope_patent: "Patent Eligibility",
  scope_gi: "GI & Trademark Protection",
  scope_bio: "Biodiversity/ABS Compliance",
  scope_prod: "Product Classification",
  scope_case: "Case Precedents",
  scope_caption: "Questions outside Indian/international IP and AYUSH regulatory law will be declined.",
  ask_input_placeholder: "Ask IP-SAKTI about Ayurvedic patents, Traditional Knowledge protection, GI, trademarks, or Ayurveda regulations...",
  voice_input_btn: "Voice Input",
  voice_listening: "Listening...",
  ask_btn: "Ask IP-SAKTI",
  analyzing_text: "Analyzing legal corpus & verifying claims...",
  sample_q_header: "SAMPLE QUESTIONS (CLICK TO ASK):",
  citations_heading: "Verified Statutory Sources & Citations",
  escalate_btn: "Escalate to Human Legal Expert",
  classifier_title: "Product Regulatory Classifier",
  classifier_desc: "Describe your Ayurvedic formulation or product below to classify it into one of the six regulatory categories under Indian Law.",
  classify_input_placeholder: "Enter full product details e.g. A herbal hair oil made of Amla and Bhringraj processed using coconut oil as per Sharangdhara Samhita...",
  classify_submit_btn: "Classify Product Category"
};

const INTENT_MAP = {
  patentability: 'Patent',
  patent_procedure: 'Patent Procedure',
  trademark: 'Trademark',
  biodiversity_abs: 'Biodiversity / ABS',
  historical_case: 'Case Precedent',
  product_classification: 'Product Classification',
  general_ip: 'General IP'
};

const getVerifiedUrl = (url, sourceName) => {
  if (url && typeof url === 'string' && url.startsWith('http')) return url;
  const s = (sourceName || '').toLowerCase();
  if (s.includes('patent')) return 'https://ipindia.gov.in/acts/patent-act-1970';
  if (s.includes('biodiversity')) return 'https://indiacode.gov.in/act/62219d21-0553-405b-9ccb-a11b4d9c41c2/sections';
  if (s.includes('drug')) return 'https://indiacode.gov.in/act/cd8f2852-7085-432b-a264-7b73a6f01fff/sections';
  if (s.includes('trips')) return 'https://www.wto.org/english/docs_e/legal_e/27-trips_04c_e.htm';
  if (s.includes('fssai')) return 'https://www.fssai.gov.in/';
  if (s.includes('cbd') || s.includes('nagoya')) return 'https://www.cbd.int/';
  return 'https://indiacode.gov.in/';
};

const renderStructuredText = (value) => {
  if (!value) return null;
  
  if (typeof value !== 'string') {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-2 list-disc list-outside ml-4">
          {value.map((v, i) => <li key={i} className="pl-1">{renderStructuredText(v)}</li>)}
        </ul>
      );
    }
    if (typeof value === 'object') {
      return (
        <div className="space-y-2 mt-2">
          {Object.entries(value).map(([k, v]) => (
            <div key={k}>
              <strong className="block text-slate-200 capitalize">{k.replace(/_/g, ' ')}:</strong>
              <div className="pl-2 border-l-2 border-slate-700 mt-1">
                {renderStructuredText(v)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  }

  // Pre-process string to remove accidental accordion/UI chars, raw arrows, and SVG/icon artifacts
  let cleanStr = value
    .replace(/[▼▶⌄▲◀]/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<svg[^>]*>/gi, '')
    .replace(/<\/svg>/gi, '')
    .replace(/\[object Object\]/g, '');

  // Strip leading list bullet if string is a single line, to avoid double bullets in <li>
  if (!cleanStr.includes('\n')) {
    cleanStr = cleanStr.replace(/^[-•*]\s+/, '');
  }

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({node, ...props}) => <p className="mb-4 leading-relaxed last:mb-0" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 mb-4 last:mb-0" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 last:mb-0" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
        a: ({node, ...props}) => <a className="text-emerald-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
        table: ({node, ...props}) => <div className="overflow-x-auto mb-4 rounded-lg border border-slate-700/50"><table className="w-full border-collapse text-sm text-left text-slate-300" {...props} /></div>,
        thead: ({node, ...props}) => <thead className="text-xs uppercase bg-slate-800/80 text-emerald-400 font-bold tracking-wider" {...props} />,
        th: ({node, ...props}) => <th className="px-4 py-3 border-b border-slate-700/50" {...props} />,
        td: ({node, ...props}) => <td className="px-4 py-3 border-b border-slate-700/30 bg-slate-900/20" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="p-4 my-4 border-l-4 border-emerald-500 bg-emerald-900/10 rounded-r-lg shadow-sm" {...props} />
      }}
    >
      {cleanStr}
    </ReactMarkdown>
  );
};

const hasValidContent = (val) => {
  if (!val) return false;
  if (Array.isArray(val)) {
    return val.some(item => hasValidContent(item));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed !== '-' && trimmed !== '—' && trimmed.toLowerCase() !== 'n/a' && trimmed.toLowerCase() !== 'none';
  }
  return true;
};

export default function App() {
  // Navigation & Active View State with Hash Routing Support (#how-it-works)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#how-it-works') {
      return 'how-it-works';
    }
    return 'query';
  });
  const [showDetails, setShowDetails] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync hash routing with browser back / forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#how-it-works') {
        setActiveTab('how-it-works');
      } else if (activeTab === 'how-it-works') {
        setActiveTab('query');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Tab & Route Switcher with URL hash synchronization
  const navigateTo = (tab) => {
    if (tab === 'how-it-works') {
      window.location.hash = 'how-it-works';
    } else {
      if (window.location.hash === '#how-it-works') {
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract clean query-aware primary verdict and short summary
  const getVerdictAndSummary = (resp) => {
    if (!resp) return { verdict: '', summary: '' };

    if (resp.status === 'CLARIFY') {
      return {
        verdict: 'Clarification Needed',
        summary: resp.answer
      };
    }

    if (
      resp.status === 'INSUFFICIENT_EVIDENCE' ||
      resp.evidence_confidence === 'ABSTAIN' ||
      resp.confidence === 'ABSTAIN' ||
      resp.assessment_status === 'INSUFFICIENT_EVIDENCE'
    ) {
      return {
        verdict: "Insufficient Evidence for a Definitive Assessment",
        summary: resp.structured_content?.summary || resp.structured_content?.assessment || "I couldn't establish a reliable answer from the available evidence. A consultation with an authorized human IP facilitator is recommended."
      };
    }

    let rawVerdict = resp.structured_content?.outcome || resp.structured_content?.core_verdict || '';
    let rawSummary = resp.structured_content?.summary || resp.structured_content?.assessment || '';

    // If neither was structured, extract from answer
    if (!rawVerdict && resp.answer) {
      const parts = resp.answer.split(/\n\n+/);
      rawVerdict = parts[0] || '';
      rawSummary = parts.slice(1).join('\n\n') || '';
    }

    // Clean markdown headings/prefixes/bold markers from verdict
    let cleanVerdict = rawVerdict
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/^Core Verdict\s*[:\-]?\s*/i, '')
      .replace(/^Outcome\s*[:\-]?\s*/i, '')
      .replace(/^Verdict\s*[:\-]?\s*/i, '')
      .trim();

    // Clean summary
    let cleanSummary = rawSummary
      .replace(/#{1,6}\s*/g, '')
      .replace(/^Assessment\s*[:\-]?\s*/i, '')
      .replace(/^Summary\s*[:\-]?\s*/i, '')
      .trim();

    // If summary is empty or same as verdict, use next paragraph from answer
    if ((!cleanSummary || cleanSummary === cleanVerdict) && resp.answer) {
      const parts = resp.answer.split(/\n\n+/);
      if (parts.length > 1) {
        cleanSummary = parts[1];
      }
    }

    return { verdict: cleanVerdict, summary: cleanSummary };
  };

  // Hero Animation State
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const heroPhrases = [
    "AYURVEDIC FORMULATIONS",
    "PATENTABILITY RULES",
    "TRADITIONAL KNOWLEDGE PROTECTION",
    "GEOGRAPHICAL INDICATIONS",
    "REGULATORY COMPLIANCE"
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalId = setInterval(() => {
      setHeroPhraseIndex((prevIndex) => (prevIndex + 1) % heroPhrases.length);
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

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
  // Session ID Management (Short-Term Conversation Context)
  const [sessionId, setSessionId] = useState(() => {
    let saved = localStorage.getItem('ipsakti_session_id');
    if (!saved) {
      saved = 'sess_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('ipsakti_session_id', saved);
    }
    return saved;
  });

  // Dynamic LLM Translation State
  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXTS);
  const [uiTranslating, setUiTranslating] = useState(false);

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

  // Dynamic LLM Translation Effect using IF Statements to check selected language
  useEffect(() => {
    if (!targetLanguage || targetLanguage.trim().toLowerCase() === 'english') {
      setUiTexts(DEFAULT_UI_TEXTS);
    } else {
      setUiTranslating(true);
      fetch('/api/translate_ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: DEFAULT_UI_TEXTS,
          target_language: targetLanguage
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.translated_texts) {
            setUiTexts(data.translated_texts);
          }
        })
        .catch(err => console.warn('Dynamic LLM UI translation warning:', err))
        .finally(() => setUiTranslating(false));
    }
  }, [targetLanguage]);

  const t = (key, fallback) => uiTexts[key] || fallback || DEFAULT_UI_TEXTS[key] || '';

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const payload = { question, jurisdiction, session_id: sessionId };
      if (targetLanguage) {
        payload.target_language = targetLanguage;
      }

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setQueryError('Request timed out. Please try asking again.');
      } else {
        setQueryError(err.message || 'Failed to connect to backend legal engine.');
      }
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

  // Helper for Genuine Backend Confidence Badge
  const getConfidenceBadge = (confidence) => {
    const normalized = (confidence || '').toString().trim().toUpperCase();
    switch (normalized) {
      case 'HIGH':
        return (
          <div className="confidence-indicator high" title="Evidence confidence based on retrieval strength, not probability of legal success">
            <div className="confidence-dot" aria-hidden="true"></div>
            <div className="confidence-text">
              <span className="conf-level font-bold">HIGH</span>
              <span className="conf-separator text-slate-400"> — </span>
              <span className="conf-desc">Strong authoritative evidence</span>
            </div>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="confidence-indicator medium" title="Evidence confidence based on retrieval strength, not probability of legal success">
            <div className="confidence-dot" aria-hidden="true"></div>
            <div className="confidence-text">
              <span className="conf-level font-bold">MEDIUM</span>
              <span className="conf-separator text-slate-400"> — </span>
              <span className="conf-desc">Partial/qualified evidence</span>
            </div>
          </div>
        );
      case 'LOW':
        return (
          <div className="confidence-indicator low" title="Evidence confidence based on retrieval strength, not probability of legal success">
            <div className="confidence-dot" aria-hidden="true"></div>
            <div className="confidence-text">
              <span className="conf-level font-bold">LOW</span>
              <span className="conf-separator text-slate-400"> — </span>
              <span className="conf-desc">Limited supporting evidence</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="confidence-indicator abstain" title="Evidence confidence based on retrieval strength">
            <div className="confidence-dot" aria-hidden="true"></div>
            <div className="confidence-text">
              <span className="conf-level font-bold">INSUFFICIENT EVIDENCE</span>
              <span className="conf-separator text-slate-400"> — </span>
              <span className="conf-desc">Insufficient evidence for assessment</span>
            </div>
          </div>
        );
    }
  };

  // Action Bar Handlers
  const handleStartNewAssessment = () => {
    setQueryResponse(null);
    setQuestion('');
    setQueryError('');
    setShowFullExplanation(false);
    setShowDetails(false);
    const newId = 'sess_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('ipsakti_session_id', newId);
    setSessionId(newId);
    const el = document.getElementById('ask-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyAnswer = () => {
    if (!queryResponse) return;
    let text = "Legal Assessment\n\n";
    if (queryResponse.structured_content) {
      if (queryResponse.structured_content.assessment) text += queryResponse.structured_content.assessment + "\n\n";
      if (queryResponse.structured_content.outcome) text += "Core Verdict\n" + queryResponse.structured_content.outcome + "\n\n";
      if (queryResponse.structured_content.legal_basis?.length) text += "Legal Basis\n" + queryResponse.structured_content.legal_basis.map(l=>"• "+l).join("\n") + "\n\n";
      if (queryResponse.structured_content.alternatives?.length) text += "Alternative IP Protection Routes\n" + queryResponse.structured_content.alternatives.map(l=>"• "+l).join("\n") + "\n\n";
      if (queryResponse.structured_content.next_action) text += "Recommended Next Steps\n" + queryResponse.structured_content.next_action + "\n\n";
    } else {
      text += queryResponse.answer;
    }
    navigator.clipboard.writeText(text.trim());
    alert("Answer copied to clipboard!");
  };

  const handleViewSources = () => {
    setShowDetails(true);
    setTimeout(() => {
      const el = document.getElementById('citations-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
          <span>{t('gov_banner', 'MINISTRY OF AYUSH • GOVERNMENT OF INDIA')}</span>
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
              <h1>{t('nav_brand_title', 'IP-SAKTI Sahayak')}</h1>
              <p>{t('nav_brand_sub', 'Ayurvedic Intellectual Property & Regulatory AI Assistant')}</p>
            </div>
          </a>

          <nav className="nav-links">
            <button
              className={`nav-link-btn ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => navigateTo('query')}
            >
              <Search className="w-4 h-4" /> {t('nav_ask', 'Ask IP-SAKTI')}
            </button>
            <button
              className={`nav-link-btn ${activeTab === 'classify' ? 'active' : ''}`}
              onClick={() => navigateTo('classify')}
            >
              <Tag className="w-4 h-4" /> {t('nav_classifier', 'Regulatory Classifier')}
            </button>
            <button
              className={`nav-link-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => navigateTo('how-it-works')}
            >
              <Layers className="w-4 h-4" /> {t('nav_how_it_works', 'How It Works')}
            </button>
            <div className="bhashini-header-pill">
              <Sparkles className="w-3.5 h-3.5" /> {t('nav_multilingual', 'Multilingual Support')}
            </div>
          </nav>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav-dropdown p-4 bg-slate-900/95 border-b border-slate-800 flex flex-col gap-2">
            <button
              className={`nav-link-btn text-left flex items-center gap-2 ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => navigateTo('query')}
            >
              <Search className="w-4 h-4" /> {t('nav_ask', 'Ask IP-SAKTI')}
            </button>
            <button
              className={`nav-link-btn text-left flex items-center gap-2 ${activeTab === 'classify' ? 'active' : ''}`}
              onClick={() => navigateTo('classify')}
            >
              <Tag className="w-4 h-4" /> {t('nav_classifier', 'Regulatory Classifier')}
            </button>
            <button
              className={`nav-link-btn text-left flex items-center gap-2 ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => navigateTo('how-it-works')}
            >
              <Layers className="w-4 h-4" /> {t('nav_how_it_works', 'How It Works')}
            </button>
          </div>
        )}
      </header>

      {/* VIEW CONDITIONAL: DEDICATED HOW IT WORKS PAGE VS MAIN WORKSPACE */}
      {activeTab === 'how-it-works' ? (
        <HowItWorks onBackToAsk={() => navigateTo('query')} />
      ) : (
        <>
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
                <BookOpen className="w-4 h-4" /> {t('hero_badge', 'AI Guidance for Traditional Knowledge & IP')}
              </div>

              <h1 className="hero-title">
                {t('hero_title_1', 'Protecting Wisdom.')} <br />
                {t('hero_title_2', 'Navigating')}&nbsp;
                <span className="hero-title-highlight">{t('hero_title_3', 'Ayurvedic IP Law.')}</span>
              </h1>

              <div className="hero-description" style={{ minHeight: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: 'var(--slate-300)' }}>Evidence-Based IP Information for</span>
                <span 
                  key={heroPhraseIndex}
                  className="animate-phrase-fade text-emerald-400 font-bold tracking-wide mt-2 text-center block"
                  style={{ maxWidth: '100%', lineHeight: '1.4' }}
                >
                  {heroPhrases[heroPhraseIndex]}
                </span>
              </div>

              <div className="hero-actions">
                <button
                  className="btn-hero-primary"
                  onClick={() => {
                    navigateTo('query');
                    const el = document.getElementById('ask-workspace');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('hero_btn_ask', 'Ask IP-SAKTI')} <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  className="btn-hero-secondary"
                  onClick={() => {
                    navigateTo('classify');
                    const el = document.getElementById('ask-workspace');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Tag className="w-4 h-4" /> {t('hero_btn_classify', 'Classify Formulation')}
                </button>
              </div>
            </div>
          </section>

          {/* MAIN WORKSPACE AREA */}
          <main className="workspace-container" id="ask-workspace">
            {/* Navigation Tabs Bar for Workspace (Removed Legal Corpus & Architecture) */}
            <div className="flex justify-center mb-8">
              <div className="workspace-tab-switcher">
                <button
                  className={`workspace-tab-btn ${activeTab === 'query' ? 'active' : ''}`}
                  onClick={() => navigateTo('query')}
                >
                  <Search className="w-4 h-4" /> {t('tab_ask_legal', 'Ask IP-SAKTI Legal Engine')}
                </button>
                <button
                  className={`workspace-tab-btn ${activeTab === 'classify' ? 'active' : ''}`}
                  onClick={() => navigateTo('classify')}
                >
                  <Tag className="w-4 h-4" /> {t('tab_classifier', 'Product Regulatory Classifier')}
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
                  <div className="control-label">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>{t('target_lang_label', 'Target Language:')}</span>
                  </div>
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
                  <div className="control-label">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('jurisdiction_label', 'Jurisdiction:')}</span>
                  </div>
                  <div className="jurisdiction-switch">
                    <button
                      type="button"
                      className={`jurisdiction-btn ${jurisdiction === 'India' ? 'active' : ''}`}
                      onClick={() => setJurisdiction('India')}
                    >
                      <Scale className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{t('india_law', 'India Law')}</span>
                    </button>
                    <button
                      type="button"
                      className={`jurisdiction-btn ${jurisdiction === 'International' ? 'active' : ''}`}
                      onClick={() => setJurisdiction('International')}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{t('international_law', 'International Law')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Input Textarea */}
              <form onSubmit={handleQuerySubmit} className="mt-6">
                <div className="input-wrapper">
                  <textarea
                    className="prompt-textarea"
                    placeholder={t('ask_input_placeholder', 'Ask IP-SAKTI about Ayurvedic patents, Traditional Knowledge protection, GI, trademarks, or Ayurveda regulations...')}
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
                        🎙 {isListening ? t('voice_listening', 'Listening...') : t('voice_input_btn', 'Voice Input')}
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
                            {t('analyzing_text', 'Analyzing Corpus...')}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {t('ask_btn', 'Ask IP-SAKTI')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Sample Prompts Chips */}
              <div className="sample-queries-container">
                <span className="sample-label">{t('sample_q_header', 'SAMPLE QUESTIONS (CLICK TO ASK):')}</span>
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

            {/* Loading Indicator */}
            {queryLoading && (
              <div className="card-glass loading-container border-emerald-500/20 bg-slate-900/60">
                <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
                  <Loader2 className="w-5 h-5 spinner" /> 
                  Analyzing your request
                </h3>
                <div className="loading-stages space-y-3 pl-2">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span>Searching authoritative legal evidence</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm opacity-70">
                    <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span>Verifying sources and preparing assessment</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Card */}
            {queryError && (
              <div className="card-glass error-container border-red-500/40 bg-red-950/40">
                <div className="flex items-center gap-2 font-bold text-red-400 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  AI Service Temporarily Unavailable
                </div>
                <p className="text-sm mt-2 text-red-200 leading-relaxed">
                  IP-SAKTI could not generate a complete assessment right now. Please try again shortly.
                </p>
                <button className="btn-hero-secondary mt-5 py-2 px-5 text-sm" onClick={() => handleQuerySubmit()}>
                  Try Again
                </button>
              </div>
            )}

            {/* RESPONSE CARD DISPLAY */}
            {queryResponse && (
              <div className="card-glass response-container">
                <div className="response-header-bar">
                  <div className="response-title">
                    <Scale className="w-5 h-5 text-emerald-400" />
                    <span>IP Legal Information & Statutory Assessment</span>
                  </div>

                  <div className="flex items-center gap-3">
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

                {/* Structured Output UI Renderer */}
                {queryResponse.status === "CLARIFY" ? (
                  <div className="clarify-container p-6 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-100 mt-6">
                    <div className="flex items-center gap-3 font-bold text-amber-400 text-lg mb-3">
                      <HelpCircle className="w-6 h-6" />
                      Clarification Needed
                    </div>
                    <div className="clarify-body space-y-2 text-[15px] leading-relaxed">
                      <p>I need one more detail before I can provide a reliable assessment.</p>
                      <p className="font-semibold text-amber-200">{queryResponse.answer}</p>
                    </div>
                    <button className="mt-5 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 font-semibold rounded-lg transition-colors" onClick={() => document.querySelector('.prompt-textarea')?.focus()}>
                      Continue Assessment
                    </button>
                  </div>
                ) : (
                  <div className="structured-content-container space-y-6 my-6">
                    {/* Follow-up Context Indicator */}
                    {queryResponse.debug_info?.is_follow_up && (
                      <div className="follow-up-context flex items-center gap-2 text-xs font-semibold text-emerald-400/80 mb-2 px-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>↳ Continuing assessment for: <strong className="text-emerald-300">{queryResponse.debug_info.product || 'Query'}</strong> | Jurisdiction: {queryResponse.debug_info.resolved_jurisdiction || jurisdiction}</span>
                      </div>
                    )}

                    {/* PRIMARY ANSWER & VERDICT CARD (First thing the user sees) */}
                    {(() => {
                      const { verdict, summary } = getVerdictAndSummary(queryResponse);
                      const domainName = INTENT_MAP[queryResponse.debug_info?.intent || queryResponse.structured_content?.ip_domain] || 'IP & Regulatory';
                      const jurName = queryResponse.debug_info?.resolved_jurisdiction || queryResponse.structured_content?.jurisdiction || jurisdiction;

                      return (
                        <div className="assessment-hero-card p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>

                          {/* Domain / Jurisdiction Eyebrow */}
                          <div className="result-header-eyebrow">
                            <span className="result-eyebrow-tag">
                              {domainName} • {jurName}
                            </span>
                          </div>

                          {/* Primary Verdict Headline */}
                          {verdict && (
                            <h2 className="result-verdict-title">
                              {verdict.replace(/\*\*/g, '').replace(/#{1,6}\s*/g, '').trim()}
                            </h2>
                          )}

                          {/* Concise 1-3 sentence summary */}
                          {summary && (
                            <div className="result-short-summary legal-result">
                              {renderStructuredText(summary)}
                            </div>
                          )}

                          {/* View in Details Toggle Button */}
                          <div className="mt-4">
                            <button
                              type="button"
                              className="btn-view-details"
                              onClick={() => setShowDetails(!showDetails)}
                            >
                              <span>{showDetails ? 'Hide Details' : 'View in Details'}</span>
                              {showDetails ? (
                                <ChevronUp className="w-4 h-4 ml-1.5 inline shrink-0" aria-hidden="true" focusable="false" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1.5 inline shrink-0" aria-hidden="true" focusable="false" />
                              )}
                            </button>
                          </div>

                          {/* Progressive Disclosure: Details View (collapsed by default) */}
                          {showDetails && (
                            <div className="result-details-wrapper">
                              {/* 1. Evidence Confidence (Inside Details) */}
                              <div className="details-confidence-box">
                                <div className="details-conf-left">
                                  <span className="details-conf-label">Evidence Confidence:</span>
                                  {getConfidenceBadge(queryResponse.evidence_confidence || queryResponse.structured_content?.evidence_confidence || queryResponse.confidence || queryResponse.structured_content?.confidence)}
                                </div>
                                <div className="details-conf-note">
                                  Evidence confidence describes the strength of the supporting information — it is not a prediction of whether an application will be approved.
                                </div>
                              </div>

                              {/* 2. Why This Applies / Detailed Assessment */}
                              {queryResponse.structured_content?.assessment && queryResponse.structured_content.assessment !== summary && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <Scale className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Why This Applies</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    {renderStructuredText(queryResponse.structured_content.assessment)}
                                  </div>
                                </div>
                              )}

                              {/* 3. Legal Basis & Statutory Authority */}
                              {hasValidContent(queryResponse.structured_content?.legal_basis) && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Legal / Regulatory Basis</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    <ul className="detail-bullet-list">
                                      {queryResponse.structured_content.legal_basis.map((item, idx) => (
                                        <li key={idx} className="detail-bullet-item">{renderStructuredText(item)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* 4. Supporting Evidence (TKDL / Documentation) */}
                              {hasValidContent(queryResponse.structured_content?.supporting_evidence) && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Supporting Evidence</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    <ul className="detail-bullet-list">
                                      {queryResponse.structured_content.supporting_evidence.map((item, idx) => (
                                        <li key={idx} className="detail-bullet-item">{renderStructuredText(item)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* 5. Conditions & Exceptions (only if present and non-empty) */}
                              {hasValidContent(queryResponse.structured_content?.conditions_or_exceptions) && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Conditions & Exceptions</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    {renderStructuredText(queryResponse.structured_content.conditions_or_exceptions)}
                                  </div>
                                </div>
                              )}

                              {/* 6. Alternative IP Protection Routes (only if present and relevant) */}
                              {hasValidContent(queryResponse.structured_content?.alternative_routes) && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Alternative Routes</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    <ul className="detail-bullet-list">
                                      {queryResponse.structured_content.alternative_routes.map((item, idx) => (
                                        <li key={idx} className="detail-bullet-item">{renderStructuredText(item)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* 7. Recommended Next Steps */}
                              {(hasValidContent(queryResponse.structured_content?.recommended_next_steps) || hasValidContent(queryResponse.structured_content?.next_action)) && (
                                <div className="detail-section-card">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Next Steps</span>
                                  </div>
                                  <div className="detail-section-body legal-result">
                                    {hasValidContent(queryResponse.structured_content?.recommended_next_steps) ? (
                                      <ul className="detail-bullet-list">
                                        {queryResponse.structured_content.recommended_next_steps.map((step, idx) => (
                                          <li key={idx} className="detail-bullet-item">{renderStructuredText(step)}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      renderStructuredText(queryResponse.structured_content?.next_action)
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 8. Verified Sources & Citations */}
                              {queryResponse.citations && queryResponse.citations.length > 0 && (
                                <div className="detail-section-card" id="citations-grid">
                                  <div className="detail-section-title" role="heading" aria-level={3}>
                                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" focusable="false" />
                                    <span>Verified Sources & Citations — links to the relevant official source/document</span>
                                  </div>
                                  <div className="flex flex-col gap-3 mt-3">
                                    {queryResponse.citations.map((cit, idx) => {
                                      let badge = '';
                                      if (cit.jurisdiction) badge = cit.jurisdiction;
                                      else if (cit.source_name?.includes('India')) badge = 'India';
                                      else if (cit.source_name?.includes('WIPO') || cit.source_name?.includes('TRIPS')) badge = 'International';

                                      const citeUrl = getVerifiedUrl(cit.url, cit.source_name);

                                      return (
                                        <div key={idx} className="citation-card-new p-4 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:border-emerald-500/40 transition-colors">
                                          <div className="cit-header flex items-start justify-between gap-4 mb-2">
                                            <div className="flex items-start gap-2.5">
                                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
                                              <div>
                                                <div className="citation-title font-bold text-slate-200 text-[15px]">{cit.source_name}</div>
                                                {cit.section && <div className="citation-section text-sm text-slate-400 font-medium">{cit.section}</div>}
                                              </div>
                                            </div>
                                            {badge && (
                                              <span className="cit-badge px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700/50 text-slate-300 shrink-0">
                                                {badge}
                                              </span>
                                            )}
                                          </div>

                                          {cit.explanation && (
                                            <div className="cit-relevance ml-7.5 mt-3 pt-3 border-t border-slate-700/50 legal-result">
                                              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Relevance</span>
                                              <div className="text-sm text-slate-300 leading-relaxed italic">{renderStructuredText(cit.explanation)}</div>
                                            </div>
                                          )}

                                          {citeUrl && (
                                            <div className="cit-action ml-7.5 mt-3">
                                              <a
                                                href={citeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cit-view-link inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
                                              >
                                                [ View Source <ExternalLink className="w-3 h-3 shrink-0 ml-1 inline" aria-hidden="true" focusable="false" /> ]
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Answer Action Bar */}
                {queryResponse.status !== "CLARIFY" && (
                  <div className="answer-action-bar flex flex-wrap items-center gap-3 mt-8 pt-5 border-t border-slate-700/60">
                    <button className="action-btn-styled" onClick={handleCopyAnswer}>
                      <FileText className="w-4 h-4 shrink-0 mr-1.5 inline" aria-hidden="true" focusable="false" /><span>Copy Answer</span>
                    </button>
                    {queryResponse.citations && queryResponse.citations.length > 0 && (
                      <button className="action-btn-styled" onClick={handleViewSources}>
                        <BookOpen className="w-4 h-4 shrink-0 mr-1.5 inline" aria-hidden="true" focusable="false" /><span>View Sources</span>
                      </button>
                    )}
                    <button className="action-btn-styled follow-up" onClick={() => document.querySelector('.prompt-textarea')?.focus()}>
                      <ArrowRight className="w-4 h-4 shrink-0 mr-1.5 inline" aria-hidden="true" focusable="false" /><span>Ask Follow-up</span>
                    </button>
                    <button className="action-btn-styled start-new" onClick={handleStartNewAssessment}>
                      <Search className="w-4 h-4 shrink-0 mr-1.5 inline" aria-hidden="true" focusable="false" /><span>Start New Assessment</span>
                    </button>
                  </div>
                )}

                {/* Footer Strip with Escalation Button */}
                <div className="response-footer-strip">
                  <div className="legal-disclaimer">
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>IP-SAKTI provides information and evidence-grounded guidance for research and decision support. It is not legal advice.</span>
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

      </main>
    </>
  )}

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
