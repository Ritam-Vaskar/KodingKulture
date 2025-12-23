import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import mcqService from '../../services/mcqService';
import toast from 'react-hot-toast';
import { Save, X, Plus, Trash2, CheckCircle, Edit, ArrowLeft } from 'lucide-react';

const ManageMCQ = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMcq, setEditingMcq] = useState(null);
  
  const [formData, setFormData] = useState({
    contestId: contestId,
    question: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    marks: 4,
    negativeMarks: 1,
    difficulty: 'MEDIUM',
    category: 'GENERAL',
    order: 1
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    fetchMCQs();
  }, [contestId, isAdmin]);

  const fetchMCQs = async () => {
    try {
      const data = await mcqService.getMCQsByContest(contestId);
      setMcqs(data.mcqs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      toast.error('Failed to load MCQs');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contestId: contestId,
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      marks: 4,
      negativeMarks: 1,
      difficulty: 'MEDIUM',
      category: 'GENERAL',
      order: mcqs.length + 1
    });
    setEditingMcq(null);
    setShowForm(false);
  };

  const handleEdit = (mcq) => {
    setFormData({
      contestId: contestId,
      question: mcq.question,
      options: mcq.options,
      marks: mcq.marks,
      negativeMarks: mcq.negativeMarks,
      difficulty: mcq.difficulty,
      category: mcq.category,
      order: mcq.order
    });
    setEditingMcq(mcq);
    setShowForm(true);
  };

  const handleDelete = async (mcqId) => {
    if (!window.confirm('Are you sure you want to delete this MCQ?')) return;

    try {
      await adminService.deleteMCQ(mcqId);
      toast.success('MCQ deleted successfully');
      fetchMCQs();
    } catch (error) {
      console.error('Error deleting MCQ:', error);
      toast.error('Failed to delete MCQ');
    }
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      toast.error('Question is required');
      return;
    }

    const filledOptions = formData.options.filter(opt => opt.text.trim());
    if (filledOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    const correctOptions = formData.options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      toast.error('At least one correct answer is required');
      return;
    }

    try {
      const mcqData = {
        ...formData,
        options: formData.options.filter(opt => opt.text.trim())
      };

      if (editingMcq) {
        await adminService.updateMCQ(editingMcq._id, mcqData);
        toast.success('MCQ updated successfully');
      } else {
        await adminService.createMCQ(mcqData);
        toast.success('MCQ created successfully');
      }

      resetForm();
      fetchMCQs();
    } catch (error) {
      console.error('Error saving MCQ:', error);
      toast.error(error.response?.data?.message || 'Failed to save MCQ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage MCQs</h1>
              <p className="text-gray-400">{mcqs.length} questions created</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? (
              <>
                <X className="w-5 h-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add MCQ
              </>
            )}
          </button>
        </div>

        {/* MCQ Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingMcq ? 'Edit MCQ' : 'Create New MCQ'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Options * (Check correct answers)
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    + Add Option
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex items-center pt-3">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="input-field flex-1"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-red-400 mt-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Marks & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="input-field"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="GENERAL">General</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="APTITUDE">Aptitude</option>
                    <option value="REASONING">Reasoning</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-5 h-5 mr-2" />
                  {editingMcq ? 'Update MCQ' : 'Create MCQ'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MCQ List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">All MCQs</h2>
          
          {mcqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No MCQs created yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create First MCQ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mcqs.map((mcq, index) => (
                <div key={mcq._id} className="p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge-primary">Q{index + 1}</span>
                        <span className={`badge-${mcq.difficulty.toLowerCase()}`}>
                          {mcq.difficulty}
                        </span>
                        <span className="badge-info text-xs">{mcq.category}</span>
                      </div>
                      <p className="text-lg text-gray-200 mb-3">{mcq.question}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(mcq)}
                        className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(mcq._id)}
                        className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {mcq.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-start gap-3 p-2 rounded ${
                          option.isCorrect ? 'bg-green-500/10 border border-green-500/30' : ''
                        }`}
                      >
                        {option.isCorrect && (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-gray-300">
                          <span className="font-semibold text-primary-400 mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-600 text-sm text-gray-400">
                    <span>Marks: <span className="text-green-400 font-semibold">+{mcq.marks}</span></span>
                    {mcq.negativeMarks > 0 && (
                      <span>Negative: <span className="text-red-400 font-semibold">-{mcq.negativeMarks}</span></span>
                    )}
                    <span>Order: {mcq.order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMCQ;
