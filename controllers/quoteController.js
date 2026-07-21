const supabaseModel = require('../models/supabaseModel');

module.exports = {
  async submitQuote(req, res) {
    const { name, phone, email, service_required, location, message, images } = req.body;

    if (!name || !phone || !service_required) {
      return res.status(400).json({ status: 'error', message: 'Name, phone and service are required' });
    }

    const { data, error } = await supabaseModel.createQuote({
      name, phone, email, service_required, location, message,
      images: images || [],
      status: 'Pending'
    });

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Quote submitted successfully!', data });
  },

  async getAllQuotes(req, res) {
    const { page = 1, limit = 20, status, search } = req.query;
    const { data, error, count } = await supabaseModel.getQuotes({
      page: parseInt(page), limit: parseInt(limit), status, search
    });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data, total: count, page: parseInt(page), limit: parseInt(limit) });
  },

  async deleteQuote(req, res) {
    const { id } = req.params;
    const { error } = await supabaseModel.deleteQuote(id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Quote deleted!' });
  },

  async updateQuoteStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Contacted', 'Completed'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const { data, error } = await supabaseModel.updateQuoteStatus(id, status);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data: data[0] });
  }
};
