'use client';

import { useState, useMemo } from 'react';
import { GraduationCap, Calculator, BookOpen, Search, Star, ExternalLink, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';

/* ─────────────────── Types ─────────────────── */
interface Subject {
  name: string;
  percentage: number | '';
}

interface Course {
  id: string;
  name: string;
  institution: string;
  faculty: string;
  minimumAPS: number;
  qualification: 'bachelor' | 'diploma' | 'higher-certificate' | 'certificate';
  requiredSubjects: string[];
  applyLink: string;
  duration: string;
  fieldOfStudy: string;
  description: string;
}

/* ─────────────────── APS Calculation ─────────────────── */
function percentageToLevel(pct: number): number {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  return 1;
}

function getQualificationLevel(aps: number): { label: string; color: string; description: string } {
  if (aps >= 30) return { label: 'Bachelor Degree', color: 'text-green-600', description: 'Eligible for Bachelor Degree programmes at universities' };
  if (aps >= 23) return { label: 'Bachelor Degree (Standard)', color: 'text-blue-600', description: 'Eligible for most Bachelor programmes' };
  if (aps >= 19) return { label: 'Diploma Entry', color: 'text-yellow-600', description: 'Eligible for Diploma programmes at universities of technology' };
  if (aps >= 15) return { label: 'Higher Certificate', color: 'text-orange-600', description: 'Eligible for Higher Certificate programmes' };
  return { label: 'Certificate Level', color: 'text-red-600', description: 'Consider bridging courses to improve your APS' };
}

/* ─────────────────── SA Subject List ─────────────────── */
const SA_SUBJECTS = [
  'English Home Language',
  'English First Additional Language',
  'Afrikaans Home Language',
  'Afrikaans First Additional Language',
  'isiZulu Home Language',
  'isiXhosa Home Language',
  'Sesotho Home Language',
  'Mathematics',
  'Mathematical Literacy',
  'Technical Mathematics',
  'Physical Sciences',
  'Life Sciences',
  'Geography',
  'History',
  'Accounting',
  'Business Studies',
  'Economics',
  'Computer Application Technology',
  'Information Technology',
  'Life Orientation',
  'Visual Arts',
  'Music',
  'Dramatic Arts',
  'Tourism',
  'Agricultural Sciences',
  'Civil Technology',
  'Electrical Technology',
  'Mechanical Technology',
  'Engineering Graphics & Design',
  'Consumer Studies',
  'Hospitality Studies',
];

/* ─────────────────── Course Database ─────────────────── */
const COURSES: Course[] = [
  // Engineering
  { id: '1', name: 'BSc Civil Engineering', institution: 'University of Pretoria', faculty: 'Engineering, Built Environment & IT', minimumAPS: 32, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.up.ac.za', duration: '4 years', fieldOfStudy: 'Engineering', description: 'Design and construct infrastructure like roads, bridges, and buildings.' },
  { id: '2', name: 'BSc Electrical Engineering', institution: 'University of the Witwatersrand', faculty: 'Engineering & the Built Environment', minimumAPS: 34, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.wits.ac.za', duration: '4 years', fieldOfStudy: 'Engineering', description: 'Specialize in power systems, electronics, and telecommunications.' },
  { id: '3', name: 'BSc Mechanical Engineering', institution: 'Stellenbosch University', faculty: 'Engineering', minimumAPS: 32, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.sun.ac.za', duration: '4 years', fieldOfStudy: 'Engineering', description: 'Design and manufacture mechanical systems and devices.' },
  { id: '4', name: 'National Diploma: Electrical Engineering', institution: 'Tshwane University of Technology', faculty: 'Engineering & the Built Environment', minimumAPS: 19, qualification: 'diploma', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.tut.ac.za', duration: '3 years', fieldOfStudy: 'Engineering', description: 'Practical electrical engineering skills for industry.' },
  { id: '5', name: 'BTech: Mechanical Engineering', institution: 'Cape Peninsula University of Technology', faculty: 'Engineering', minimumAPS: 22, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.cput.ac.za', duration: '1 year (after Diploma)', fieldOfStudy: 'Engineering', description: 'Advanced mechanical engineering study following a Diploma.' },

  // Health Sciences
  { id: '6', name: 'MBChB (Medicine & Surgery)', institution: 'University of Cape Town', faculty: 'Health Sciences', minimumAPS: 42, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'], applyLink: 'https://www.uct.ac.za', duration: '6 years', fieldOfStudy: 'Health Sciences', description: 'Become a qualified medical doctor. Includes clinical training.' },
  { id: '7', name: 'BSc Nursing', institution: 'University of KwaZulu-Natal', faculty: 'Health Sciences', minimumAPS: 28, qualification: 'bachelor', requiredSubjects: ['Life Sciences', 'Mathematics'], applyLink: 'https://www.ukzn.ac.za', duration: '4 years', fieldOfStudy: 'Health Sciences', description: 'Comprehensive nursing training for hospital and community care.' },
  { id: '8', name: 'BSc Pharmacy', institution: 'University of Limpopo', faculty: 'Health Sciences', minimumAPS: 30, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'], applyLink: 'https://www.ul.ac.za', duration: '4 years', fieldOfStudy: 'Health Sciences', description: 'Prepare and dispense medications and advise on their use.' },
  { id: '9', name: 'Diploma: Emergency Medical Care', institution: 'Cape Peninsula University of Technology', faculty: 'Health & Wellness Sciences', minimumAPS: 20, qualification: 'diploma', requiredSubjects: ['Life Sciences', 'Mathematics'], applyLink: 'https://www.cput.ac.za', duration: '3 years', fieldOfStudy: 'Health Sciences', description: 'Pre-hospital emergency medical care and paramedic training.' },
  { id: '10', name: 'BSc Physiotherapy', institution: 'University of the Free State', faculty: 'Health Sciences', minimumAPS: 30, qualification: 'bachelor', requiredSubjects: ['Life Sciences', 'Physical Sciences'], applyLink: 'https://www.ufs.ac.za', duration: '4 years', fieldOfStudy: 'Health Sciences', description: 'Rehabilitate patients using physical therapy techniques.' },

  // Business & Commerce
  { id: '11', name: 'BCom Accounting', institution: 'University of Johannesburg', faculty: 'Accounting & Informatics', minimumAPS: 26, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Accounting'], applyLink: 'https://www.uj.ac.za', duration: '3 years', fieldOfStudy: 'Business & Commerce', description: 'Foundation for a career as a Chartered Accountant.' },
  { id: '12', name: 'BCom Business Management', institution: 'North-West University', faculty: 'Business School', minimumAPS: 24, qualification: 'bachelor', requiredSubjects: ['Mathematics'], applyLink: 'https://www.nwu.ac.za', duration: '3 years', fieldOfStudy: 'Business & Commerce', description: 'Manage and grow businesses effectively.' },
  { id: '13', name: 'Diploma: Financial Management', institution: 'Vaal University of Technology', faculty: 'Management Sciences', minimumAPS: 18, qualification: 'diploma', requiredSubjects: ['Mathematics', 'Accounting'], applyLink: 'https://www.vut.ac.za', duration: '3 years', fieldOfStudy: 'Business & Commerce', description: 'Practical financial management skills for industry.' },
  { id: '14', name: 'Higher Certificate: Business Administration', institution: 'Damelin', faculty: 'Business', minimumAPS: 15, qualification: 'higher-certificate', requiredSubjects: [], applyLink: 'https://www.damelin.co.za', duration: '1 year', fieldOfStudy: 'Business & Commerce', description: 'Entry-level business administration qualification.' },
  { id: '15', name: 'BBusSci Finance', institution: 'University of Cape Town', faculty: 'Commerce', minimumAPS: 36, qualification: 'bachelor', requiredSubjects: ['Mathematics'], applyLink: 'https://www.uct.ac.za', duration: '4 years', fieldOfStudy: 'Business & Commerce', description: 'Quantitative finance, economics, and investment analysis.' },

  // IT & Computer Science
  { id: '16', name: 'BSc Computer Science', institution: 'University of Pretoria', faculty: 'Natural & Agricultural Sciences', minimumAPS: 30, qualification: 'bachelor', requiredSubjects: ['Mathematics'], applyLink: 'https://www.up.ac.za', duration: '3 years', fieldOfStudy: 'Information Technology', description: 'Algorithms, software development, and AI fundamentals.' },
  { id: '17', name: 'BSc Information Technology', institution: 'University of the Witwatersrand', faculty: 'Science', minimumAPS: 28, qualification: 'bachelor', requiredSubjects: ['Mathematics'], applyLink: 'https://www.wits.ac.za', duration: '3 years', fieldOfStudy: 'Information Technology', description: 'Networks, databases, cyber security, and software.' },
  { id: '18', name: 'Diploma: ICT in Systems Development', institution: 'Tshwane University of Technology', faculty: 'ICT', minimumAPS: 18, qualification: 'diploma', requiredSubjects: ['Mathematics'], applyLink: 'https://www.tut.ac.za', duration: '3 years', fieldOfStudy: 'Information Technology', description: 'Build software systems and applications hands-on.' },
  { id: '19', name: 'Higher Certificate: IT Support', institution: 'MANCOSA', faculty: 'IT', minimumAPS: 14, qualification: 'higher-certificate', requiredSubjects: [], applyLink: 'https://www.mancosa.co.za', duration: '1 year', fieldOfStudy: 'Information Technology', description: 'Foundational IT support and helpdesk skills.' },
  { id: '20', name: 'BSc Data Science & AI', institution: 'Stellenbosch University', faculty: 'Science', minimumAPS: 32, qualification: 'bachelor', requiredSubjects: ['Mathematics'], applyLink: 'https://www.sun.ac.za', duration: '3 years', fieldOfStudy: 'Information Technology', description: 'Machine learning, big data analytics, and AI systems.' },

  // Law
  { id: '21', name: 'LLB Law', institution: 'University of Pretoria', faculty: 'Law', minimumAPS: 30, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.up.ac.za', duration: '4 years', fieldOfStudy: 'Law', description: 'Qualification to practice law in South Africa.' },
  { id: '22', name: 'LLB Law', institution: 'University of Cape Town', faculty: 'Law', minimumAPS: 36, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.uct.ac.za', duration: '4 years', fieldOfStudy: 'Law', description: 'World-class legal training with international recognition.' },
  { id: '23', name: 'Higher Certificate: Paralegal Studies', institution: 'Boston City Campus', faculty: 'Legal', minimumAPS: 14, qualification: 'higher-certificate', requiredSubjects: [], applyLink: 'https://www.boston.co.za', duration: '1 year', fieldOfStudy: 'Law', description: 'Support legal practitioners and understand basic law.' },

  // Education
  { id: '24', name: 'BEd Foundation Phase', institution: 'UNISA', faculty: 'Education', minimumAPS: 23, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.unisa.ac.za', duration: '4 years (distance)', fieldOfStudy: 'Education', description: 'Teach Grades R-3 at primary schools.' },
  { id: '25', name: 'BEd Senior Phase & FET', institution: 'University of Johannesburg', faculty: 'Education', minimumAPS: 24, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.uj.ac.za', duration: '4 years', fieldOfStudy: 'Education', description: 'Teach Grades 7-12 with two subject specializations.' },
  { id: '26', name: 'PGCE (Postgraduate Certificate in Education)', institution: 'Stellenbosch University', faculty: 'Education', minimumAPS: 23, qualification: 'certificate', requiredSubjects: [], applyLink: 'https://www.sun.ac.za', duration: '1 year', fieldOfStudy: 'Education', description: 'Qualified graduates who want to become teachers.' },

  // Social Sciences
  { id: '27', name: 'BA Psychology', institution: 'University of the Western Cape', faculty: 'Community & Health Sciences', minimumAPS: 25, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.uwc.ac.za', duration: '3 years', fieldOfStudy: 'Social Sciences', description: 'Understand human behaviour, mental health, and counselling.' },
  { id: '28', name: 'BA Social Work', institution: 'University of KwaZulu-Natal', faculty: 'Humanities, Development & Social Sciences', minimumAPS: 23, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.ukzn.ac.za', duration: '4 years', fieldOfStudy: 'Social Sciences', description: 'Support vulnerable communities and individuals.' },
  { id: '29', name: 'BA Journalism', institution: 'University of Johannesburg', faculty: 'Humanities', minimumAPS: 26, qualification: 'bachelor', requiredSubjects: [], applyLink: 'https://www.uj.ac.za', duration: '3 years', fieldOfStudy: 'Social Sciences', description: 'Investigative reporting, media production, and communication.' },

  // Built Environment
  { id: '30', name: 'BSc Architecture', institution: 'University of Cape Town', faculty: 'Engineering & the Built Environment', minimumAPS: 36, qualification: 'bachelor', requiredSubjects: ['Mathematics', 'Physical Sciences'], applyLink: 'https://www.uct.ac.za', duration: '3 years (then 2-yr MArch)', fieldOfStudy: 'Built Environment', description: 'Design sustainable buildings and urban spaces.' },
  { id: '31', name: 'Diploma: Quantity Surveying', institution: 'Nelson Mandela University', faculty: 'Built Environment', minimumAPS: 22, qualification: 'diploma', requiredSubjects: ['Mathematics'], applyLink: 'https://www.mandela.ac.za', duration: '3 years', fieldOfStudy: 'Built Environment', description: 'Cost management and procurement for construction projects.' },
];

const FIELDS_OF_STUDY = ['All Fields', 'Engineering', 'Health Sciences', 'Business & Commerce', 'Information Technology', 'Law', 'Education', 'Social Sciences', 'Built Environment'];

const BLANK_SUBJECTS: Subject[] = [
  { name: 'Mathematics', percentage: '' },
  { name: 'English Home Language', percentage: '' },
  { name: 'Life Orientation', percentage: '' },
  { name: '', percentage: '' },
  { name: '', percentage: '' },
  { name: '', percentage: '' },
  { name: '', percentage: '' },
];

/* ─────────────────── Component ─────────────────── */
export default function StudentsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(BLANK_SUBJECTS);
  const [selectedField, setSelectedField] = useState('All Fields');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [savedAPS, setSavedAPS] = useState<number | null>(() => {
    try { return JSON.parse(localStorage.getItem('studentAPS') || 'null'); } catch { return null; }
  });

  /* ── APS Calculation ── */
  const aps = useMemo(() => {
    const completedSubjects = subjects.filter(s => s.percentage !== '' && s.name !== '');
    if (completedSubjects.length === 0) return null;
    
    // Cap Life Orientation at 4 (NSC APS rule)
    const scores = completedSubjects.map(s => {
      const level = percentageToLevel(s.percentage as number);
      return s.name.toLowerCase().includes('life orientation') ? Math.min(level, 4) : level;
    });
    
    return scores.reduce((sum, pts) => sum + pts, 0);
  }, [subjects]);

  const qualification = aps !== null ? getQualificationLevel(aps) : null;

  /* ── Course Matching ── */
  const filteredCourses = useMemo(() => {
    let courses = COURSES;

    // Filter by field
    if (selectedField !== 'All Fields') {
      courses = courses.filter(c => c.fieldOfStudy === selectedField);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.institution.toLowerCase().includes(q) ||
        c.fieldOfStudy.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    // Filter by eligibility
    if (showOnlyEligible && aps !== null) {
      courses = courses.filter(c => aps >= c.minimumAPS);
    }

    return courses.sort((a, b) => {
      if (aps !== null) {
        // Sort by closeness to eligibility - met first, then by margin
        const aMet = aps >= a.minimumAPS;
        const bMet = aps >= b.minimumAPS;
        if (aMet && !bMet) return -1;
        if (!aMet && bMet) return 1;
      }
      return a.minimumAPS - b.minimumAPS;
    });
  }, [selectedField, searchQuery, showOnlyEligible, aps]);

  const updateSubject = (index: number, field: 'name' | 'percentage', value: string) => {
    const updated = [...subjects];
    if (field === 'percentage') {
      const num = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value) || 0));
      updated[index] = { ...updated[index], percentage: num };
    } else {
      updated[index] = { ...updated[index], name: value };
    }
    setSubjects(updated);
  };

  const handleSaveAPS = () => {
    if (aps !== null) {
      localStorage.setItem('studentAPS', JSON.stringify(aps));
      setSavedAPS(aps);
    }
  };

  const handleReset = () => {
    setSubjects(BLANK_SUBJECTS);
    setSavedAPS(null);
    localStorage.removeItem('studentAPS');
  };

  const meetsMathsRequirement = (course: Course) => {
    if (!course.requiredSubjects.includes('Mathematics')) return true;
    const mathEntry = subjects.find(s => s.name === 'Mathematics');
    if (!mathEntry || mathEntry.percentage === '') return null; // unknown
    return (mathEntry.percentage as number) >= 50;
  };

  const meetsAllRequirements = (course: Course) => {
    if (aps === null) return null;
    const apsOk = aps >= course.minimumAPS;
    return apsOk;
  };

  /* ─────────────────── Render ─────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Academic Engine</h1>
              <p className="text-white/80">South Africa 🇿🇦 — APS Calculator & Course Eligibility</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">{aps ?? (savedAPS ?? '—')}</p>
              <p className="text-xs text-white/80">Your APS</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">{COURSES.length}+</p>
              <p className="text-xs text-white/80">Courses</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">{aps !== null ? filteredCourses.filter(c => aps >= c.minimumAPS).length : '?'}</p>
              <p className="text-xs text-white/80">You Qualify</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">26</p>
              <p className="text-xs text-white/80">SA Universities</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

          {/* APS Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">NSC APS Calculator</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your subject percentages</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <select
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    title={`Subject ${index + 1}`}
                  >
                    <option value="">— Choose subject —</option>
                    {SA_SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.percentage}
                      onChange={(e) => updateSubject(index, 'percentage', e.target.value)}
                      placeholder="%"
                      className="w-16 px-2 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {subject.name && subject.percentage !== '' && (
                      <span className="w-6 text-center text-xs font-bold text-indigo-600">
                        L{percentageToLevel(subject.percentage as number)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              💡 Life Orientation is capped at Level 4 (max 4 points) per NSC APS rules.
            </p>

            {/* APS Result */}
            {aps !== null && (
              <div className={`rounded-xl p-4 mb-4 ${
                aps >= 30 ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400' :
                aps >= 23 ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400' :
                aps >= 19 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400' :
                'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your APS Score</span>
                  <span className={`text-4xl font-black ${qualification?.color}`}>{aps}</span>
                </div>
                <p className={`text-lg font-bold ${qualification?.color}`}>{qualification?.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{qualification?.description}</p>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {[7,8,9,10,12,15,20,25,30,35,40,42].map(milestone => (
                    <div key={milestone} className={`h-1.5 rounded-full ${aps >= milestone ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveAPS}
                disabled={aps === null}
                className="flex-1 py-2.5 bg-indigo-600 disabled:bg-gray-300 text-white disabled:text-gray-500 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
              >
                💾 Save APS to Profile
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Legend & Tips */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                APS Level Guide
              </h3>
              <div className="space-y-2">
                {[
                  { range: '80–100%', level: 7, pts: 7, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
                  { range: '70–79%', level: 6, pts: 6, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
                  { range: '60–69%', level: 5, pts: 5, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
                  { range: '50–59%', level: 4, pts: 4, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
                  { range: '40–49%', level: 3, pts: 3, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
                  { range: '30–39%', level: 2, pts: 2, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
                  { range: '0–29%', level: 1, pts: 1, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
                ].map(row => (
                  <div key={row.level} className={`flex items-center justify-between rounded-lg px-3 py-2 ${row.color}`}>
                    <span className="text-sm font-medium">{row.range}</span>
                    <span className="text-sm">Level {row.level}</span>
                    <span className="text-sm font-bold">{row.pts} points</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🎯 Entry Thresholds</h3>
              <div className="space-y-2 text-sm">
                {[
                  { aps: '30+', label: "Bachelor's Degree (competitive)", color: 'text-green-600' },
                  { aps: '23–29', label: "Bachelor's Degree (standard)", color: 'text-blue-600' },
                  { aps: '19–22', label: 'Diploma (university of technology)', color: 'text-yellow-600' },
                  { aps: '15–18', label: 'Higher Certificate', color: 'text-orange-600' },
                  { aps: '< 15', label: 'Bridging / foundational studies', color: 'text-red-600' },
                ].map(row => (
                  <div key={row.aps} className="flex items-center gap-3">
                    <span className={`font-bold text-base w-14 ${row.color}`}>{row.aps}</span>
                    <span className="text-gray-700 dark:text-gray-300">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Suggestor */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Suggestor</h2>
                <p className="text-sm text-gray-500">
                  {aps !== null
                    ? `${filteredCourses.filter(c => aps >= c.minimumAPS).length} of ${filteredCourses.length} courses match your APS of ${aps}`
                    : `${COURSES.length} courses across SA universities`}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={() => setShowOnlyEligible(!showOnlyEligible)}
                disabled={aps === null}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50 ${showOnlyEligible ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                title="Show only eligible courses"
              >
                <span className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${showOnlyEligible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">I qualify only</span>
            </label>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, universities..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                title="Filter by field of study"
              >
                {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Course Cards */}
          <div className="space-y-3">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No courses match your filters.</p>
                <button onClick={() => { setSearchQuery(''); setSelectedField('All Fields'); setShowOnlyEligible(false); }} className="mt-3 text-sm text-purple-600 hover:underline">Clear filters</button>
              </div>
            ) : filteredCourses.map(course => {
              const eligible = aps !== null ? aps >= course.minimumAPS : null;
              const gap = aps !== null ? course.minimumAPS - aps : null;
              const isExpanded = expandedCourse === course.id;

              return (
                <div
                  key={course.id}
                  className={`rounded-xl border-2 transition-all ${
                    eligible === true ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' :
                    eligible === false ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50' :
                    'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50'
                  }`}
                >
                  <button
                    className="w-full text-left p-4"
                    onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                    title={`View details for ${course.name}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {eligible === true ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : eligible === false ? (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{course.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{course.institution}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              eligible === true ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              eligible === false ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                            }`}>
                              APS {course.minimumAPS}+
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              course.qualification === 'bachelor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                              course.qualification === 'diploma' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                            }`}>
                              {course.qualification === 'bachelor' ? "Bachelor's" : course.qualification === 'diploma' ? 'Diploma' : 'Certificate'}
                            </span>
                          </div>
                        </div>
                        {eligible === false && gap !== null && gap > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            ⚡ You need {gap} more APS point{gap > 1 ? 's' : ''} to qualify
                          </p>
                        )}
                        {eligible === true && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✅ You meet the APS requirement
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-600 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{course.description}</p>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400 w-24">Faculty:</span><span className="text-gray-700 dark:text-gray-300">{course.faculty}</span></div>
                            <div className="flex gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400 w-24">Duration:</span><span className="text-gray-700 dark:text-gray-300">{course.duration}</span></div>
                            <div className="flex gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400 w-24">Min APS:</span><span className="text-gray-700 dark:text-gray-300">{course.minimumAPS}</span></div>
                            <div className="flex gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400 w-24">Field:</span><span className="text-gray-700 dark:text-gray-300">{course.fieldOfStudy}</span></div>
                          </div>
                        </div>
                        <div>
                          {course.requiredSubjects.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Required Subjects:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {course.requiredSubjects.map(subj => {
                                  const studentHas = subjects.some(s => s.name === subj && s.percentage !== '' && (s.percentage as number) >= 50);
                                  return (
                                    <span key={subj} className={`px-2 py-1 rounded-full text-xs font-semibold ${studentHas ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                      {studentHas ? '✓ ' : '✗ '}{subj}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <a
                            href={course.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                          >
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
