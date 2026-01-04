import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import codingService from '../../services/codingService';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  Play,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Code,
  CheckCircle,
  XCircle,
  Loader,
  Terminal,
  FileCode,
  CheckSquare
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { id: 50, name: 'C', monaco: 'c', template: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  { id: 54, name: 'C++', monaco: 'cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  { id: 62, name: 'Java', monaco: 'java', template: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
  { id: 71, name: 'Python', monaco: 'python', template: '# Your code here\n' },
  { id: 63, name: 'JavaScript', monaco: 'javascript', template: '// Your code here\n' },
  { id: 60, name: 'Go', monaco: 'go', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}' },
  { id: 73, name: 'Rust', monaco: 'rust', template: 'fn main() {\n    // Your code here\n}' }
];

const CodingSection = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[3]); // Python default
  const [code, setCode] = useState(LANGUAGE_OPTIONS[3].template);
  const [codeByProblem, setCodeByProblem] = useState({}); // Store code per problem
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description, submissions
  const [submissions, setSubmissions] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [contestInfo, setContestInfo] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [contestId]);

  useEffect(() => {
    if (problems.length > 0) {
      fetchSubmissions(problems[currentProblem]._id);
    }
  }, [currentProblem, problems]);

  // Save and restore code, customInput, and output when switching problems (with localStorage)
  useEffect(() => {
    if (problems.length > 0) {
      const problemId = problems[currentProblem]?._id;
      if (problemId) {
        // Restore code
        const codeKey = `code_${contestId}_${problemId}`;
        const savedCode = localStorage.getItem(codeKey) || codeByProblem[problemId];
        if (savedCode !== undefined && savedCode !== null) {
          setCode(savedCode);
        } else {
          setCode(selectedLanguage.template);
        }

        // Restore customInput
        const inputKey = `input_${contestId}_${problemId}`;
        const savedInput = localStorage.getItem(inputKey);
        setCustomInput(savedInput || '');

        // Restore output
        const outputKey = `output_${contestId}_${problemId}`;
        const savedOutput = localStorage.getItem(outputKey);
        setOutput(savedOutput || '');
      }
      setTestResults(null);
    }
  }, [currentProblem, problems]);

  // Save code, customInput, and output to localStorage whenever they change
  useEffect(() => {
    if (problems.length > 0 && problems[currentProblem]) {
      const problemId = problems[currentProblem]._id;

      // Save code
      const codeKey = `code_${contestId}_${problemId}`;
      setCodeByProblem(prev => ({ ...prev, [problemId]: code }));
      localStorage.setItem(codeKey, code);

      // Save customInput
      const inputKey = `input_${contestId}_${problemId}`;
      localStorage.setItem(inputKey, customInput);

      // Save output
      const outputKey = `output_${contestId}_${problemId}`;
      localStorage.setItem(outputKey, output);
    }
  }, [code, customInput, output, currentProblem, problems, contestId]);

  // Timer countdown with auto-submit
  useEffect(() => {
    if (timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit all problems when time runs out
          toast.error('Time is up! Auto-submitting...');
          handleAutoSubmit();
          localStorage.removeItem(`timer_${contestId}`);
          return 0;
        }
        const newTime = prev - 1;
        // Save to localStorage on each tick
        localStorage.setItem(`timer_${contestId}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-submit function for when time runs out
  const handleAutoSubmit = async () => {
    if (code.trim()) {
      try {
        const problem = problems[currentProblem];
        await codingService.submitCode(contestId, {
          problemId: problem._id,
          sourceCode: code,
          languageId: selectedLanguage.id
        });
        toast.success('Code auto-submitted!');
      } catch (error) {
        console.error('Auto-submit error:', error);
      }
    }
    navigate(`/contest/${contestId}/result`);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchProblems = async () => {
    try {
      const data = await codingService.getCodingProblemsByContest(contestId);
      setProblems(data.problems);

      // Fetch contest info for timer
      if (data.contest) {
        setContestInfo(data.contest);

        // Try to restore timer from localStorage first
        const savedTime = localStorage.getItem(`timer_${contestId}`);
        if (savedTime && !isNaN(parseInt(savedTime))) {
          const timeValue = parseInt(savedTime);
          if (timeValue > 0) {
            setTimeRemaining(timeValue);
          } else {
            // Timer expired, use full duration
            setTimeRemaining(data.contest.duration * 60);
          }
        } else if (data.contest.duration) {
          // No saved time, use full duration
          setTimeRemaining(data.contest.duration * 60);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error(error.response?.data?.message || 'Failed to load problems');
      setLoading(false);
    }
  };

  const fetchSubmissions = async (problemId) => {
    try {
      const data = await codingService.getSubmissions(problemId);
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(language.template);
    setOutput('');
    setTestResults(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setRunning(true);
    setOutput('Running...');
    setTestResults(null);

    try {
      // For custom test, we'll use the first example as reference
      const problem = problems[currentProblem];
      const testInput = customInput || (problem.examples[0]?.input || '');

      const response = await codingService.runCode({
        problemId: problem._id,
        sourceCode: code,
        languageId: selectedLanguage.id,
        input: customInput || (problem.examples[0]?.input || '') // Use example input if no custom input
      });

      // Build output display based on whether we have comparison results
      let outputDisplay = '';

      if (response.error) {
        outputDisplay = response.error;
        toast.error('Compilation/Runtime error');
      } else if (response.passed === true) {
        outputDisplay = `✅ TEST PASSED\n\nYour Output:\n${response.output}\n\nExpected Output:\n${response.expectedOutput}`;
        toast.success('✅ Test case passed!');
      } else if (response.passed === false) {
        outputDisplay = `❌ TEST FAILED\n\nYour Output:\n${response.output}\n\nExpected Output:\n${response.expectedOutput}`;
        toast.error('❌ Test case failed - output does not match');
      } else {
        // Custom input was used, no comparison available
        outputDisplay = response.output || 'No output';
        toast.success('Code executed successfully');
      }

      setOutput(outputDisplay);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(error.response?.data?.message || 'Failed to run code');
      toast.error('Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleCheckTestCases = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setChecking(true);
    setOutput('Checking all test cases...');
    setTestResults(null);

    try {
      const problem = problems[currentProblem];
      const response = await codingService.checkAllTestCases({
        problemId: problem._id,
        sourceCode: code,
        languageId: selectedLanguage.id
      });

      // Build detailed output
      let outputDisplay = response.allPassed
        ? `✅ ALL TEST CASES PASSED (${response.passedCount}/${response.totalTestcases})\n\n`
        : `❌ FAILED (${response.passedCount}/${response.totalTestcases} passed)\n\n`;

      response.testcaseResults.forEach(tc => {
        outputDisplay += `Test Case ${tc.testcaseNumber}: ${tc.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
        if (!tc.hidden) {
          outputDisplay += `  Input: ${tc.input}\n`;
          outputDisplay += `  Expected: ${tc.expectedOutput}\n`;
          outputDisplay += `  Your Output: ${tc.actualOutput}\n`;
        } else {
          outputDisplay += `  [Hidden Test Case]\n`;
        }
        if (tc.error) {
          outputDisplay += `  Error: ${tc.error}\n`;
        }
        outputDisplay += `  Time: ${tc.executionTime?.toFixed(2) || 0}ms\n\n`;
      });

      setOutput(outputDisplay);

      if (response.allPassed) {
        toast.success(`✅ All ${response.totalTestcases} test cases passed!`);
      } else {
        toast.error(`❌ ${response.totalTestcases - response.passedCount} test case(s) failed`);
      }
    } catch (error) {
      console.error('Error checking test cases:', error);
      setOutput(error.response?.data?.message || 'Failed to check test cases');
      toast.error('Failed to check test cases');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    setTestResults(null);

    try {
      const problem = problems[currentProblem];
      const response = await codingService.submitCode(contestId, {
        problemId: problem._id,
        sourceCode: code,
        languageId: selectedLanguage.id
      });

      setTestResults(response.submission);

      if (response.submission.verdict === 'ACCEPTED') {
        toast.success(`Accepted! Score: ${response.submission.score}`);
      } else {
        toast.error(`${response.submission.verdict.replace(/_/g, ' ')}`);
      }

      // Refresh submissions
      fetchSubmissions(problem._id);
    } catch (error) {
      console.error('Error submitting code:', error);
      toast.error(error.response?.data?.message || 'Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Coding Problems Available</h2>
          <button onClick={() => navigate(`/contest/${contestId}`)} className="btn-primary">
            Back to Contest
          </button>
        </div>
      </div>
    );
  }

  const problem = problems[currentProblem];

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/contest/${contestId}`)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">{problem.title}</h1>
            <span className={`badge-${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Display */}
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${timeRemaining < 300 ? 'bg-red-500/20 text-red-500' : 'bg-dark-700 text-white'
                }`}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <div className="text-sm text-gray-400">
              Score: <span className="text-primary-400 font-semibold">{problem.score}</span>
            </div>

            <select
              value={selectedLanguage.id}
              onChange={(e) => handleLanguageChange(LANGUAGE_OPTIONS.find(l => l.id === parseInt(e.target.value)))}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm"
            >
              {LANGUAGE_OPTIONS.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>

            <button
              onClick={handleRunCode}
              disabled={running}
              className="btn-secondary"
            >
              {running ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run
            </button>

            <button
              onClick={handleCheckTestCases}
              disabled={checking}
              className="btn-secondary"
            >
              {checking ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
              Check All
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit
            </button>
          </div>
        </div>

        {/* Problem Navigation */}
        <div className="flex items-center gap-2 mt-3">
          {problems.map((p, index) => (
            <button
              key={p._id}
              onClick={() => setCurrentProblem(index)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${index === currentProblem
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
            >
              Problem {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-dark-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-dark-700 bg-dark-800">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'description'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <FileCode className="w-4 h-4 inline mr-2" />
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'submissions'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </p>
                </div>

                {/* Input Format */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Input Format</h3>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                      {problem.inputFormat}
                    </p>
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Output Format</h3>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                      {problem.outputFormat}
                    </p>
                  </div>
                </div>

                {/* Constraints */}
                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Constraints</h3>
                    <div className="bg-dark-800 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                        {problem.constraints}
                      </p>
                    </div>
                  </div>
                )}

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Examples</h3>
                  <div className="space-y-4">
                    {problem.examples.map((example, index) => (
                      <div key={index} className="bg-dark-800 rounded-lg p-4">
                        <p className="text-primary-400 font-semibold mb-2">Example {index + 1}</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Input:</p>
                            <pre className="bg-dark-900 rounded p-2 text-sm font-mono text-gray-300">
                              {example.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Output:</p>
                            <pre className="bg-dark-900 rounded p-2 text-sm font-mono text-gray-300">
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Explanation:</p>
                              <p className="text-gray-300 text-sm">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div>
                    <span className="mr-2">Submissions:</span>
                    <span className="text-white font-semibold">{problem.submissionCount || 0}</span>
                  </div>
                  <div>
                    <span className="mr-2">Acceptance:</span>
                    <span className="text-green-400 font-semibold">
                      {problem.submissionCount > 0
                        ? `${((problem.acceptedCount / problem.submissionCount) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No submissions yet</p>
                ) : (
                  submissions.map(sub => (
                    <div key={sub._id} className="bg-dark-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${sub.verdict === 'ACCEPTED' ? 'text-green-400' :
                          sub.verdict === 'PENDING' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                          {sub.verdict === 'ACCEPTED' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                          {sub.verdict !== 'ACCEPTED' && sub.verdict !== 'PENDING' && <XCircle className="w-4 h-4 inline mr-1" />}
                          {sub.verdict.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(sub.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Language: <span className="text-white">{LANGUAGE_OPTIONS.find(l => l.id === sub.languageId)?.name}</span></span>
                        <span>Score: <span className="text-primary-400">{sub.score}</span></span>
                        {sub.executionTime && <span>Time: <span className="text-white">{sub.executionTime}ms</span></span>}
                        {sub.testcasesPassed !== undefined && (
                          <span>Tests: <span className="text-white">{sub.testcasesPassed}/{sub.totalTestcases}</span></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={selectedLanguage.monaco}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Custom Input & Output */}
          <div className="h-64 border-t border-dark-700 flex flex-col bg-dark-800">
            <div className="flex border-b border-dark-700">
              <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-400">Custom Input</div>
              <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-400 border-l border-dark-700">Output</div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input (optional)..."
                className="flex-1 bg-dark-900 text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
              />
              <div className="flex-1 border-l border-dark-700 bg-dark-900 p-4 font-mono text-sm overflow-auto">
                {testResults ? (
                  <div className="space-y-2">
                    <div className={`font-semibold ${testResults.verdict === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {testResults.verdict.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Testcases Passed: {testResults.testcasesPassed}/{testResults.totalTestcases}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Score: {testResults.score}/{problem.score}
                    </div>
                    {testResults.executionTime && (
                      <div className="text-gray-400 text-xs">
                        Execution Time: {testResults.executionTime}ms
                      </div>
                    )}
                    {testResults.errorMessage && (
                      <pre className="text-red-400 text-xs mt-2 whitespace-pre-wrap">
                        {testResults.errorMessage}
                      </pre>
                    )}
                  </div>
                ) : (
                  <pre className="text-gray-300 whitespace-pre-wrap">{output || 'Output will appear here...'}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingSection;
