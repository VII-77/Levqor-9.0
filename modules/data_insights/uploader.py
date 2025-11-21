"""
Google Drive Uploader for Reports
Uploads PDF reports to Google Drive and returns shareable link
"""
import os
import json
from typing import Optional

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaInMemoryUpload
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    print("⚠️ Google API libraries not installed - Drive upload disabled")

def upload_pdf(bytes_data: bytes, filename: str) -> Optional[str]:
    """
    Upload PDF to Google Drive
    
    Args:
        bytes_data: PDF file bytes
        filename: Name for the file
        
    Returns:
        Shareable link or None if upload fails
    """
    if not GOOGLE_AVAILABLE:
        print("⚠️ Google Drive upload skipped - library not available")
        return None
    
    drive_creds = os.environ.get("DRIVE_SERVICE_ACCOUNT_JSON", "").strip()
    folder_id = os.environ.get("REPORTS_DRIVE_FOLDER_ID", "").strip()
    
    if not drive_creds or not folder_id:
        print("⚠️ Google Drive credentials not configured")
        return None
    
    try:
        # Parse service account credentials
        creds_info = json.loads(drive_creds)
        credentials = service_account.Credentials.from_service_account_info(
            creds_info,
            scopes=["https://www.googleapis.com/auth/drive.file"]
        )
        
        # Build Drive service
        service = build("drive", "v3", credentials=credentials)
        
        # File metadata
        file_metadata = {
            "name": filename,
            "parents": [folder_id],
            "mimeType": "application/pdf"
        }
        
        # Upload file
        media = MediaInMemoryUpload(bytes_data, mimetype="application/pdf", resumable=True)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink, webContentLink"
        ).execute()
        
        # Make file publicly accessible
        service.permissions().create(
            fileId=file["id"],
            body={"role": "reader", "type": "anyone"}
        ).execute()
        
        print(f"✅ Uploaded report to Drive: {file['webViewLink']}")
        return file["webViewLink"]
        
    except Exception as e:
        print(f"❌ Drive upload failed: {e}")
        return None
