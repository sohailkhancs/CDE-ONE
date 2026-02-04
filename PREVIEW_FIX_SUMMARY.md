# Document Preview Fixes - Complete

## Issues Fixed

### 1. **Frontend API URL Issue**
**Problem:** Preview was calling `/api/documents/{id}/preview` instead of `/api/v1/documents/{id}/preview`

**Fixed Files:**
- `DocumentViewer.tsx`
- `DocumentHoverPreview.tsx`

**Changes:**
```typescript
// Before (incorrect)
const blob = await fetch(`/api/documents/${document.id}/preview`).then(r => r.blob());

// After (correct)
const blob = await fetch(`${import.meta.env.VITE_API_URL}/documents/${document.id}/preview`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.blob());
```

### 2. **Missing Authentication Token**
**Problem:** Preview requests didn't include JWT token, causing 401 Unauthorized errors

**Fixed:** Added token to all preview/thumbnail requests

### 3. **Backend File Path Not Stored**
**Problem:** When uploading, the file path with extension wasn't saved to database, causing retrieval to fail

**Fixed Files:**
- `backend/app/routers/documents.py` - Upload endpoint
- `backend/app/models/document.py` - Already had `file_path` column

**Changes:**
```python
# Before
new_doc = Document(
    id=doc_id,
    name=name,
    # ... other fields
)

# After
new_doc = Document(
    id=doc_id,
    name=name,
    file_path=file_path,  # Store full path with extension
    # ... other fields
)
```

### 4. **Backend Endpoints Not Using Stored Path**
**Problem:** Download, preview, and thumbnail endpoints were guessing file extensions instead of using stored path

**Fixed Files:**
- `backend/app/routers/documents.py` - All three endpoints updated

**Changes:**
```python
# Before
file_path = os.path.join(UPLOAD_DIR, f"{doc.id}")

# After
file_path = doc.file_path if doc.file_path else os.path.join(UPLOAD_DIR, f"{doc.id}")
if not os.path.isabs(file_path):
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(file_path))
```

---

## How It Works Now

### Upload Flow:
1. User selects file (e.g., `floorplan.pdf`)
2. Frontend sends file + metadata to `/api/v1/documents`
3. Backend saves file as `uploads/{uuid}.pdf`
4. Backend stores full path in database: `file_path = "uploads/{uuid}.pdf"`

### Preview Flow:
1. User clicks Preview button or hovers over document name
2. Frontend calls `/api/v1/documents/{id}/preview` with auth token
3. Backend looks up document, gets `file_path` from database
4. Backend returns file with correct media type
5. Frontend displays in viewer or hover tooltip

---

## Testing the Fix

### 1. Upload a New Document
```bash
# Login first to get token
TOKEN="your-jwt-token"

# Upload a PDF
curl -X POST http://localhost:8000/api/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "name=ARC-101_Test_Document" \
  -F "discipline=Architecture"
```

### 2. Test Preview Endpoint
```bash
# Should return the PDF file
curl http://localhost:8000/api/v1/documents/{id}/preview \
  -H "Authorization: Bearer $TOKEN" \
  --output preview.pdf
```

### 3. Test Thumbnail Endpoint
```bash
# Should return image (for images) or 404 (for PDFs)
curl http://localhost:8000/api/v1/documents/{id}/thumbnail \
  -H "Authorization: Bearer $TOKEN" \
  --output thumbnail.jpg
```

### 4. Test in Frontend
1. Start frontend: `npm run dev`
2. Login with: `admin@skyline.com` / `admin123`
3. Upload a PDF or image file
4. **Hover** over document name → should show thumbnail
5. **Click** Preview button → should open viewer with file

---

## File Support Matrix

| File Type | Hover Thumbnail | Full Preview | Notes |
|-----------|----------------|--------------|-------|
| PDF | Icon only | ✅ Full PDF | Native browser viewer |
| JPG | ✅ Thumbnail | ✅ Image viewer | Zoom/rotate |
| PNG | ✅ Thumbnail | ✅ Image viewer | Zoom/rotate |
| GIF | ✅ Thumbnail | ✅ Image viewer | Zoom/rotate |
| WebP | ✅ Thumbnail | ✅ Image viewer | Zoom/rotate |
| DWG | Icon only | ❌ | Download to view |
| RVT | Icon only | ❌ | Download to view |
| IFC | Icon only | ❌ | Download to view |
| ZIP | Icon only | ❌ | Download to view |

---

## Backend Endpoints

| Endpoint | Method | Auth | Cache | Description |
|----------|--------|------|-------|-------------|
| `/api/v1/documents/{id}/preview` | GET | ✅ | 1hr | Get file for viewer |
| `/api/v1/documents/{id}/thumbnail` | GET | ✅ | 1hr | Get thumbnail for hover |
| `/api/v1/documents/{id}/download` | GET | ✅ | No | Download original file |

---

## Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| DocumentViewer | `DocumentViewer.tsx` | Full-screen viewer modal |
| DocumentHoverPreview | `DocumentHoverPreview.tsx` | Hover tooltip preview |
| Documents Page | `routes/Documents.tsx` | Main documents list |

---

## Troubleshooting

### Preview Shows "Preview not available"

**Possible Causes:**
1. Old document uploaded before fix (doesn't have file_path stored)
2. File was deleted from uploads directory
3. Wrong file extension

**Solutions:**
1. Upload a new document (will have file_path stored)
2. Check if file exists in `backend/uploads/`
3. Check browser console for errors

### Hover Preview Not Showing

**Possible Causes:**
1. Not an image file (only images show thumbnails)
2. API error (check console)
3. Auth token expired

**Solutions:**
1. Only JPG/PNG/GIF/WebP show thumbnails
2. Refresh page to get new token
3. Check network tab in DevTools

### Download Works But Preview Doesn't

**Cause:** Media type not set correctly

**Solution:** Backend now correctly detects media type:
- `.pdf` → `application/pdf`
- `.jpg/.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.gif` → `image/gif`
- `.webp` → `image/webp`

---

## Status

✅ **All Issues Fixed**

- [x] API URL corrected (uses /api/v1)
- [x] Auth token added to requests
- [x] File path stored in database
- [x] Endpoints use stored file path
- [x] Media types correctly detected
- [x] Error handling improved

---

## Next Steps

### For Old Documents (uploaded before fix)
Documents uploaded before this fix don't have `file_path` stored. Options:

1. **Re-upload** documents (recommended)
2. **Run migration script** to update existing records:

```python
# backend/scripts/update_file_paths.py
from app.db.database import SessionLocal
from app.models.document import Document
import os

UPLOAD_DIR = "uploads"

db = SessionLocal()
docs = db.query(Document).filter(Document.file_path == None).all()

for doc in docs:
    # Try to find file
    for ext in ['.pdf', '.dwg', '.rvt', '.ifc', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.webp']:
        path = os.path.join(UPLOAD_DIR, f"{doc.id}{ext}")
        if os.path.exists(path):
            doc.file_path = path
            break
    db.commit()

print(f"Updated {len(docs)} documents")
```

### Production Enhancements
1. Add PDF thumbnail generation (using pdf2image)
2. Add CAD file preview (using Autodesk Forge)
3. Add image optimization for thumbnails
4. Add CDN support for cached files
5. Add file versioning with diff view
