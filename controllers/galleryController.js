const supabaseModel = require('../models/supabaseModel');

module.exports = {
  async getGalleryItems(req, res) {
    try {
      const { data, error } = await supabaseModel.getGalleryItems();
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to fetch gallery' });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getAdminGalleryItems(req, res) {
    try {
      const { data, error } = await supabaseModel.getAdminGalleryItems();
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to fetch gallery' });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async createGalleryItem(req, res) {
    try {
      const { title, description, cover_image_url, images } = req.body;
      if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });

      const { data, error } = await supabaseModel.createGalleryItem({ title, description, cover_image_url });
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to create gallery item' });

      const item = data[0];
      // Insert additional images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await supabaseModel.addGalleryImage(item.id, images[i], i);
        }
      }

      res.json({ status: 'success', message: 'Gallery item created!', data: item });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async updateGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const { title, description, cover_image_url, is_active, display_order, images } = req.body;
      if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });

      const { data, error } = await supabaseModel.updateGalleryItem(id, { title, description, cover_image_url, is_active, display_order });
      if (error) return res.status(500).json({ status: 'error', message: `Failed to update: ${error.message}` });

      // Replace additional images if provided
      if (images !== undefined) {
        await supabaseModel.deleteGalleryItemImages(id);
        for (let i = 0; i < images.length; i++) {
          await supabaseModel.addGalleryImage(id, images[i], i);
        }
      }

      res.json({ status: 'success', message: 'Gallery item updated!', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async deleteGalleryItem(req, res) {
    try {
      const { error } = await supabaseModel.deleteGalleryItem(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to delete gallery item' });
      res.json({ status: 'success', message: 'Gallery item deleted!' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async addGalleryImage(req, res) {
    try {
      const { gallery_item_id, image_url, display_order } = req.body;
      if (!gallery_item_id || !image_url) return res.status(400).json({ status: 'error', message: 'gallery_item_id and image_url are required' });

      const { data, error } = await supabaseModel.addGalleryImage(gallery_item_id, image_url, display_order || 0);
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to add image' });
      res.json({ status: 'success', message: 'Image added!', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async deleteGalleryImage(req, res) {
    try {
      const { error } = await supabaseModel.deleteGalleryImage(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: 'Failed to delete image' });
      res.json({ status: 'success', message: 'Image deleted!' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
