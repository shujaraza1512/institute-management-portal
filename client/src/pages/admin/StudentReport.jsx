import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, User as UserIcon, GraduationCap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/teacher/StatusBadge.jsx';

function StudentReport() {
  const { id } = useParams();
  const [month, setMonth] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [session, setSession] = useState('');

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (subjectId) params.set('subjectId', subjectId);
    if (session) params.set('session', session);
    return `/admin/students/${id}/report?${params.toString()}`;
  }, [id, month, subjectId, session]);

  const { data, loading, error, refetch } = useFetch(endpoint);

  if (loading) return <LoadingState label="Loading student report…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { student, assessmentHistory, progress, attendance, performanceSummary } = data;
  const subjectOptions = Array.from(new Set(assessmentHistory.map((a) => a.subject)));

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Screen-only controls -- hidden entirely when printing */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/admin/students" className="inline-flex items-center gap-1 text-sm text-navy-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Student Report
        </button>
      </div>

      {/* Printable report starts here */}
      <div className="bg-white rounded-card shadow-card p-6 print:shadow-none print:rounded-none">
        <div className="flex items-center gap-3 pb-4 border-b border-navy-100">
          <div className="w-10 h-10 rounded-card bg-navy-700 text-white flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="font-display text-navy-800">Institute Management Portal</p>
            <p className="text-xs text-muted">Official Student Academic Report</p>
          </div>
        </div>

        {/* 1. Student Information */}
        <div className="flex items-start gap-4 mt-6">
          <div className="w-20 h-20 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-10 h-10" />
          </div>
          <div className="grid sm:grid-cols-3 gap-x-6 gap-y-2 text-sm flex-1">
            <div><span className="text-muted">Name:</span> <span className="text-ink">{student.name}</span></div>
            <div><span className="text-muted">Institute ID:</span> <span className="text-ink">{student.instituteId}</span></div>
            <div><span className="text-muted">Roll Number:</span> <span className="text-ink">{student.rollNumber || '—'}</span></div>
            <div><span className="text-muted">Class:</span> <span className="text-ink">{student.class || '—'}</span></div>
            <div><span className="text-muted">Email:</span> <span className="text-ink">{student.email}</span></div>
            <div><span className="text-muted">Phone:</span> <span className="text-ink">{student.phone || '—'}</span></div>
            <div><span className="text-muted">Guardian:</span> <span className="text-ink">{student.guardianName || '—'}</span></div>
            <div><span className="text-muted">Guardian Phone:</span> <span className="text-ink">{student.guardianPhone || '—'}</span></div>
            <div><span className="text-muted">Admission Date:</span> <span className="text-ink">{student.admissionDate || '—'}</span></div>
            <div><span className="text-muted">Address:</span> <span className="text-ink">{student.address || '—'}</span></div>
            <div>
              <span className="text-muted">Status:</span>{' '}
              <span className={student.isActive ? 'text-approve' : 'text-reject'}>{student.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* 5. Performance Summary */}
        <div className="mt-6 pt-6 border-t border-navy-100">
          <p className="font-display text-navy-800 mb-3">Performance Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted text-xs">Overall Percentage</p><p className="text-ink font-medium">{performanceSummary.overallPercentage ?? '—'}{performanceSummary.overallPercentage !== null ? '%' : ''}</p></div>
            <div><p className="text-muted text-xs">Average Grade</p><p className="text-ink font-medium">{performanceSummary.averageGrade || '—'}</p></div>
            <div><p className="text-muted text-xs">Total Assessments</p><p className="text-ink font-medium">{performanceSummary.totalAssessments}</p></div>
            <div><p className="text-muted text-xs">Best Subject</p><p className="text-ink font-medium">{performanceSummary.bestSubject || '—'}</p></div>
            <div><p className="text-muted text-xs">Weakest Subject</p><p className="text-ink font-medium">{performanceSummary.weakestSubject || '—'}</p></div>
            <div><p className="text-muted text-xs">Passed Subjects</p><p className="text-ink font-medium">{performanceSummary.passedSubjects.join(', ') || '—'}</p></div>
            <div><p className="text-muted text-xs">Failed Subjects</p><p className="text-ink font-medium">{performanceSummary.failedSubjects.join(', ') || 'None'}</p></div>
          </div>
        </div>

        {/* 4. Attendance Report */}
        <div className="mt-6 pt-6 border-t border-navy-100">
          <p className="font-display text-navy-800 mb-3">Attendance Report</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div><p className="text-muted text-xs">Overall Attendance</p><p className="text-ink font-medium">{attendance.overallPercentage ?? '—'}{attendance.overallPercentage !== null ? '%' : ''}</p></div>
            <div><p className="text-muted text-xs">Present</p><p className="text-ink font-medium">{attendance.present}</p></div>
            <div><p className="text-muted text-xs">Absent</p><p className="text-ink font-medium">{attendance.absent}</p></div>
            <div><p className="text-muted text-xs">Leave</p><p className="text-ink font-medium">{attendance.leave}</p></div>
          </div>
          {attendance.monthlyTrend.length > 0 && (
            <div className="print:hidden">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attendance.monthlyTrend}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#1f3a63" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. Academic Progress */}
        <div className="mt-6 pt-6 border-t border-navy-100">
          <p className="font-display text-navy-800 mb-3">Academic Progress</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div><p className="text-muted text-xs">Overall Average</p><p className="text-ink font-medium">{progress.overallAverage ?? '—'}{progress.overallAverage !== null ? '%' : ''}</p></div>
            <div><p className="text-muted text-xs">Highest Marks</p><p className="text-ink font-medium">{progress.highestMarks ?? '—'}</p></div>
            <div><p className="text-muted text-xs">Lowest Marks</p><p className="text-ink font-medium">{progress.lowestMarks ?? '—'}</p></div>
          </div>
          {progress.monthlyTrend.length === 0 ? (
            <EmptyState title="No approved results yet" description="Charts will appear once results are approved." />
          ) : (
            <div className="grid md:grid-cols-2 gap-6 print:hidden">
              <div>
                <p className="text-xs text-muted mb-2">Monthly Marks Trend</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={progress.monthlyTrend}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="average" stroke="#1f3a63" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-muted mb-2">Subject-wise Comparison</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={progress.subjectComparison}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#3b82c4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* 2. Complete Assessment History */}
        <div className="mt-6 pt-6 border-t border-navy-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="font-display text-navy-800">Complete Assessment History</p>
            <div className="flex flex-wrap gap-2 print:hidden">
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-2 py-1 border border-navy-100 rounded-card text-xs" />
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="px-2 py-1 border border-navy-100 rounded-card text-xs">
                <option value="">All Subjects</option>
                {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="Session e.g. 2025-2026"
                className="px-2 py-1 border border-navy-100 rounded-card text-xs w-36"
              />
            </div>
          </div>

          {assessmentHistory.length === 0 ? (
            <EmptyState title="No assessments found" description="Try clearing the filters above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-left text-muted border-b border-navy-100">
                    <th className="py-2 pr-3">Assessment</th>
                    <th className="py-2 pr-3">Subject</th>
                    <th className="py-2 pr-3">Teacher</th>
                    <th className="py-2 pr-3">Month</th>
                    <th className="py-2 pr-3">Marks</th>
                    <th className="py-2 pr-3">%</th>
                    <th className="py-2 pr-3">Grade</th>
                    <th className="py-2 pr-3">Position</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Remarks</th>
                    <th className="py-2 pr-3 print:hidden">Approval History</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentHistory.map((a) => (
                    <tr key={a.id} className="border-b border-navy-50 last:border-0">
                      <td className="py-2 pr-3">{a.assessmentName}</td>
                      <td className="py-2 pr-3">{a.subject}</td>
                      <td className="py-2 pr-3">{a.teacher || '—'}</td>
                      <td className="py-2 pr-3">{a.month}</td>
                      <td className="py-2 pr-3">{a.marks}/{a.totalMarks}</td>
                      <td className="py-2 pr-3">{a.percentage}%</td>
                      <td className="py-2 pr-3">{a.grade}</td>
                      <td className="py-2 pr-3">{a.position ? `#${a.position}` : '—'}</td>
                      <td className="py-2 pr-3"><StatusBadge status={a.status} /></td>
                      <td className="py-2 pr-3 max-w-[10rem] truncate" title={a.teacherRemarks || ''}>{a.teacherRemarks || '—'}</td>
                      <td className="py-2 pr-3 max-w-[12rem] print:hidden">
                        {a.approvalHistory ? (
                          <div className="text-xs">
                            <p>{a.approvalHistory.reviewedBy} · {new Date(a.approvalHistory.reviewedAt).toLocaleDateString()}</p>
                            {a.approvalHistory.rejectionReason && (
                              <p className="text-reject mt-0.5">{a.approvalHistory.rejectionReason}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Not yet reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Day-by-day Attendance History -- distinct from the monthly trend
            chart above; only shown on screen (the chart + summary numbers
            are what belong in a printed report, not a long daily log). */}
        <div className="mt-6 pt-6 border-t border-navy-100 print:hidden">
          <p className="font-display text-navy-800 mb-3">Attendance History</p>
          {attendance.history.length === 0 ? (
            <EmptyState title="No attendance records yet" />
          ) : (
            <div className="max-h-64 overflow-y-auto border border-navy-100 rounded-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-muted border-b border-navy-100">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.history.map((h) => (
                    <tr key={h.date} className="border-b border-navy-50 last:border-0">
                      <td className="px-3 py-1.5">{h.date}</td>
                      <td className="px-3 py-1.5 capitalize">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-card ${
                            h.status === 'present' ? 'bg-approve/10 text-approve' : h.status === 'absent' ? 'bg-reject/10 text-reject' : 'bg-pending/10 text-pending'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="hidden print:block text-xs text-muted mt-8 pt-4 border-t border-navy-100">
          Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} — Institute Management Portal
        </p>
      </div>
    </div>
  );
}

export default StudentReport;
