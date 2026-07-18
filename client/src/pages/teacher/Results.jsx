import { useMemo, useState } from 'react';
import { Lock, Users } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/teacher/StatusBadge.jsx';

const EXAM_TYPES = ['Assessment 1', 'Assessment 2', 'Monthly Test', 'Module Test', 'Mock Exam', 'Final Exam', 'Other'];

const emptyForm = {
  studentId: '',
  subjectId: '',
  examType: 'Monthly Test',
  month: '',
  totalMarks: '100',
  marks: '',
  teacherRemarks: '',
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

function Results() {
  const { data: classes, loading: classesLoading, error: classesError } = useFetch('/teachers/me/classes');
  const { data: students, loading: studentsLoading, error: studentsError } = useFetch('/teachers/me/students');
  const { data: submitted, loading: submittedLoading, error: submittedError, refetch: refetchSubmitted } = useFetch('/teachers/me/results');

  // --- Submission form state -------------------------------------------------------------------
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedStudent = useMemo(
    () => (students ? students.find((s) => String(s.id) === String(form.studentId)) : null),
    [students, form.studentId]
  );

  const subjectOptions = useMemo(() => {
    if (!classes || !selectedStudent) return [];
    const cls = classes.find((c) => c.classId === selectedStudent.classId);
    return cls ? cls.subjects : [];
  }, [classes, selectedStudent]);

  const livePercentage = useMemo(() => {
    const m = parseFloat(form.marks);
    const t = parseFloat(form.totalMarks);
    if (Number.isNaN(m) || Number.isNaN(t) || t <= 0) return null;
    return Math.round((m / t) * 10000) / 100;
  }, [form.marks, form.totalMarks]);

  const handleStudentChange = (studentId) => {
    // Changing the student invalidates whatever subject was picked for the
    // previous student's class -- start that choice over rather than
    // silently submitting a mismatched class/subject pair.
    setForm({ ...form, studentId, subjectId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.studentId || !form.subjectId || !form.month) {
      setFormError('Student, subject, and month are all required.');
      return;
    }
    if (form.marks === '' || Number(form.marks) < 0) {
      setFormError('Enter a valid, non-negative mark.');
      return;
    }
    if (Number(form.marks) > Number(form.totalMarks)) {
      setFormError('Obtained marks cannot exceed total marks.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/teachers/me/results', {
        studentId: Number(form.studentId),
        classId: selectedStudent.classId,
        subjectId: Number(form.subjectId),
        month: form.month,
        examType: form.examType,
        marks: Number(form.marks),
        totalMarks: Number(form.totalMarks),
        teacherRemarks: form.teacherRemarks,
      });
      setFormSuccess(res.data.message);
      setForm(emptyForm);
      refetchSubmitted();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Submitted results table: inline edit state -------------------------------------------------------------------
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ examType: '', marks: '', totalMarks: '', teacherRemarks: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [rowBusy, setRowBusy] = useState(null);

  const startEdit = (row) => {
    setEditingId(row.resultId);
    setEditForm({ examType: row.examType, marks: row.marks, totalMarks: row.totalMarks, teacherRemarks: row.teacherRemarks || '' });
    setEditError('');
    setEditSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const saveEdit = async (row) => {
    setEditError('');
    if (editForm.marks === '' || Number(editForm.marks) < 0) {
      setEditError('Enter a valid, non-negative mark.');
      return;
    }
    if (Number(editForm.marks) > Number(editForm.totalMarks)) {
      setEditError('Marks cannot exceed total marks.');
      return;
    }

    setRowBusy(row.resultId);
    try {
      const res = await api.put(`/teachers/me/results/${row.resultId}`, {
        examType: editForm.examType,
        marks: Number(editForm.marks),
        totalMarks: Number(editForm.totalMarks),
        teacherRemarks: editForm.teacherRemarks,
      });
      setEditingId(null);
      setEditSuccess(res.data.message);
      refetchSubmitted();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setRowBusy(null);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete the ${row.examType} result for ${row.studentName}?`)) return;
    setRowBusy(row.resultId);
    try {
      await api.delete(`/teachers/me/results/${row.resultId}`);
      refetchSubmitted();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this result.');
    } finally {
      setRowBusy(null);
    }
  };

  if (classesLoading || studentsLoading) return <LoadingState label="Loading…" />;
  if (classesError) return <ErrorState message={classesError} />;
  if (studentsError) return <ErrorState message={studentsError} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-navy-800">Student Result Management</h2>
        <p className="text-sm text-muted mt-1">
          Submitted results stay pending until the Examination Board reviews them. Grade and percentage are calculated automatically.
        </p>
      </div>

      {classes.length === 0 || students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No classes assigned yet"
          description="Contact the Examination Board to get assigned to a class and subject."
        />
      ) : (
        <>
          {/* --- 1. Result Submission Form --- */}
          <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 space-y-4">
            <p className="font-display text-navy-800">Submit a Result</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Student</label>
                <select
                  value={form.studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="field-input"
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.className} (Roll #{s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Class</label>
                <input type="text" readOnly value={selectedStudent ? selectedStudent.className : ''} placeholder="Auto-filled from student" className="w-full px-3 py-2 border border-navy-100 rounded-card bg-surface text-muted" />
              </div>

              <div>
                <label className="field-label">Roll Number / Institute ID</label>
                <input
                  type="text"
                  readOnly
                  value={selectedStudent ? `${selectedStudent.rollNumber} / ${selectedStudent.instituteId}` : ''}
                  placeholder="Auto-filled from student"
                  className="w-full px-3 py-2 border border-navy-100 rounded-card bg-surface text-muted"
                />
              </div>

              <div>
                <label className="field-label">Subject</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  disabled={!selectedStudent}
                  className="field-input"
                >
                  <option value="">{selectedStudent ? 'Select a subject' : 'Select a student first'}</option>
                  {subjectOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Exam Type</label>
                <select
                  value={form.examType}
                  onChange={(e) => setForm({ ...form, examType: e.target.value })}
                  className="field-input"
                >
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Month</label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Total Marks</label>
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Obtained Marks</label>
                <input
                  type="number"
                  value={form.marks}
                  onChange={(e) => setForm({ ...form, marks: e.target.value })}
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Percentage</label>
                <input type="text" readOnly value={livePercentage !== null ? `${livePercentage}%` : ''} placeholder="Auto-calculated" className="w-full px-3 py-2 border border-navy-100 rounded-card bg-surface text-muted" />
              </div>
            </div>

            <div>
              <label className="field-label">Teacher Remarks</label>
              <textarea
                value={form.teacherRemarks}
                onChange={(e) => setForm({ ...form, teacherRemarks: e.target.value })}
                rows={2}
                className="field-input"
              />
            </div>

            {formError && <p className="text-sm text-reject">{formError}</p>}
            {formSuccess && <p className="text-sm text-approve">{formSuccess}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Submitting…' : 'Submit Result'}
            </button>
          </form>

          {/* --- 2. Submitted Results Table --- */}
          <div>
            <p className="font-display text-navy-800 mb-3">Submitted Results</p>
            {editSuccess && <p className="text-sm text-approve mb-3">{editSuccess}</p>}

            {submittedLoading ? (
              <LoadingState label="Loading your submitted results…" />
            ) : submittedError ? (
              <ErrorState message={submittedError} onRetry={refetchSubmitted} />
            ) : submitted.length === 0 ? (
              <EmptyState title="No results submitted yet" description="Use the form above to submit your first result." />
            ) : (
              <div className="bg-white rounded-card shadow-card overflow-x-auto data-table">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr className="text-left text-muted border-b border-navy-100">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Exam Type</th>
                      <th className="px-4 py-3">Marks</th>
                      <th className="px-4 py-3">%</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submitted.map((row) => {
                      const isEditing = editingId === row.resultId;
                      const isApproved = row.status === 'approved';

                      return (
                        <tr key={row.resultId} className="border-b border-navy-50 last:border-0 align-top">
                          <td className="px-4 py-3">{row.studentName}</td>
                          <td className="px-4 py-3">{row.rollNumber}</td>
                          <td className="px-4 py-3">{row.class}</td>
                          <td className="px-4 py-3">{row.subject}</td>

                          {isEditing ? (
                            <>
                              <td className="px-4 py-3">
                                <select
                                  value={editForm.examType}
                                  onChange={(e) => setEditForm({ ...editForm, examType: e.target.value })}
                                  className="px-2 py-1 border border-navy-100 rounded-card text-xs"
                                >
                                  {EXAM_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <input type="number" value={editForm.marks} onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })} className="w-16 px-2 py-1 border border-navy-100 rounded-card" />
                                  <span className="text-muted">/</span>
                                  <input type="number" value={editForm.totalMarks} onChange={(e) => setEditForm({ ...editForm, totalMarks: e.target.value })} className="w-16 px-2 py-1 border border-navy-100 rounded-card" />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted">auto</td>
                              <td className="px-4 py-3">
                                <StatusBadge status={row.status} />
                              </td>
                              <td className="px-4 py-3">{formatDate(row.submittedDate)}</td>
                              <td className="px-4 py-3">{formatDate(row.lastUpdated)}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="text"
                                    value={editForm.teacherRemarks}
                                    onChange={(e) => setEditForm({ ...editForm, teacherRemarks: e.target.value })}
                                    placeholder="Remarks"
                                    className="w-32 px-2 py-1 border border-navy-100 rounded-card text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveEdit(row)}
                                      disabled={rowBusy === row.resultId}
                                      className="btn-primary btn-sm"
                                    >
                                      {rowBusy === row.resultId ? 'Saving…' : 'Save'}
                                    </button>
                                    <button onClick={cancelEdit} className="text-xs text-muted hover:text-ink">Cancel</button>
                                  </div>
                                  {editError && <p className="text-xs text-reject max-w-[9rem]">{editError}</p>}
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">{row.examType}</td>
                              <td className="px-4 py-3">{row.marks}/{row.totalMarks}</td>
                              <td className="px-4 py-3">{row.percentage}%</td>
                              <td className="px-4 py-3">
                                <StatusBadge status={row.status} />
                                {row.status === 'approved' && (
                                  <p className="text-xs text-muted mt-1">
                                    Approved by: {row.reviewedBy || '—'}<br />Approved on: {formatDate(row.reviewedAt)}
                                  </p>
                                )}
                                {row.status === 'rejected' && (
                                  <div className="text-xs text-reject mt-1 max-w-[11rem]">
                                    <p>Reason: {row.rejectionReason || '—'}</p>
                                    <p className="text-muted">Rejected by: {row.reviewedBy || '—'}</p>
                                    <p className="text-muted">Rejected on: {formatDate(row.reviewedAt)}</p>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">{formatDate(row.submittedDate)}</td>
                              <td className="px-4 py-3">{formatDate(row.lastUpdated)}</td>
                              <td className="px-4 py-3">
                                {isApproved ? (
                                  <span
                                    className="inline-flex items-center gap-1 text-xs text-muted cursor-not-allowed"
                                    title="Approved results cannot be modified."
                                  >
                                    <Lock className="w-3 h-3" /> Locked
                                  </span>
                                ) : (
                                  <div className="flex gap-3">
                                    <button onClick={() => startEdit(row)} className="btn-link-sm">Edit</button>
                                    <button
                                      onClick={() => deleteRow(row)}
                                      disabled={rowBusy === row.resultId}
                                      className="btn-link-danger-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Results;
