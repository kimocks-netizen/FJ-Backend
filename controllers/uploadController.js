const { supabase } = require('../models/supabaseModel');

const ALLOWED_BUCKETS = ['fj-images', 'fj-gallery'];

module.exports = {
  async uploadFile(req, res) {
    try {
      const { bucket = 'fj-images', folder = 'uploads' } = req.body;
      if (!ALLOWED_BUCKETS.includes(bucket))
        return res.status(400).json({ status: 'error', message: 'Invalid bucket' });
      if (!req.file)
        return res.status(400).json({ status: 'error', message: 'No file provided' });

      const ext = req.file.originalname.split('.').pop();
      const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
      if (error) return res.status(500).json({ status: 'error', message: error.message });

      // Return a proxied URL — no Supabase domain exposed
      const proxyUrl = `/api/media/${bucket}/${storagePath}`;
      res.json({ status: 'success', url: proxyUrl });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Upload failed' });
    }
  },

  async proxyMedia(req, res) {
    try {
      const { bucket } = req.params;
      const filePath = req.params[0]; // wildcard after bucket
      if (!ALLOWED_BUCKETS.includes(bucket))
        return res.status(400).json({ status: 'error', message: 'Invalid bucket' });

      const { data, error } = await supabase.storage.from(bucket).download(filePath);
      if (error || !data) return res.status(404).json({ status: 'error', message: 'File not found' });

      const buf = Buffer.from(await data.arrayBuffer());
      const ext = filePath.split('.').pop()?.toLowerCase();
      const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }[ext] || 'application/octet-stream';

      res.set('Content-Type', mime);
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Media proxy failed' });
    }
  },
};
