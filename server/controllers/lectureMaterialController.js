const db = require('../models');

const verifyAssignment = async (teacherId, classId, subjectId) => {
  const assignment = await db.TeacherAssignment.findOne({ where: { teacherId, classId, subjectId } });
  return !!assignment;
};

const shape = (m) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  materialType: m.materialType,
  class: `${m.class.name}-${m.class.section}`,
  classId: m.classId,
  subject: m.subject.name,
  subjectId: m.subjectId,
  hasFile: !!m.filePath,
  externalLink: m.externalLink,
  uploadedAt: m.createdAt,
});

const getLectureMaterials = async (req, res, next) => {
  try {
    const materials = await db.LectureUnit.findAll({
      where: { teacherId: req.teacher.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Subject, as: 'subject' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: materials.map(shape) });
  } catch (err) {
    next(err);
  }
};

const createLectureMaterial = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { classId, subjectId, title, description, materialType, externalLink } = req.body;

    const isAssigned = await verifyAssignment(teacher.id, classId, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject for this class.' });
    }

    // Exactly one of file / link is required -- a material that's neither
    // isn't useful to a student and isn't allowed here.
    if (!req.file && !externalLink) {
      return res.status(400).json({ success: false, message: 'Provide either a file or an external link.' });
    }
    if (req.file && externalLink) {
      return res.status(400).json({ success: false, message: 'Provide a file or a link, not both.' });
    }

    const material = await db.LectureUnit.create({
      teacherId: teacher.id,
      classId,
      subjectId,
      title,
      description,
      materialType: materialType || (req.file ? 'notes' : 'link'),
      filePath: req.file ? `/uploads/lecture-materials/${req.file.filename}` : null,
      externalLink: externalLink || null,
    });

    res.status(201).json({ success: true, message: 'Lecture material uploaded.', data: { id: material.id } });
  } catch (err) {
    next(err);
  }
};

const updateLectureMaterial = async (req, res, next) => {
  try {
    const material = await db.LectureUnit.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Lecture material not found.' });
    }
    if (material.teacherId !== req.teacher.id) {
      return res.status(403).json({ success: false, message: 'You can only edit materials you uploaded yourself.' });
    }

    const { title, description, materialType, externalLink } = req.body;
    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (materialType !== undefined) material.materialType = materialType;
    if (req.file) {
      material.filePath = `/uploads/lecture-materials/${req.file.filename}`;
      material.externalLink = null;
    } else if (externalLink !== undefined && externalLink !== '') {
      material.externalLink = externalLink;
      material.filePath = null;
    }

    await material.save();
    res.json({ success: true, message: 'Lecture material updated.' });
  } catch (err) {
    next(err);
  }
};

const deleteLectureMaterial = async (req, res, next) => {
  try {
    const material = await db.LectureUnit.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Lecture material not found.' });
    }
    if (material.teacherId !== req.teacher.id) {
      return res.status(403).json({ success: false, message: 'You can only delete materials you uploaded yourself.' });
    }

    await material.destroy();
    res.json({ success: true, message: 'Lecture material deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLectureMaterials, createLectureMaterial, updateLectureMaterial, deleteLectureMaterial };
