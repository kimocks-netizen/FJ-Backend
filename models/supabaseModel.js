const { createClient } = require('@supabase/supabase-js');

const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

module.exports = {
  supabase,

  // ─── QUOTES ───────────────────────────────────────────────
  async createQuote(data) {
    const { data: result, error } = await supabase.from('quotes').insert([data]).select('*');
    return { data: result, error };
  },

  async getQuotes() {
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    return { data, error };
  },

  async updateQuoteStatus(id, status) {
    const { data, error } = await supabase.from('quotes').update({ status }).eq('id', id).select('*');
    return { data, error };
  },

  // ─── ADMINS ───────────────────────────────────────────────
  async getAdminByEmail(email) {
    const { data, error } = await supabase.from('admins').select('*').eq('email', email).single();
    return { data, error };
  },

  // ─── INVOICES ─────────────────────────────────────────────
  async generateInvoiceNumber() {
    const { data } = await supabase.from('invoices').select('invoice_number').eq('document_type', 'invoice').order('created_at', { ascending: false }).limit(1);
    if (!data || data.length === 0) return 'INV-001';
    const match = data[0].invoice_number.match(/INV-(\d+)/);
    return match ? `INV-${String(parseInt(match[1]) + 1).padStart(3, '0')}` : 'INV-001';
  },

  async generateQuoteNumber() {
    const { data } = await supabase.from('invoices').select('invoice_number').eq('document_type', 'quote').order('created_at', { ascending: false }).limit(1);
    if (!data || data.length === 0) return 'QUO-001';
    const match = data[0].invoice_number.match(/QUO-(\d+)/);
    return match ? `QUO-${String(parseInt(match[1]) + 1).padStart(3, '0')}` : 'QUO-001';
  },

  async createInvoice(invoiceData, lineItems) {
    const { data: invoice, error } = await supabase.from('invoices').insert([invoiceData]).select('*');
    if (error) return { data: null, error };

    if (lineItems && lineItems.length > 0) {
      const items = lineItems.map(item => ({
        invoice_id: invoice[0].id,
        service_type: item.service_type || item.repair_type || '',
        description: item.description,
        amount: parseFloat(item.amount) || 0
      }));
      await supabase.from('invoice_items').insert(items);
    }
    return { data: invoice, error: null };
  },

  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(id, service_type, description, amount)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getInvoiceById(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(id, service_type, description, amount)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async replaceInvoiceItems(invoiceId, items) {
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
    if (items && items.length > 0) {
      const rows = items.map(item => ({
        invoice_id: invoiceId,
        service_type: item.service_type || '',
        description: item.description || '',
        amount: parseFloat(item.amount) || 0
      }));
      await supabase.from('invoice_items').insert(rows);
    }
  },

  async updateInvoice(id, updateData) {
    const { data, error } = await supabase.from('invoices').update({ ...updateData, updated_at: new Date() }).eq('id', id).select('*');
    return { data, error };
  },

  async deleteInvoice(id) {
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    return { error };
  },

  async convertDocument(id, newType) {
    const { data: current, error: fetchError } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (fetchError) return { data: null, error: fetchError };

    const { data: currentItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', id);

    const newNumber = newType === 'quote' ? await this.generateQuoteNumber() : await this.generateInvoiceNumber();
    const newDocData = {
      ...current,
      id: undefined,
      invoice_number: newNumber,
      document_type: newType,
      status: 'draft',
      original_invoice_id: current.original_invoice_id || current.id,
      converted_from_id: current.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    delete newDocData.id;

    const { data: newDoc, error: createError } = await supabase.from('invoices').insert([newDocData]).select('*');
    if (createError) return { data: null, error: createError };

    if (currentItems && currentItems.length > 0) {
      const newItems = currentItems.map(({ id: _id, invoice_id: _inv, ...rest }) => ({
        ...rest,
        invoice_id: newDoc[0].id,
        created_at: new Date().toISOString()
      }));
      await supabase.from('invoice_items').insert(newItems);
    }

    return { data: newDoc[0], error: null };
  },

  // ─── GALLERY ──────────────────────────────────────────────
  async getGalleryItems() {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*, gallery_images(id, image_url, display_order)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  },

  async getAdminGalleryItems() {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*, gallery_images(id, image_url, display_order)')
      .order('display_order', { ascending: true });
    return { data, error };
  },

  async createGalleryItem(galleryData) {
    const { data: existing } = await supabase.from('gallery_items').select('display_order').order('display_order', { ascending: false }).limit(1);
    const nextOrder = existing && existing.length > 0 ? (existing[0].display_order || 0) + 1 : 0;
    const { data, error } = await supabase.from('gallery_items').insert([{ ...galleryData, display_order: nextOrder, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]).select('*');
    return { data, error };
  },

  async updateGalleryItem(id, updateData) {
    const { data, error } = await supabase.from('gallery_items').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', id).select('*');
    return { data, error };
  },

  async deleteGalleryItem(id) {
    await supabase.from('gallery_images').delete().eq('gallery_item_id', id);
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    return { error };
  },

  async deleteGalleryItemImages(galleryItemId) {
    const { error } = await supabase.from('gallery_images').delete().eq('gallery_item_id', galleryItemId);
    return { error };
  },

  async addGalleryImage(gallery_item_id, image_url, display_order = 0) {
    const { data, error } = await supabase.from('gallery_images').insert([{ gallery_item_id, image_url, display_order }]).select('*');
    return { data, error };
  },

  async deleteGalleryImage(id) {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    return { error };
  },

  // ─── SERVICES ─────────────────────────────────────────────
  async getServices() {
    const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('display_order', { ascending: true });
    return { data, error };
  },

  async getAdminServices() {
    const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
    return { data, error };
  },

  async createService(serviceData) {
    const { data: existing } = await supabase.from('services').select('display_order').order('display_order', { ascending: false }).limit(1);
    const nextOrder = existing && existing.length > 0 ? (existing[0].display_order || 0) + 1 : 0;
    const { data, error } = await supabase.from('services').insert([{ ...serviceData, display_order: nextOrder, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]).select('*');
    return { data, error };
  },

  async updateService(id, updateData) {
    const { data, error } = await supabase.from('services').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', id).select('*');
    return { data, error };
  },

  async deleteService(id) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return { error };
  }
};
