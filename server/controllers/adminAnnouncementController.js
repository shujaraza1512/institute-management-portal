const db = require('../models');

const shapeAnnouncement = (a) => ({
  id: a.id,
  title: a.title,
  description: a.description,
  audience: a.audience,
  publishAt: a.publishAt,
  expiryDate: a.expiryDate,
  postedBy: a.author ? a.author.name : null,
  createdAt: a.createdAt,
});

const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await db.Announcement.findAll({
      include: [{ model: db.User, as: 'author' }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: announcements.map(shapeAnnouncement) });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, audience, publishAt, expiryDate } = req.body;

    const announcement = await db.Announcement.create({
      title,
      description,
      audience: audience || 'all',
      publishAt: publishAt || new Date(),
      expiryDate: expiryDate || null,
      postedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Announcement created.', data: { id: announcement.id } });
  } catch (err) {
    next(err);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await db.Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const { title, description, audience, publishAt, expiryDate } = req.body;
    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (audience !== undefined) announcement.audience = audience;
    if (publishAt !== undefined) announcement.publishAt = publishAt;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate || null;
    await announcement.save();

    res.json({ success: true, message: 'Announcement updated.' });
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await db.Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    await announcement.destroy();
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
