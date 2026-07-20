const { supabase } = require('../models/supabaseModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: admin, error } = await supabase.from('admins').select('*').eq('email', email).single();
    if (error || !admin) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ status: 'success', message: 'Logged in!', token, data: { email: admin.email, name: 'Admin' } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
