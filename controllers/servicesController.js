const supabaseModel = require('../models/supabaseModel');

module.exports = {
  async getServices(req, res) {
    try {
      const { data, error } = await supabaseModel.getServices();
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to fetch services' });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getAdminServices(req, res) {
    try {
      const { data, error } = await supabaseModel.getAdminServices();
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to fetch services' });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async createService(req, res) {
    try {
      const { title, description, image_url, details, category } = req.body;
      if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });

      const { data, error } = await supabaseModel.createService({ title, description, image_url, details, category });
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to create service' });
      res.json({ status: 'success', message: 'Service created!', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async updateService(req, res) {
    try {
      const { id } = req.params;
      const { title, description, image_url, details, is_active, display_order, category } = req.body;
      if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });

      const { data, error } = await supabaseModel.updateService(id, { title, description, image_url, details, is_active, display_order, category });
      if (error) return res.status(500).json({ status: 'error', message: `Failed to update: ${error.message}` });
      res.json({ status: 'success', message: 'Service updated!', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async deleteService(req, res) {
    try {
      const { error } = await supabaseModel.deleteService(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to delete service' });
      res.json({ status: 'success', message: 'Service deleted!' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
