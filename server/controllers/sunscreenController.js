const Sunscreen = require('../models/Sunscreen');

exports.getAll = async (req, res) => {
  try {
    const sunscreens = await Sunscreen.findAll();
    res.json({ success: true, sunscreens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const sunscreen = await Sunscreen.findByPk(req.params.id);
    if (sunscreen) {
      res.json({ success: true, sunscreen });
    } else {
      res.status(404).json({ success: false, error: 'Sunscreen not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Implement other CRUD operations similarly

exports.getSummary = async (req, res) => {
  try {
    const total = await Sunscreen.count();
    const totalAmount = await Sunscreen.sum('amount');
    const byCode = await Sunscreen.findAll({
      attributes: ['code', [sequelize.fn('count', sequelize.col('id')), 'count']],
      group: ['code']
    });
    
    res.json({ success: true, summary: { total, totalAmount, byCode } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
