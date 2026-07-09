import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ClassSubjectFields from '../../components/teacher/ClassSubjectFields.jsx';
import StatusBadge from '../../components/teacher/StatusBadge.jsx';

function Results() {
  const { data: classes, loading: classesLoading, error: classesError } = useFetch('/teachers/me/classes');

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [month, setMonth] = useState('');

  const rosterEndpoint = useMemo(
    () => (classId && subjectId && month ? `/teachers/me/results?classId=${classId}&subjectId=${subjectId}&month=${month}` : null),
    [classId, subjectId, month]
  );

  const { data: roster, loading: rosterLoading, error: rosterError, refetch: refetchRoster } = useFetch(rosterEndpoint);

  const [editingId, setEditingId] = useState(null); // studentId currently being edited
  const [form, setForm] = useState({ marks: '', totalMarks: '100', teacherRemarks: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startEdit = (row) => {
    setEditingId(row.studentId);
    setForm({
      marks: row.marks ?? '',
      totalMarks: row.totalMarks ?? '100',
      teacherRemarks: row.teacherRemarks ?? '',
    });
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormError('');
  };

  const saveRow = async (row) => {
    setFormError('');
    if (form.marks === '' || Number(form.marks) < 0) {
      setFormError('Enter a valid, non-negative mark.');
      return;
    }
    if (Number(form.marks) > Number(form.totalMarks)) {
      setFormError('Marks cannot exceed total marks.');
      return;
    }

    setSubmitting(true);
    try {
      if (row.resultId) {
        await api.put(`/teachers/me/results/${row.resultId}`, {
          marks: Number(form.marks),
          totalMarks: Number(form.totalMarks),
          teacherRemarks: form.teacherRemarks,
        });
      } else {
        await api.post('/teachers/me/results', {
          studentId: row.studentId,
          classId: Number(classId),
          subjectId: Number(subjectId),
          month,
          marks: Number(form.marks),
          totalMarks: Number(form.totalMarks),
          teacherRemarks: form.teacherRemarks,
        });
      }
      setEditingId(null);
      refetchRoster();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (row) => {
    if (!row.resultId) return;
    if (!window.confirm(`Delete the result for ${row.name}?`)) return;
    try {
      await api.delete(`/teachers/me/results/${row.resultId}`);
      refetchRoster();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this result.');
    }
  };

  if (classesLoading) return <LoadingState label="Loading your classes…" />;
  if (classesError) return <ErrorState message={classesError} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-navy-800">Student Result Management</h2>
        <p className="text-sm text-muted mt-1">
          Results stay pending until the Examination Board approves them. Grade and percentage are calculated automatically.
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No classes assigned yet"
          description="Contact the Examination Board to get assigned to a class and subject."
        />
      ) : (
        <>
          <div className="bg-white rounded-card shadow-card p-6 space-y-4">
            <ClassSubjectFields classes={classes} classId={classId} subjectId={subjectId} onClassChange={setClassId} onSubjectChange={setSubjectId} />
            <div>
              <label className="block text-sm text-ink mb-1">Exam Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {!rosterEndpoint ? (
            <EmptyState title="Select a class, subject, and month" description="Choose all three above to see the student roster." />
          ) : rosterLoading ? (
            <LoadingState label="Loading roster…" />
          ) : rosterError ? (
            <ErrorState message={rosterError} onRetry={refetchRoster} />
          ) : roster.length === 0 ? (
            <EmptyState icon={Users} title="No students in this class yet" />
          ) : (
            <div className="bg-white rounded-card shadow-card overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-left text-muted border-b border-navy-100">
                    <th className="px-4 py-3">Roll #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row) => (
                    <tr key={row.studentId} className="border-b border-navy-50 last:border-0 align-top">
                      <td className="px-4 py-3">{row.rollNumber}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      {editingId === row.studentId ? (
                        <>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={form.marks}
                                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                                className="w-16 px-2 py-1 border border-navy-100 rounded-card"
                              />
                              <span className="text-muted">/</span>
                              <input
                                type="number"
                                value={form.totalMarks}
                                onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                                className="w-16 px-2 py-1 border border-navy-100 rounded-card"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">auto</td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={form.teacherRemarks}
                              onChange={(e) => setForm({ ...form, teacherRemarks: e.target.value })}
                              className="w-full px-2 py-1 border border-navy-100 rounded-card"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => saveRow(row)}
                                disabled={submitting}
                                className="text-xs px-2 py-1 bg-navy-700 text-white rounded-card hover:bg-navy-800 disabled:opacity-60"
                              >
                                {submitting ? 'Saving…' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} className="text-xs text-muted hover:text-ink">
                                Cancel
                              </button>
                              {formError && <p className="text-xs text-reject max-w-[10rem]">{formError}</p>}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{row.marks !== null ? `${row.marks}/${row.totalMarks} (${row.percentage}%)` : '—'}</td>
                          <td className="px-4 py-3">{row.grade || '—'}</td>
                          <td className="px-4 py-3 text-muted">{row.teacherRemarks || '—'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-3">
                            {row.editable ? (
                              <div className="flex gap-3">
                                <button onClick={() => startEdit(row)} className="text-xs text-navy-700 hover:underline">
                                  {row.resultId ? 'Edit' : 'Add'}
                                </button>
                                {row.resultId && (
                                  <button onClick={() => deleteRow(row)} className="text-xs text-reject hover:underline">
                                    Delete
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted">Approved — locked</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Results;
