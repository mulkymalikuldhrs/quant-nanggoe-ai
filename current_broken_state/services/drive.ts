// Google Drive Service for AI Nanggroe
// Target Folder: 1fVA-wg2sQKbpYsRCcRkb99a4vWco5y1s

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const TARGET_FOLDER_ID = '1fVA-wg2sQKbpYsRCcRkb99a4vWco5y1s';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

let tokenClient: any;
let accessToken: string | null = null;
let gapiInited = false;
let gisInited = false;

// --- Initialization ---

export const initDriveApi = (clientId: string, onInit: (success: boolean) => void) => {
  if (!clientId) return;

  const gapiLoaded = () => {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        // We only use the API Key for discovery, token is for access
        apiKey: process.env.API_KEY, 
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      gapiInited = true;
      if (gisInited) onInit(true);
    });
  };

  const gisLoaded = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        accessToken = resp.access_token;
        localStorage.setItem('google_access_token', accessToken || '');
      },
    });
    gisInited = true;
    if (gapiInited) onInit(true);
  };

  gapiLoaded();
  gisLoaded();
};

export const signInToGoogle = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }
};

export const isAuthenticated = () => !!accessToken;

// --- Drive Operations ---

export const listMemoryFiles = async () => {
  if (!accessToken) throw new Error("Neural Link Offline: Drive not connected.");
  try {
    const response = await window.gapi.client.drive.files.list({
      pageSize: 20,
      q: `'${TARGET_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });
    return response.result.files;
  } catch (err) {
    console.error("Drive List Error", err);
    throw err;
  }
};

export const createDoc = async (fileName: string, content: string) => {
  if (!accessToken) throw new Error("Neural Link Offline");
  
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
    parents: [TARGET_FOLDER_ID]
  };

  try {
    const createRes = await window.gapi.client.drive.files.create({
      resource: metadata,
      fields: 'id, webViewLink'
    });
    return createRes.result;
  } catch (err) {
    console.error("Create Doc Error", err);
    throw err;
  }
};

export const createTextFile = async (fileName: string, content: string) => {
    if (!accessToken) throw new Error("Neural Link Offline");

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const metadata = {
        'name': fileName,
        'mimeType': 'text/plain', 
        'parents': [TARGET_FOLDER_ID]
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain\r\n\r\n' +
        content +
        close_delim;

    try {
        const response = await window.gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        return response.result;
    } catch (e) {
        console.error("Upload Error", e);
        throw e;
    }
}

export const updateTextFile = async (fileId: string, content: string) => {
    if (!accessToken) throw new Error("Neural Link Offline");

    try {
        const response = await window.gapi.client.request({
            'path': `/upload/drive/v3/files/${fileId}`,
            'method': 'PATCH',
            'params': {'uploadType': 'media'},
            'headers': {
                'Content-Type': 'text/plain'
            },
            'body': content
        });
        return response.result;
    } catch (e) {
        console.error("Update Error", e);
        throw e;
    }
}

export const readFileContent = async (fileNameOrId: string) => {
    if (!accessToken) throw new Error("Neural Link Offline");
    
    let fileId = fileNameOrId;
    
    // If it looks like a name, search for ID
    if (!fileNameOrId.match(/^[a-zA-Z0-9_-]{20,}$/)) {
         const response = await window.gapi.client.drive.files.list({
            q: `name = '${fileNameOrId}' and '${TARGET_FOLDER_ID}' in parents and trashed = false`,
            fields: 'files(id, name)',
        });
        if (response.result.files && response.result.files.length > 0) {
            fileId = response.result.files[0].id;
        } else {
            return "File not found in Neural Memory.";
        }
    }

    try {
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return typeof response.result === 'string' ? response.result : JSON.stringify(response.result);
    } catch (e) {
        return "Error reading file. It might be a native Google Doc which requires export.";
    }
}