// Shared class + subject cascading dropdowns used by the Results,
// Assignments, and Lecture Materials forms -- subject options narrow to
// whatever the selected class actually offers, since `classes` only ever
// contains classes/subjects this teacher is assigned to in the first place.
function ClassSubjectFields({ classes, classId, subjectId, onClassChange, onSubjectChange }) {
  const selectedClass = classes.find((c) => String(c.classId) === String(classId));
  const subjectOptions = selectedClass ? selectedClass.subjects : [];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-ink mb-1">Class</label>
        <select
          value={classId}
          onChange={(e) => {
            onClassChange(e.target.value);
            onSubjectChange('');
          }}
          className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Select a class</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>{c.className}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-ink mb-1">Subject</label>
        <select
          value={subjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          disabled={!classId}
          className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-surface disabled:text-muted"
        >
          <option value="">Select a subject</option>
          {subjectOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ClassSubjectFields;
