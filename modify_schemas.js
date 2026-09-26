const fs = require('fs');
const path = require('path');

const modelsDir = path.join(process.cwd(), 'server', 'models');
const files = fs.readdirSync(modelsDir);

for (const file of files) {
  if (file === 'User.js') continue;
  let content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
  
  if (!content.includes('owner: {')) {
    content = content.replace(/new mongoose\.Schema\(\{/, "new mongoose.Schema({\n  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },");
  }
  
  content = content.replace(/sku: \{ type: String, required: true, unique: true \}/, "sku: { type: String, required: true }");
  content = content.replace(/code: \{ type: String, required: true, unique: true \}/, "code: { type: String, required: true }");
  
  if (file === 'Product.js' && !content.includes('.index({ owner: 1, sku: 1 }')) {
    content = content.replace(/module\.exports/, "productSchema.index({ owner: 1, sku: 1 }, { unique: true });\n\nmodule.exports");
  }
  if (file === 'Warehouse.js' && !content.includes('.index({ owner: 1, code: 1 }')) {
    content = content.replace(/module\.exports/, "warehouseSchema.index({ owner: 1, code: 1 }, { unique: true });\n\nmodule.exports");
  }

  fs.writeFileSync(path.join(modelsDir, file), content, 'utf8');
}
console.log('Schemas updated for Multi-Tenancy');
