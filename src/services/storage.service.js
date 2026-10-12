const { getBucket } = require('../config/firebase');
const path = require('path');

class StorageService {
  async uploadPhoto(file, folder = 'photos') {
    const bucket = getBucket();
    
    if (!bucket) {
      throw new Error('Firebase Storage not configured');
    }

    const fileName = `${folder}/${Date.now()}-${path.basename(file.originalname)}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make file public
          await fileUpload.makePublic();
          
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  }

  async deletePhoto(fileUrl) {
    const bucket = getBucket();
    
    if (!bucket) {
      throw new Error('Firebase Storage not configured');
    }

    try {
      const fileName = fileUrl.split(`${bucket.name}/`)[1];
      if (fileName) {
        await bucket.file(fileName).delete();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  async uploadDocument(file, folder = 'documents') {
    return await this.uploadPhoto(file, folder);
  }
}

module.exports = new StorageService();
