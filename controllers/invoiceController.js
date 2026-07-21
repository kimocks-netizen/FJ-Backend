const supabaseModel = require('../models/supabaseModel');

module.exports = {
  async createInvoice(req, res) {
    try {
      const {
        quote_id, customer_name, customer_phone, service_type,
        location, description, invoice_date, total_amount,
        line_items, repair_items, document_type = 'invoice'
      } = req.body;

      // Accept both repair_items (frontend) and line_items (direct API)
      const items = repair_items || line_items || [];

      const invoice_number = document_type === 'quote'
        ? await supabaseModel.generateQuoteNumber()
        : await supabaseModel.generateInvoiceNumber();

      const invoiceData = {
        invoice_number, quote_id: quote_id || null,
        customer_name, customer_phone, service_type,
        location, description,
        invoice_date: invoice_date || new Date().toISOString().split('T')[0],
        total_amount: total_amount || 0,
        document_type, status: 'draft'
      };

      // Normalise items: repair_type -> service_type
      const normalisedItems = items.map(item => ({
        service_type: item.repair_type || item.service_type || '',
        description: item.description || '',
        amount: parseFloat(item.amount) || 0
      }));

      const { data, error } = await supabaseModel.createInvoice(invoiceData, normalisedItems);
      if (error) return res.status(500).json({ status: 'error', message: error.message });

      const msg = document_type === 'quote' ? 'Quote created!' : 'Invoice created!';
      res.json({ status: 'success', message: msg, data: data[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getAllInvoices(req, res) {
    try {
      const { page = 1, limit = 20, type, status, search } = req.query;
      const { data, error, count } = await supabaseModel.getInvoices({
        page: parseInt(page), limit: parseInt(limit), type, status, search
      });
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      res.json({ status: 'success', data, total: count, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const { data, error } = await supabaseModel.getInvoiceById(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async updateInvoice(req, res) {
    try {
      const { repair_items, line_items, ...invoiceFields } = req.body;
      const items = repair_items || line_items;

      const { data, error } = await supabaseModel.updateInvoice(req.params.id, invoiceFields);
      if (error) return res.status(500).json({ status: 'error', message: error.message });

      // If line items provided, replace them
      if (items && items.length > 0) {
        const normalisedItems = items.map(item => ({
          service_type: item.repair_type || item.service_type || '',
          description: item.description || '',
          amount: parseFloat(item.amount) || 0
        }));
        await supabaseModel.replaceInvoiceItems(req.params.id, normalisedItems);
      }

      res.json({ status: 'success', message: 'Updated successfully!', data: data[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async convertDocument(req, res) {
    try {
      const { newType } = req.body;
      if (!['invoice', 'quote'].includes(newType)) {
        return res.status(400).json({ status: 'error', message: 'Invalid document type' });
      }
      const { data, error } = await supabaseModel.convertDocument(req.params.id, newType);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      const msg = newType === 'quote' ? 'Converted to quote!' : 'Converted to invoice!';
      res.json({ status: 'success', message: msg, data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async deleteInvoice(req, res) {
    try {
      const { error } = await supabaseModel.deleteInvoice(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      res.json({ status: 'success', message: 'Deleted successfully!' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
